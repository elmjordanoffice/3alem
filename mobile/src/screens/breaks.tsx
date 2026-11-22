import * as React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { Clock, Link2Off, PauseCircle, WifiOff, type LucideIcon } from "lucide-react-native";
import type { Branding, View as V } from "../api/types";
import { useLocale, useT } from "../i18n";
import { palette, spring, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { Button } from "../ui/button";
import { Narrowing } from "../ui/brand";
import { ARRIVE, Entrance, FADE, OUT, Swap, useEntrance, useOnce } from "../ui/motion";
import { T } from "../ui/text";
import { OrgHeader, Screen } from "./scaffold";

/**
 * "Day 1" out of a chapter title like "Day 1: The brief" (or "اليوم الأول: الإحاطة"),
 * when the title is in the screen's language and starts with its day.
 */
export function dayOf(title: string | undefined, rtl: boolean): string | null {
  const head = title?.match(/^\s*([^:：]{2,32}?)\s*[:：]/)?.[1];
  if (!head) return null;
  return (rtl ? /^(اليوم|اليومان)\s/ : /^days?\s+\d/i).test(head) ? head : null;
}

// The beats of a chapter break, after the screen has risen into place.
const BEAT = { stamp: ARRIVE, rail: ARRIVE + 200, title: ARRIVE + 280, decisions: ARRIVE + 560, stagger: 110 };

/**
 * A chapter break as a story beat: a "Day 1 done" stamp lands (with a light
 * haptic), the chapter rail fills to the new position, the next chapter's
 * title rises in and your decisions so far are dealt in one by one from the
 * reading side. Pause and Continue stay where they always are.
 */
export function Transition({ v, onContinue, onPause }: { v: V<"transition">; onContinue: () => Promise<void>; onPause: () => Promise<void> }) {
  const t = useT("candidate.transition");
  const tm = useT("mobile.breaks");
  const { rtl } = useLocale();
  const ch = v.world.chapters[v.chapterIndex];
  const doneAt = v.chapterIndex - 1;
  const day = dayOf(v.world.chapters[doneAt]?.title, rtl);
  const stamp = doneAt < 0 ? null : day ? tm("dayDone", { day }) : tm("chapterDone", { n: doneAt + 1 });
  const decisionsEnd = BEAT.decisions + v.recap.length * BEAT.stagger;
  const [pending, setPending] = React.useState<"go" | "pause" | null>(null);
  const run = (k: "go" | "pause", fn: () => Promise<void>) => async () => {
    setPending(k);
    try {
      await fn();
    } catch {
      setPending(null);
    }
  };
  return (
    <Screen
      ink
      testID="screen-transition"
      header={<OrgHeader branding={v.branding} onInk />}
      bar={
        <>
          <Button testID="chapter-continue" variant="primary" label={t("start", { n: v.chapterIndex + 1 })} loading={pending === "go"} disabled={pending === "pause"} onPress={run("go", onContinue)} full />
          <Button testID="chapter-pause" variant="onInk" icon={PauseCircle} label={t("pause")} loading={pending === "pause"} disabled={pending === "go"} onPress={run("pause", onPause)} full />
        </>
      }
      contentStyle={{ justifyContent: "flex-start" }}
    >
      <View style={{ gap: 18, marginTop: 16 }}>
        {stamp ? <Stamp label={stamp} delay={BEAT.stamp} /> : null}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <Entrance delay={BEAT.rail} style={{ flexShrink: 1 }}>
            <T variant="subhead" tone="inkSecondary">
              {t("eyebrow")}
            </T>
          </Entrance>
          <ChapterFill count={v.world.chapters.length} current={v.chapterIndex} delay={BEAT.rail} />
        </View>
        <Entrance delay={BEAT.title} y={22} style={{ gap: 14 }}>
          <T variant="display" tone="inkForeground" accessibilityRole="header">
            {ch?.title}
          </T>
          <T variant="body" tone="inkSecondary">
            {ch?.summary}
          </T>
        </Entrance>
      </View>
      {v.recap.length ? (
        <Entrance delay={BEAT.decisions - 80} style={{ gap: 12, paddingTop: 22, borderTopWidth: 1, borderColor: "rgba(242,240,235,0.14)" }}>
          <T variant="headline" tone="inkForeground">
            {t("soFar")}
          </T>
          {v.recap.map((r, i) => (
            <Decision key={r} text={r} delay={BEAT.decisions + i * BEAT.stagger} />
          ))}
          <Entrance delay={decisionsEnd + 60}>
            <T variant="footnote" tone="inkSecondary" style={{ opacity: 0.8 }}>
              {t("carryForward")}
            </T>
          </Entrance>
        </Entrance>
      ) : null}
    </Screen>
  );
}

/**
 * The stamp: it comes down from a little above the page, a touch larger and
 * more turned, and lands at a slight tilt toward the reading start (mirrored
 * in Arabic), with a light haptic on contact. Bone ink on the ink screen; its
 * dot is the one vermilion mark.
 */
function Stamp({ label, delay }: { label: string; delay: number }) {
  const { reduceMotion } = useTheme();
  const { rtl } = useLocale();
  const p = useSharedValue(0);
  const tilt = rtl ? 2.5 : -2.5;
  React.useEffect(() => {
    p.value = reduceMotion ? withTiming(1, FADE) : withDelay(delay, withSpring(1, spring.land));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useOnce(() => {
    "worklet";
    return p.value >= 0.96;
  }, haptic.settle);
  const style = useAnimatedStyle(() =>
    reduceMotion
      ? { opacity: p.value, transform: [{ rotate: `${tilt}deg` }] }
      : {
          opacity: interpolate(p.value, [0, 0.3], [0, 1], Extrapolation.CLAMP),
          transform: [{ scale: 1.55 - 0.55 * p.value }, { rotate: `${tilt * (1 + 1.6 * (1 - p.value))}deg` }],
        },
  );
  return (
    <Animated.View accessibilityRole="text" style={[{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 10, paddingStart: 12, paddingEnd: 14, paddingVertical: rtl ? 4 : 8, borderRadius: 10, borderWidth: 1.5, borderColor: "rgba(242,240,235,0.88)" }, style]}>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: palette.signal }} />
      <T variant="displaySm" tone="inkForeground">
        {label}
      </T>
    </Animated.View>
  );
}

const SEG = 22;
const FAINT = "rgba(242,240,235,0.16)";

/** The chapter rail on a break: the chapter just finished fills from the reading start; then the next one lights. */
function ChapterFill({ count, current, delay }: { count: number; current: number; delay: number }) {
  const { reduceMotion } = useTheme();
  const fill = useSharedValue(0);
  const next = useSharedValue(0);
  React.useEffect(() => {
    if (reduceMotion) {
      fill.value = withTiming(1, FADE);
      next.value = withTiming(1, FADE);
      return;
    }
    fill.value = withDelay(delay, withSpring(1, { ...spring.rise, overshootClamping: true }));
    next.value = withDelay(delay + 280, withTiming(1, { duration: 280, easing: OUT }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // `start: 0` is the reading start, so in Arabic the fill runs right to left.
  const fillStyle = useAnimatedStyle(() => (reduceMotion ? { width: SEG, opacity: fill.value } : { width: SEG * fill.value }));
  const nextStyle = useAnimatedStyle(() => ({ opacity: next.value }));
  const seg = { width: SEG, height: 4, borderRadius: 2, overflow: "hidden" as const };
  return (
    <View style={{ flexDirection: "row", gap: 4 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, i) =>
        i < current - 1 ? (
          <View key={i} style={[seg, { backgroundColor: palette.signal }]} />
        ) : i === current - 1 ? (
          <View key={i} style={[seg, { backgroundColor: palette.bone }]}>
            <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, start: 0, backgroundColor: palette.signal }, fillStyle]} />
          </View>
        ) : i === current ? (
          <View key={i} style={[seg, { backgroundColor: FAINT }]}>
            <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: palette.bone }, nextStyle]} />
          </View>
        ) : (
          <View key={i} style={[seg, { backgroundColor: FAINT }]} />
        ),
      )}
    </View>
  );
}

/** One of "your decisions so far": its dot sets down, then the line slides in from the reading start. */
function Decision({ text, delay }: { text: string; delay: number }) {
  const { rtl } = useLocale();
  const dot = useEntrance({ delay, scale: 0.2, config: spring.pop });
  const line = useEntrance({ delay: delay + 50, x: rtl ? 14 : -14 });
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: palette.signal, marginTop: rtl ? 11 : 9 }, dot]} />
      <Animated.View style={[{ flex: 1 }, line]}>
        <T variant="callout" tone="inkSecondary">
          {text}
        </T>
      </Animated.View>
    </View>
  );
}

export function Paused({ v, onResume }: { v: V<"paused">; onResume: () => Promise<void> }) {
  const t = useT("candidate.paused");
  const { c } = useTheme();
  const [pending, setPending] = React.useState(false);
  return (
    <Screen
      testID="screen-paused"
      header={<OrgHeader branding={v.branding} />}
      contentStyle={{ justifyContent: "center" }}
      bar={
        <Button
          testID="resume"
          variant="primary"
          label={t("resume", { n: v.chapterIndex + 1 })}
          loading={pending}
          full
          onPress={async () => {
            setPending(true);
            try {
              await onResume();
            } catch {
              setPending(false);
            }
          }}
        />
      }
    >
      <View style={{ flexGrow: 1, justifyContent: "center", gap: 18 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.surface, borderWidth: 1, borderColor: c.hairline, alignItems: "center", justifyContent: "center" }}>
          <PauseCircle size={30} color={c.text} strokeWidth={1.5} />
        </View>
        <T variant="display" accessibilityRole="header">
          {t("title")}
        </T>
        <T variant="body" tone="secondary">
          {t("body", { minutes: v.minutesLeft })}
        </T>
      </View>
    </Screen>
  );
}

/** Invalid, expired, revoked, or unreachable: say what happened and what to do. */
export function StateScreen({ branding, kind, onBack, onRetry, message }: { branding?: Branding; kind: "invalid" | "expired" | "revoked" | "offline"; onBack: () => void; onRetry?: () => void; message?: string }) {
  const t = useT("candidate");
  const tm = useT("mobile");
  const { c } = useTheme();
  const Icon: LucideIcon = kind === "expired" ? Clock : kind === "offline" ? WifiOff : Link2Off;
  const org = branding?.orgName ?? "";
  const title = kind === "offline" ? tm("errors.connectTitle") : t(`${kind}.title`);
  const body = message ?? (kind === "offline" ? tm("errors.connectBody") : t(`${kind}.body`, { org }));
  return (
    <Screen
      testID={`screen-${kind}`}
      header={<OrgHeader branding={branding} />}
      bar={
        <>
          {onRetry ? <Button variant="primary" label={tm("errors.retry")} onPress={onRetry} full /> : null}
          <Button variant={onRetry ? "ghost" : "action"} label={tm(kind === "offline" ? "errors.back" : "welcome.forget")} onPress={onBack} full />
        </>
      }
    >
      <View style={{ flexGrow: 1, justifyContent: "center", gap: 16 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.surfaceSunken, alignItems: "center", justifyContent: "center" }}>
          <Icon size={24} color={c.secondary} strokeWidth={1.6} />
        </View>
        <T variant="title" accessibilityRole="header">
          {title}
        </T>
        <T variant="body" tone="secondary">
          {body}
        </T>
      </View>
    </Screen>
  );
}

/** How long each line of the loading screen stays. */
const LINE_EVERY = 1800;
/** A line arriving: soft and slow, no overshoot. */
const LINE_SPRING = { mass: 1, stiffness: 140, damping: 22 } as const;

/** Shuffled, in place (Fisher–Yates). */
function shuffle<X>(xs: X[]): X[] {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [xs[i], xs[j]] = [xs[j]!, xs[i]!];
  }
  return xs;
}

/**
 * The loading line: "Unlocking the office…" first, the middle ones in a fresh
 * order (each once, so never the same twice in a row), then "Almost there…"
 * for as long as it takes. It never holds anything up: when the view changes
 * the screen goes, timers and all.
 */
function useLoadingLine() {
  const order = React.useMemo(() => ["l1", ...shuffle(["l2", "l3", "l4", "l5"]), "l6"], []);
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    if (i >= order.length - 1) return;
    const id = setTimeout(() => setI(i + 1), LINE_EVERY);
    return () => clearTimeout(id);
  }, [i, order.length]);
  return order[i]!;
}

/**
 * While the week is set up (the world, then the first scene): the bands
 * narrow, over and over, into the dot; the title; and a playful line about
 * what's happening, changing every couple of seconds with a soft rise. Under
 * reduced motion the Narrowing is still and the lines crossfade.
 */
export function Preparing({ branding }: { branding?: Branding }) {
  const t = useT("candidate.loading");
  const { rtl } = useLocale();
  const line = useLoadingLine();
  return (
    <Screen testID="screen-preparing" header={<OrgHeader branding={branding} />} scroll={false}>
      <View accessibilityRole="progressbar" accessibilityLabel={t("title")} style={{ flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 32, paddingBottom: 60 }}>
        <Narrowing width={132} rows={3} loop />
        <View style={{ alignSelf: "stretch", gap: 10 }}>
          {/* Beiruti's narrow word space all but vanishes in "نجهّز أسبوعك" (ز then أ); Plex Arabic keeps the words apart. */}
          <T variant={rtl ? "title2" : "displaySm"} align="center" accessibilityRole="header">
            {t("title")}
          </T>
          <Swap
            value={line}
            travel={14}
            config={LINE_SPRING}
            render={(k) => (
              <T testID="loading-line" variant="callout" tone="secondary" align="center">
                {t(`lines.${k}`)}
              </T>
            )}
          />
        </View>
      </View>
    </Screen>
  );
}
