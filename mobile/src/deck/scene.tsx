import * as React from "react";
import { Keyboard, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Extrapolation, FadeIn, FadeOut, interpolate, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { Lock, RotateCw, WifiOff } from "lucide-react-native";
import type { ItemView, ResponseContent, SubmitPayload } from "../api/types";
import { useLocale, useT } from "../i18n";
import { radius, spring, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { newClientId } from "../lib/ids";
import { kv } from "../lib/storage";
import { AcceptedContext } from "../state/assessment";
import type { SaveState } from "../state/drafts";
import { IntegrityContext, useIntegrity } from "../state/integrity";
import { Button } from "../ui/button";
import { DrawnCheck, FADE } from "../ui/motion";
import { hairline, Notice } from "../ui/primitives";
import { T } from "../ui/text";
import { useChoiceTask } from "../tasks/choice";
import { TaskKindContext } from "../tasks/parts";
import { useAllocationTask, useRankingTask } from "../tasks/ranking";
import { useDesignTask, useFollowUp, useWrittenTask } from "../tasks/written";
import { useChainTask, useForcedChoiceTask } from "../tasks/sequence";
import { useInboxTask } from "../tasks/inbox";
import { useRoleplayTask } from "../tasks/roleplay";
import type { SlideSpec, TaskContext, TaskResult } from "../tasks/types";
import type { CardTone } from "./card-surface";
import { Glass, NextHint, QuietTimer, SlideRail, TOPBAR_H, TopBar, useDeckInsets } from "./chrome";
import { Cover } from "./cover";
import { createIndexStore, useIsCurrentPage, usePageIndex, type IndexStore } from "./index-store";
import { MaterialCard } from "./materials";
import { Pager } from "./pager";
import { CARD_PAD, useCardGeometry, type PagerHandle } from "./pager-context";
import { Slide } from "./slide";
import { useKeyboardLift } from "./keyboard";

const TASKS: Record<string, (ctx: TaskContext) => TaskResult> = {
  choice: useChoiceTask,
  ranking: useRankingTask,
  allocation: useAllocationTask,
  written: useWrittenTask,
  design: useDesignTask,
  inbox: useInboxTask,
  chain: useChainTask,
  forced_choice: useForcedChoiceTask,
  roleplay: useRoleplayTask,
};

/** Set once the first-card swipe hint has played on this device. */
const SWIPE_HINT_KEY = "aalim:deck:swipeHint";

export interface SceneActions {
  submit: (p: SubmitPayload) => Promise<{ ok: boolean; offline?: boolean }>;
  sendTurn: (itemId: string, text: string, clientId: string) => Promise<{ ok: boolean; reply?: string; ended?: boolean }>;
}

/**
 * One scene as a stack of cards you swipe up through: the situation (an ink
 * card with the scene's art), each material on paper, then the task. Follow-ups
 * arrive as new cards below and the deck springs to them; the answered task
 * folds into a sealed "Answer sent" card. Within the scene you can swipe back
 * down to reread; earlier scenes are gone.
 */
export function SceneScreen({ view, actions, online }: { view: ItemView; actions: SceneActions; online: boolean }) {
  const { item } = view;
  const { content, stage } = item;
  const t = useT("candidate");
  const tm = useT("mobile.deck");
  const { dir } = useLocale();
  const { c, reduceMotion } = useTheme();
  const insets = useDeckInsets();
  const integrity = useIntegrity();
  const pager = React.useRef<PagerHandle>(null);

  const [save, setSave] = React.useState<SaveState>("saved");
  const [submitting, setSubmitting] = React.useState(false);
  const [failure, setFailure] = React.useState<null | "offline" | "failed">(null);
  const [paging, setPaging] = React.useState(true);
  const [timeUp, setTimeUp] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const keys = React.useRef<string[]>([]);
  // The current page lives outside React state, so paging never re-renders the scene.
  const pages = React.useMemo(() => createIndexStore(0), []);

  const next = React.useCallback(() => pager.current?.goTo(pages.get() + 1), [pages]);
  const goToKey = React.useCallback((key: string) => {
    const i = keys.current.indexOf(key);
    if (i >= 0) pager.current?.goTo(i);
  }, []);
  const sendTurn = React.useCallback((text: string, clientId: string) => actions.sendTurn(item.id, text, clientId), [actions, item.id]);

  const ctx: TaskContext = { item, content, stage, locked: submitting || stage !== "MAIN", onSaveState: setSave, next, goToKey, timeUp, setPagingEnabled: setPaging, sendTurn };
  // The kind never changes for a scene (the screen is keyed by item id), so the hook order is stable.
  const main = (TASKS[content.task.kind] ?? useWrittenTask)(ctx);
  const probe = useFollowUp({ ...ctx, locked: submitting }, "PROBE");
  const twist = useFollowUp({ ...ctx, locked: submitting }, "TWIST");

  const value: ResponseContent | null = stage === "MAIN" ? main.value : stage === "PROBE" ? probe.value : twist.value;

  // ── Moments of progress ──────────────────────────────────────────────────
  // The server has this stage's answer and it leads out of the scene: the
  // button draws a check as the scene leaves; a chapter's last answer also
  // fills the chapter on the rail.
  const accepted = React.useContext(AcceptedContext);
  const sent = accepted !== null && accepted.itemId === item.id && accepted.stage === stage && accepted.next !== "followUp";
  const chapterDone = sent && (accepted.next === "transition" || accepted.next === "complete");
  // False only for the stage the scene opened on, so a sealed page reopened after a restart doesn't replay its flourish.
  const firstStage = React.useRef(true);
  // The first time the deck comes to rest on the task, the page dots ripple: you've arrived.
  const taskAt = stage === "MAIN" ? 1 + content.materials.length : -1;
  const arrived = React.useRef(false);
  const [pulse, setPulse] = React.useState(0);
  const onSettle = React.useCallback(
    (i: number) => {
      if (arrived.current || i !== taskAt) return;
      arrived.current = true;
      setPulse((p) => p + 1);
    },
    [taskAt],
  );

  // ── The cards ────────────────────────────────────────────────────────────
  // The situation and the materials are memoised: they render once per scene.
  const chapter = view.world.chapters[view.chapterIndex]?.title ?? "";
  const kinds = content.materials.map((m) => m.kind).join(",");
  const all: SlideSpec[] = [
    { key: "cover", tone: "ink", node: <Cover title={content.title} scenario={content.scenario} kinds={kinds} chapter={chapter} cast={view.world.cast} /> },
    ...content.materials.map((m, i) => ({ key: `material-${m.id}`, node: <MaterialCard material={m} n={i + 1} total={content.materials.length} company={view.world.companyName} /> })),
  ];
  if (stage === "MAIN") all.push(...main.slides);
  else {
    all.push({ key: "sealed-main", node: <Sealed summary={main.summary} fresh={!firstStage.current} /> });
    if (stage === "TWIST" && content.probe) all.push({ key: "sealed-probe", node: <Sealed summary={probe.summary} compact fresh={!firstStage.current} /> });
    all.push(...(stage === "PROBE" ? probe.slides : twist.slides));
  }
  // A gate hides everything after it until it's answered.
  const gateAt = all.findIndex((s) => s.gate);
  const slides = gateAt >= 0 ? all.slice(0, gateAt + 1) : all;
  keys.current = slides.map((s) => s.key);
  const lastIsTask = gateAt < 0;

  // ── A new stage of the same scene: fold the answer in, spring to the follow-up.
  React.useLayoutEffect(() => {
    if (firstStage.current) {
      firstStage.current = false;
      // Re-opened mid-scene (app restart): land on the live follow-up.
      if (stage !== "MAIN") pager.current?.goTo(slides.length - 1, { animated: false });
      return;
    }
    setSubmitting(false);
    setFailure(null);
    setTimeUp(false);
    integrity.reset();
    const sealedAt = keys.current.lastIndexOf(stage === "TWIST" && content.probe ? "sealed-probe" : "sealed-main");
    pager.current?.goTo(Math.max(0, sealedAt), { animated: false });
    pages.set(Math.max(0, sealedAt));
    const id = setTimeout(() => pager.current?.goTo(keys.current.length - 1), 520);
    return () => clearTimeout(id);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── The very first card on this device: a one-time "swipe up" nudge, then never again.
  React.useEffect(() => {
    if (reduceMotion || stage !== "MAIN") return;
    let live = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    void kv.get<boolean>(SWIPE_HINT_KEY).then((seen) => {
      if (seen || !live) return;
      timer = setTimeout(() => {
        if (pages.get() !== 0) return;
        pager.current?.nudge();
        void kv.set(SWIPE_HINT_KEY, true);
      }, 1100);
    });
    return () => {
      live = false;
      if (timer) clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const onEdge = (e: "start" | "end") => {
    haptic.boundary();
    if (e === "start") showToast(tm("sealed"));
    else if (!lastIsTask) showToast(content.task.kind === "forced_choice" ? tm("finishPairs") : tm("pickToContinue"));
  };

  const doSubmit = async () => {
    if (!value || submitting) return;
    Keyboard.dismiss();
    const payload: SubmitPayload = { itemId: item.id, stage, clientId: newClientId(), content: value, durationMs: integrity.elapsedMs(), events: integrity.take() };
    setSubmitting(true);
    setFailure(null);
    const res = await actions.submit(payload);
    if (!res.ok) {
      setSubmitting(false);
      setFailure(res.offline ? "offline" : "failed");
      setSave(res.offline ? "offline" : "error");
      haptic.error();
    }
  };

  const deadline = stage === "MAIN" && item.timed && content.timeLimitSeconds ? new Date(item.presentedAt).getTime() + content.timeLimitSeconds * 1000 : null;
  // The resting card sits just under the floating bar.
  const cards = React.useMemo(() => ({ top: insets.safeTop + TOPBAR_H + 4 }), [insets.safeTop]);
  const goTo = React.useCallback((i: number) => pager.current?.goTo(i), []);

  return (
    <IntegrityContext.Provider value={integrity}>
      <TaskKindContext.Provider value={content.task.kind}>
        <View style={{ flex: 1, direction: dir, backgroundColor: c.canvas }}>
          <Pager ref={pager} cards={cards} onIndexChange={pages.set} onSettle={onSettle} onEdge={onEdge} enabled={paging} testID="deck">
            {slides.map((s, i) => {
              const last = i === slides.length - 1;
              const withSubmit = last && lastIsTask;
              const ink = s.tone === "ink";
              const footer = withSubmit ? <SubmitBar ready={Boolean(value)} label={stage === "MAIN" && content.probe ? t("item.continue") : t("item.submit")} loading={submitting} done={sent} onPress={doSubmit} failure={failure} online={online} /> : null;
              const contentStyle: StyleProp<ViewStyle> = ink ? { paddingBottom: 12 } : { paddingTop: CARD_PAD, paddingHorizontal: CARD_PAD, paddingBottom: withSubmit ? 156 : 12 };
              return (
                <DeckSlide key={s.key} i={i} pages={pages} tone={s.tone ?? "paper"} footer={footer} testID={`slide-${s.key}`} contentStyle={contentStyle}>
                  <View style={{ flexGrow: 1 }}>{s.node}</View>
                  {!last ? <NextHint first={i === 0} onInk={ink} label={tm("next")} onPress={() => goTo(i + 1)} /> : null}
                </DeckSlide>
              );
            })}
          </Pager>
          <Rail pages={pages} count={slides.length} pulse={pulse} />
          <TopBar orgName={view.branding.orgName} chapters={view.world.chapters.map((ch) => ch.title)} chapterIndex={view.chapterIndex} save={online ? save : "offline"} chapterDone={chapterDone} timer={deadline ? <QuietTimer deadline={deadline} onExpire={() => setTimeUp(true)} /> : undefined} />
          {toast ? (
            <Animated.View entering={FadeIn.duration(160)} exiting={FadeOut.duration(200)} pointerEvents="none" style={{ position: "absolute", top: insets.top + 8, left: 20, right: 20, alignItems: "center", zIndex: 20 }}>
              <View accessibilityLiveRegion="polite" style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: c.text, maxWidth: 420 }}>
                <Lock size={14} color={c.canvas} />
                <T variant="footnote" style={{ color: c.canvas, flexShrink: 1 }}>
                  {toast}
                </T>
              </View>
            </Animated.View>
          ) : null}
        </View>
      </TaskKindContext.Provider>
    </IntegrityContext.Provider>
  );
}

/** A card of the deck that hides from screen readers unless it is the current one (re-rendering only when that flips). */
function DeckSlide({ i, pages, tone, footer, contentStyle, testID, children }: { i: number; pages: IndexStore; tone: CardTone; footer: React.ReactNode; contentStyle: StyleProp<ViewStyle>; testID: string; children: React.ReactNode }) {
  const current = useIsCurrentPage(pages, i);
  return (
    <Slide tone={tone} footer={footer} inactive={!current} testID={testID} contentStyle={contentStyle}>
      {children}
    </Slide>
  );
}

/** The page dots, the only part of the scene that follows every page change. */
function Rail({ pages, count, pulse }: { pages: IndexStore; count: number; pulse: number }) {
  const index = usePageIndex(pages);
  return <SlideRail count={count} index={index} pulse={pulse} />;
}

/** The answered task, folded: a check, and a digest you can reread. `fresh`: it was sealed just now, so the seal plays. */
function Sealed({ summary, compact, fresh }: { summary: React.ReactNode; compact?: boolean; fresh?: boolean }) {
  const { c } = useTheme();
  const tm = useT("mobile.deck");
  return (
    <View style={{ gap: 20, flexGrow: 1, justifyContent: compact ? "flex-start" : "center" }}>
      <View style={{ alignItems: "flex-start", gap: 14 }}>
        <Seal play={Boolean(fresh)} />
        <T variant="title" accessibilityRole="header">
          {tm("sent")}
        </T>
        <T variant="callout" tone="secondary">
          {tm("sentBody")}
        </T>
      </View>
      <View style={{ padding: 16, gap: 10, borderRadius: radius.card, backgroundColor: c.surfaceSubtle, borderWidth: hairline, borderColor: c.hairline }}>
        <T variant="label" tone="tertiary">
          {tm("yourAnswer")}
        </T>
        {summary}
      </View>
    </View>
  );
}

const SEAL = 52;
const SEAL_DOT = 14;

/**
 * The seal: an ink disc settles, its check draws itself, and a small vermilion
 * dot drops into the corner (the trailing one, so it mirrors in Arabic). About
 * 530 ms, all on the UI thread; it never holds the deck, which springs on to a
 * follow-up at 520 ms as before. The success haptic fires when the server
 * accepts the answer, the same instant. Under reduced motion: a fade.
 */
function Seal({ play }: { play: boolean }) {
  const { c, reduceMotion } = useTheme();
  const disc = useSharedValue(play ? 0 : 1);
  const dot = useSharedValue(play ? 0 : 1);
  React.useEffect(() => {
    if (!play) return;
    if (reduceMotion) {
      disc.value = withTiming(1, FADE);
      dot.value = withDelay(80, withTiming(1, FADE));
      return;
    }
    disc.value = withSpring(1, spring.pop);
    dot.value = withDelay(260, withSpring(1, spring.settle));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const discStyle = useAnimatedStyle(() =>
    reduceMotion ? { opacity: disc.value } : { opacity: interpolate(disc.value, [0, 0.35], [0, 1], Extrapolation.CLAMP), transform: [{ scale: 0.6 + 0.4 * disc.value }] },
  );
  const dotStyle = useAnimatedStyle(() =>
    reduceMotion ? { opacity: dot.value } : { opacity: interpolate(dot.value, [0, 0.3], [0, 1], Extrapolation.CLAMP), transform: [{ translateY: -14 * (1 - dot.value) }, { scale: 0.4 + 0.6 * dot.value }] },
  );
  return (
    <View style={{ width: SEAL, height: SEAL }}>
      <Animated.View style={[{ width: SEAL, height: SEAL, borderRadius: SEAL / 2, backgroundColor: c.text, alignItems: "center", justifyContent: "center" }, discStyle]}>
        <DrawnCheck size={32} color={c.canvas} strokeWidth={2.4} delay={90} duration={300} still={!play} />
      </Animated.View>
      <Animated.View style={[{ position: "absolute", top: -2, end: -2, width: SEAL_DOT, height: SEAL_DOT, borderRadius: SEAL_DOT / 2, backgroundColor: c.signal, borderWidth: 2.5, borderColor: c.surface }, dotStyle]} />
    </View>
  );
}

function SubmitBar({ ready, label, loading, done, onPress, failure, online }: { ready: boolean; label: string; loading: boolean; done: boolean; onPress: () => void; failure: null | "offline" | "failed"; online: boolean }) {
  const t = useT("candidate.item");
  const tm = useT("mobile.deck");
  const { bottom } = useDeckInsets();
  // Inside a card the bar sits on the card's bottom edge, which is the peek and the gap above the screen's.
  const card = useCardGeometry();
  const lift = useKeyboardLift(card ? card.bottomGap : bottom);
  return (
    <Animated.View style={[{ position: "absolute", left: 0, right: 0, bottom: 0 }, lift]}>
      <Glass edge="top" style={{ paddingTop: 12, paddingBottom: card ? 14 : bottom + 8, paddingHorizontal: card ? CARD_PAD : 20 }}>
        <View style={{ gap: 10, width: "100%", maxWidth: 600, alignSelf: "center" }}>
          {failure ? (
            <Notice tone={failure === "offline" || !online ? "warning" : "critical"} icon={failure === "offline" ? WifiOff : undefined} action={<Button size="sm" variant="secondary" icon={RotateCw} label={t("retry")} onPress={onPress} />}>
              {failure === "offline" || !online ? t("offline") : t("submitError")}
            </Notice>
          ) : (
            <T variant="footnote" tone="tertiary" accessibilityLiveRegion={done ? "polite" : undefined}>
              {done ? tm("sent") : ready ? t("readyHint") : t("incompleteHint")}
            </T>
          )}
          <Button testID="submit" variant="primary" label={label} accessibilityLabel={done ? tm("sent") : undefined} onPress={onPress} disabled={!ready} loading={loading} done={done} full />
        </View>
      </Glass>
    </Animated.View>
  );
}
