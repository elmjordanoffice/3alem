import * as React from "react";
import { AccessibilityInfo, Platform, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { ChevronUp, Clock, Eye, EyeOff } from "lucide-react-native";
import { formatDuration, useT } from "../i18n";
import { radius, spring, useTheme } from "../theme";
import { FADE, OUT } from "../ui/motion";
import { Press } from "../ui/press";
import { hairline } from "../ui/primitives";
import { T } from "../ui/text";
import type { SaveState } from "../state/drafts";

export const TOPBAR_H = 58;

/** Space a slide leaves for the floating bar above it and the home indicator below. */
export function useDeckInsets() {
  const insets = useSafeAreaInsets();
  return { top: insets.top + TOPBAR_H + 8, bottom: Math.max(insets.bottom, 12), safeTop: insets.top, safeBottom: insets.bottom };
}

/** Frosted glass over the content (expo-blur), with a hairline edge. */
export function Glass({ children, style, edge = "bottom" }: { children?: React.ReactNode; style?: object; edge?: "top" | "bottom" | "none" }) {
  const { c, dark } = useTheme();
  return (
    <View style={[{ overflow: "hidden" }, style]}>
      <BlurView intensity={Platform.OS === "ios" ? 60 : 40} tint={dark ? "systemChromeMaterialDark" : "systemChromeMaterialLight"} experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: c.barFill }]} />
      {edge !== "none" ? <View style={{ position: "absolute", left: 0, right: 0, [edge]: 0, height: hairline, backgroundColor: c.hairline }} /> : null}
      {children}
    </View>
  );
}

/**
 * Progress by chapter, never by question count (the assessment adapts, so a
 * count would be wrong and would create pressure). The current chapter's
 * segment carries the vermilion accent; with `sweep` (its last answer is in)
 * it fills, from the reading start, with the done colour.
 */
export function ChapterRail({ chapters, current, sweep }: { chapters: string[]; current: number; sweep?: boolean }) {
  const { c } = useTheme();
  const t = useT("components.chapters");
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={`${t("chapterOf", { current: current + 1, total: chapters.length })}, ${chapters[current] ?? ""}`} style={{ flexDirection: "row", gap: 4 }}>
      {chapters.map((name, i) =>
        i === current ? (
          <CurrentChapter key={name + i} sweep={Boolean(sweep)} />
        ) : (
          <View key={name + i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i < current ? c.text : c.hairlineStrong, opacity: i > current ? 0.6 : 1 }} />
        ),
      )}
    </View>
  );
}

function CurrentChapter({ sweep }: { sweep: boolean }) {
  const { c, reduceMotion } = useTheme();
  const f = useSharedValue(0);
  React.useEffect(() => {
    if (!sweep) return;
    f.value = reduceMotion ? withTiming(1, FADE) : withSpring(1, { ...spring.rise, overshootClamping: true });
  }, [sweep, reduceMotion, f]);
  // `start: 0` is the reading start, so the fill runs right to left in Arabic.
  const fill = useAnimatedStyle(() => (reduceMotion ? { width: "100%", opacity: f.value } : { width: `${f.value * 100}%`, opacity: f.value > 0 ? 1 : 0 }));
  return (
    <View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: c.signal, overflow: "hidden" }}>
      <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, start: 0, borderRadius: 2, backgroundColor: c.text }, fill]} />
    </View>
  );
}

function SaveDot({ state }: { state: SaveState }) {
  const { c } = useTheme();
  const t = useT("components.autosave");
  const color = state === "error" ? c.critical : state === "offline" ? c.warning : c.tertiary;
  return (
    <View accessible accessibilityLabel={t(state)} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: state === "saved" ? c.hairlineStrong : color }} />
      {state !== "saved" ? (
        <T variant="caption" style={{ color }} numberOfLines={1}>
          {t(state)}
        </T>
      ) : null}
    </View>
  );
}

/**
 * A quiet timer, only on timed tasks. It never flashes or turns red, it can be
 * hidden, and screen readers hear it only at 5 and 1 minutes left.
 */
export function QuietTimer({ deadline, onExpire }: { deadline: number; onExpire?: () => void }) {
  const { c } = useTheme();
  const t = useT("components.timer");
  const [now, setNow] = React.useState(Date.now());
  const [hidden, setHidden] = React.useState(false);
  const fired = React.useRef(new Set<number>());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, Math.round((deadline - now) / 1000));
  React.useEffect(() => {
    for (const mark of [300, 60]) {
      if (remaining <= mark && remaining > mark - 2 && !fired.current.has(mark)) {
        fired.current.add(mark);
        AccessibilityInfo.announceForAccessibility(t("minutesLeft", { count: mark / 60, formatted: String(mark / 60) }));
      }
    }
    if (remaining === 0 && !fired.current.has(0)) {
      fired.current.add(0);
      onExpire?.();
    }
  }, [remaining, onExpire, t]);
  const low = remaining <= 120;
  return (
    <Press depth={0.95} onPress={() => setHidden((h) => !h)} accessibilityLabel={hidden ? t("show") : `${t("remaining", { time: formatDuration(remaining) })}. ${t("hide")}`} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 32, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: c.surfaceSunken }}>
      <Clock size={14} color={c.tertiary} strokeWidth={2} />
      <T variant="footnote" tone="secondary" latin style={{ fontVariant: ["tabular-nums"] }}>
        {hidden ? t("hidden") : low ? t("lowLeft", { time: formatDuration(remaining) }) : formatDuration(remaining)}
      </T>
      {hidden ? <Eye size={14} color={c.tertiary} /> : <EyeOff size={14} color={c.tertiary} />}
    </Press>
  );
}

/** The floating bar over the deck: who it's for, which chapter and the moment in the week, save state, the timer. */
export function TopBar({ orgName, chapters, chapterIndex, save, timer, chapterDone, clock }: { orgName: string; chapters: string[]; chapterIndex: number; save: SaveState; timer?: React.ReactNode; chapterDone?: boolean; clock?: React.ReactNode }) {
  const { c } = useTheme();
  const { safeTop } = useDeckInsets();
  const t = useT("components.chapters");
  return (
    <Glass style={{ position: "absolute", top: 0, left: 0, right: 0, paddingTop: safeTop, zIndex: 10 }}>
      <View style={{ height: TOPBAR_H, paddingHorizontal: 18, justifyContent: "center", gap: 9 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: c.text, alignItems: "center", justifyContent: "center" }}>
            <T variant="label" latin style={{ color: c.canvas, fontSize: 10, letterSpacing: 0 }} align="center">
              {orgName.trim().charAt(0).toUpperCase()}
            </T>
          </View>
          <T variant="footnote" numberOfLines={1} style={{ flex: 1 }}>
            <T variant="footnote">
              {t("chapterOf", { current: chapterIndex + 1, total: chapters.length })}
            </T>
            <T variant="footnote" tone="tertiary">
              {"  ·  "}
              {chapters[chapterIndex]}
            </T>
          </T>
          {clock}
          {timer}
          <SaveDot state={save} />
        </View>
        <ChapterRail chapters={chapters} current={chapterIndex} sweep={chapterDone} />
      </View>
    </Glass>
  );
}

/**
 * Where you are inside the scene: one dot per page down the trailing edge,
 * the current one stretched and vermilion. Each change of `pulse` sends an
 * "arrived" ripple down the pages read so far into the current one.
 */
export function SlideRail({ count, index, pulse = 0 }: { count: number; index: number; pulse?: number }) {
  const { c } = useTheme();
  const { top, bottom } = useDeckInsets();
  if (count < 2) return null;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: "absolute", end: 6, top, bottom: bottom + 80, justifyContent: "center", zIndex: 5 }}>
      <View style={{ gap: 5, alignItems: "center" }}>
        {Array.from({ length: count }, (_, i) => (
          <RailDot key={i} active={i === index} color={i === index ? c.signal : c.hairlineStrong} halo={c.signal} pulse={pulse} order={i <= index ? i : -1} />
        ))}
      </View>
    </View>
  );
}

function RailDot({ active, color, halo, pulse, order }: { active: boolean; color: string; halo: string; pulse: number; order: number }) {
  const { reduceMotion } = useTheme();
  const w = useSharedValue(0);
  const h = useSharedValue(0);
  React.useEffect(() => {
    if (!pulse || order < 0) return;
    if (reduceMotion) {
      // No ripple: the current page's glow fades up and away.
      if (active) h.value = withSequence(withTiming(1, FADE), withTiming(0, { ...FADE, duration: 360 }));
      return;
    }
    const at = order * 45;
    w.value = withDelay(at, withSequence(withSpring(1, { mass: 1, stiffness: 700, damping: 32 }), withSpring(0, spring.rise)));
    if (active) h.value = withDelay(at, withSequence(withTiming(1, { duration: 700, easing: OUT }), withTiming(0, { duration: 0 })));
  }, [pulse]); // eslint-disable-line react-hooks/exhaustive-deps
  const style = useAnimatedStyle(() => ({
    height: withSpring(active ? 18 : 5, spring.pop),
    backgroundColor: color,
    transform: [{ scaleX: 1 + 0.7 * w.value }, { scaleY: 1 + 0.2 * w.value }],
  }));
  const glow = useAnimatedStyle(() =>
    reduceMotion ? { opacity: h.value * 0.4 } : { opacity: h.value > 0 ? 0.35 * (1 - h.value) : 0, transform: [{ scaleX: 1 + 1.8 * h.value }, { scaleY: 1 + 0.5 * h.value }] },
  );
  return (
    <Animated.View style={[{ width: 4, borderRadius: 2 }, style]}>
      {active ? <Animated.View style={[{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, borderRadius: 2, backgroundColor: halo }, glow]} /> : null}
    </Animated.View>
  );
}

/** The quiet affordance at the bottom of a page: a chevron that drifts, and a tap target for those who don't swipe. */
export function NextHint({ onPress, label, first, onInk }: { onPress: () => void; label: string; first?: boolean; onInk?: boolean }) {
  const { c, reduceMotion } = useTheme();
  const t = useT("mobile.deck");
  const y = useSharedValue(0);
  React.useEffect(() => {
    if (reduceMotion || !first) return;
    y.value = withRepeat(withSequence(withTiming(-5, { duration: 700, easing: Easing.inOut(Easing.quad) }), withTiming(0, { duration: 700, easing: Easing.inOut(Easing.quad) })), -1, false);
  }, [first, reduceMotion, y]);
  const drift = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    // Inline at the end of the page: on a long page it waits below the content
    // instead of floating over it; on a short one it sits at the bottom.
    <View pointerEvents="box-none" style={{ alignItems: "center", paddingTop: 16 }}>
      <Press onPress={onPress} accessibilityLabel={label} accessibilityHint={t("swipeHint")} depth={0.92} style={{ alignItems: "center", gap: 2, minWidth: 88, minHeight: 44, justifyContent: "center", paddingHorizontal: 12 }}>
        {first ? (
          <T variant="caption" tone={onInk ? "inkSecondary" : "tertiary"} align="center">
            {t("swipeUp")}
          </T>
        ) : null}
        <Animated.View style={[{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: onInk ? "rgba(242,240,235,0.1)" : c.surface, borderWidth: hairline, borderColor: onInk ? "rgba(242,240,235,0.25)" : c.hairline }, drift]}>
          <ChevronUp size={18} color={onInk ? "#F2F0EB" : c.secondary} strokeWidth={2.2} />
        </Animated.View>
      </Press>
    </View>
  );
}
