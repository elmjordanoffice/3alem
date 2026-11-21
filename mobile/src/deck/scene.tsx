import * as React from "react";
import { Keyboard, View } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn } from "react-native-reanimated";
import { Check, Lock, RotateCw, WifiOff } from "lucide-react-native";
import type { ItemView, ResponseContent, SubmitPayload } from "../api/types";
import { useLocale, useT } from "../i18n";
import { radius, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { newClientId } from "../lib/ids";
import type { SaveState } from "../state/drafts";
import { IntegrityContext, useIntegrity } from "../state/integrity";
import { Button } from "../ui/button";
import { hairline, Notice } from "../ui/primitives";
import { T } from "../ui/text";
import { useChoiceTask } from "../tasks/choice";
import { useAllocationTask, useRankingTask } from "../tasks/ranking";
import { useDesignTask, useFollowUp, useWrittenTask } from "../tasks/written";
import { useChainTask, useForcedChoiceTask } from "../tasks/sequence";
import { useInboxTask } from "../tasks/inbox";
import { useRoleplayTask } from "../tasks/roleplay";
import type { SlideSpec, TaskContext, TaskResult } from "../tasks/types";
import { Glass, NextHint, QuietTimer, SlideRail, TopBar, useDeckInsets } from "./chrome";
import { MATERIAL_ICONS, MaterialView } from "./materials";
import { Pager } from "./pager";
import type { PagerHandle } from "./pager-context";
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

export interface SceneActions {
  submit: (p: SubmitPayload) => Promise<{ ok: boolean; offline?: boolean }>;
  sendTurn: (itemId: string, text: string, clientId: string) => Promise<{ ok: boolean; reply?: string; ended?: boolean }>;
}

/**
 * One scene as a vertical deck of full-screen pages: the situation, each
 * material, then the task. Follow-ups arrive as new pages below and the deck
 * springs to them; the answered task folds into a sealed "Answer sent" page.
 * Within the scene you can swipe back up to reread; earlier scenes are gone.
 */
export function SceneScreen({ view, actions, online }: { view: ItemView; actions: SceneActions; online: boolean }) {
  const { item } = view;
  const { content, stage } = item;
  const t = useT("candidate");
  const tm = useT("mobile.deck");
  const { dir } = useLocale();
  const { c } = useTheme();
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
  const [index, setIndex] = React.useState(0);

  const next = React.useCallback(() => pager.current?.goTo(index + 1), [index]);
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

  // ── The pages ────────────────────────────────────────────────────────────
  const all: SlideSpec[] = [
    { key: "cover", node: <Cover title={content.title} scenario={content.scenario} materials={content.materials.map((m) => m.kind)} /> },
    ...content.materials.map((m, i) => ({
      key: `material-${m.id}`,
      node: <MaterialPage label={tm("material", { n: i + 1, total: content.materials.length })} kind={m.kind}>{<MaterialView material={m} />}</MaterialPage>,
    })),
  ];
  if (stage === "MAIN") all.push(...main.slides);
  else {
    all.push({ key: "sealed-main", node: <Sealed summary={main.summary} /> });
    if (stage === "TWIST" && content.probe) all.push({ key: "sealed-probe", node: <Sealed summary={probe.summary} compact /> });
    all.push(...(stage === "PROBE" ? probe.slides : twist.slides));
  }
  // A gate hides everything after it until it's answered.
  const gateAt = all.findIndex((s) => s.gate);
  const slides = gateAt >= 0 ? all.slice(0, gateAt + 1) : all;
  keys.current = slides.map((s) => s.key);
  const lastIsTask = gateAt < 0;

  // ── A new stage of the same scene: fold the answer in, spring to the follow-up.
  const firstStage = React.useRef(true);
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
    setIndex(Math.max(0, sealedAt));
    const id = setTimeout(() => pager.current?.goTo(keys.current.length - 1), 520);
    return () => clearTimeout(id);
  }, [stage]); // eslint-disable-line react-hooks/exhaustive-deps

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
  const contentStyle = { paddingTop: insets.top + 6, paddingHorizontal: 20, width: "100%" as const, maxWidth: 640, alignSelf: "center" as const };

  return (
    <IntegrityContext.Provider value={integrity}>
      <View style={{ flex: 1, direction: dir, backgroundColor: c.canvas }}>
        <Pager ref={pager} onIndexChange={setIndex} onEdge={onEdge} enabled={paging} testID="deck">
          {slides.map((s, i) => {
            const last = i === slides.length - 1;
            const footer = last && lastIsTask ? <SubmitBar ready={Boolean(value)} label={stage === "MAIN" && content.probe ? t("item.continue") : t("item.submit")} loading={submitting} onPress={doSubmit} failure={failure} online={online} /> : null;
            return (
              <Slide key={s.key} footer={footer} inactive={i !== index} testID={`slide-${s.key}`} contentStyle={[contentStyle, { paddingBottom: last && lastIsTask ? 190 + insets.bottom : insets.bottom + 8 }]}>
                <View style={{ flexGrow: 1 }}>{s.node}</View>
                {!last ? <NextHint first={i === 0} label={tm("next")} onPress={() => pager.current?.goTo(i + 1)} /> : null}
              </Slide>
            );
          })}
        </Pager>
        <SlideRail count={slides.length} index={index} />
        <TopBar orgName={view.branding.orgName} chapters={view.world.chapters.map((ch) => ch.title)} chapterIndex={view.chapterIndex} save={online ? save : "offline"} timer={deadline ? <QuietTimer deadline={deadline} onExpire={() => setTimeUp(true)} /> : undefined} />
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
    </IntegrityContext.Provider>
  );
}

function Cover({ title, scenario, materials }: { title: string; scenario: string; materials: string[] }) {
  const tm = useT("mobile");
  const { c } = useTheme();
  return (
    <View style={{ gap: 18, flexGrow: 1, justifyContent: "center", paddingBottom: 24 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ width: 28, height: 3, borderRadius: 2, backgroundColor: c.signal }} />
        <T variant="label" tone="secondary">
          {tm("deck.scenario")}
        </T>
      </View>
      <T variant="title" accessibilityRole="header">
        {title}
      </T>
      <T variant="body">{scenario}</T>
      {materials.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
          {materials.map((k, i) => {
            const Icon = MATERIAL_ICONS[k as keyof typeof MATERIAL_ICONS];
            return (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 30, borderRadius: radius.pill, borderWidth: hairline, borderColor: c.hairlineStrong }}>
                {Icon ? <Icon size={14} color={c.secondary} strokeWidth={1.8} /> : null}
                <T variant="caption" tone="secondary">
                  {tm(`materials.${k}`)}
                </T>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function MaterialPage({ label, kind, children }: { label: string; kind: string; children: React.ReactNode }) {
  const { c } = useTheme();
  const tm = useT("mobile.materials");
  const Icon = MATERIAL_ICONS[kind as keyof typeof MATERIAL_ICONS];
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {Icon ? <Icon size={15} color={c.tertiary} strokeWidth={1.8} /> : null}
        <T variant="label" tone="secondary">
          {tm(kind)}
        </T>
        <T variant="caption" tone="tertiary" style={{ marginStart: "auto" }}>
          {label}
        </T>
      </View>
      {children}
    </View>
  );
}

/** The answered task, folded: a check, and a digest you can reread. */
function Sealed({ summary, compact }: { summary: React.ReactNode; compact?: boolean }) {
  const { c } = useTheme();
  const tm = useT("mobile.deck");
  return (
    <View style={{ gap: 20, flexGrow: 1, justifyContent: compact ? "flex-start" : "center" }}>
      <View style={{ alignItems: "flex-start", gap: 14 }}>
        <Animated.View entering={ZoomIn.springify().damping(14)} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.text, alignItems: "center", justifyContent: "center" }}>
          <Check size={26} color={c.canvas} strokeWidth={3} />
        </Animated.View>
        <T variant="title" accessibilityRole="header">
          {tm("sent")}
        </T>
        <T variant="callout" tone="secondary">
          {tm("sentBody")}
        </T>
      </View>
      <View style={{ padding: 16, gap: 10, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline }}>
        <T variant="label" tone="tertiary">
          {tm("yourAnswer")}
        </T>
        {summary}
      </View>
    </View>
  );
}

function SubmitBar({ ready, label, loading, onPress, failure, online }: { ready: boolean; label: string; loading: boolean; onPress: () => void; failure: null | "offline" | "failed"; online: boolean }) {
  const t = useT("candidate.item");
  const { bottom } = useDeckInsets();
  const lift = useKeyboardLift(bottom);
  return (
    <Animated.View style={[{ position: "absolute", left: 0, right: 0, bottom: 0 }, lift]}>
      <Glass edge="top" style={{ paddingTop: 12, paddingBottom: bottom + 8, paddingHorizontal: 20 }}>
        <View style={{ gap: 10, width: "100%", maxWidth: 600, alignSelf: "center" }}>
          {failure ? (
            <Notice tone={failure === "offline" || !online ? "warning" : "critical"} icon={failure === "offline" ? WifiOff : undefined} action={<Button size="sm" variant="secondary" icon={RotateCw} label={t("retry")} onPress={onPress} />}>
              {failure === "offline" || !online ? t("offline") : t("submitError")}
            </Notice>
          ) : (
            <T variant="footnote" tone="tertiary">
              {ready ? t("readyHint") : t("incompleteHint")}
            </T>
          )}
          <Button testID="submit" variant="primary" label={label} onPress={onPress} disabled={!ready} loading={loading} full />
        </View>
      </Glass>
    </Animated.View>
  );
}
