import * as React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  ReduceMotion,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
  type WithSpringConfig,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { spring, useTheme } from "../theme";

/**
 * The app's small moments of delight: a check that draws itself, a stamp, a
 * burst, numbers that count up. They reward progress through the story and
 * never touch the assessment itself (no points, no scores, no urgency). All of
 * it runs on the UI thread, and under reduced motion each one becomes a short
 * fade where nothing moves.
 */

/** A screen rising on the scene spring is about 95% in place by now; motion inside it starts here. */
export const ARRIVE = 280;

/** What every flourish becomes under reduced motion: a short fade. It is not skipped by the system setting, since nothing moves. */
export const FADE = { duration: 200, easing: Easing.out(Easing.quad), reduceMotion: ReduceMotion.Never } as const;

/** Strokes and counters: a fast start and a long, quiet tail. */
export const OUT = Easing.bezier(0.22, 1, 0.36, 1);

/** Under reduced motion the stagger collapses: everything fades in together, at most this late. */
const REDUCED_DELAY = 120;

export interface EntranceOptions {
  delay?: number;
  /** Where it comes from, in points (physical: pass a mirrored x in RTL). */
  x?: number;
  y?: number;
  /** Starting scale. */
  scale?: number;
  config?: WithSpringConfig;
  /** Start now (default) or wait for this to turn true. */
  play?: boolean;
}

/** An element arriving on a spring: fades in while it travels the last few points into place. */
export function useEntrance({ delay = 0, x = 0, y = 0, scale = 1, config = spring.rise, play = true }: EntranceOptions = {}) {
  const { reduceMotion } = useTheme();
  const p = useSharedValue(0);
  React.useEffect(() => {
    if (!play) return;
    p.value = reduceMotion ? withDelay(Math.min(delay, REDUCED_DELAY), withTiming(1, FADE)) : withDelay(delay, withSpring(1, config));
  }, [play]); // eslint-disable-line react-hooks/exhaustive-deps
  return useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: p.value };
    const k = 1 - p.value;
    return {
      opacity: interpolate(p.value, [0, 0.55], [0, 1], Extrapolation.CLAMP),
      transform: [{ translateX: x * k }, { translateY: y * k }, { scale: scale + (1 - scale) * p.value }],
    };
  });
}

/** A View that arrives with useEntrance. */
export function Entrance({ children, style, ...o }: EntranceOptions & { children?: React.ReactNode; style?: object }) {
  const a = useEntrance(o);
  return <Animated.View style={[style, a]}>{children}</Animated.View>;
}

const AnimatedPath = Animated.createAnimatedComponent(Path);
/** A check on a 24pt grid, drawn short leg first. Its length is a hair over the path's (6.4 + 12.7). */
const CHECK = "M5.5 12.5 L10 17 L18.5 7.5";
const CHECK_LEN = 19.4;

/** A check that draws itself, stroke by stroke. A check reads the same in both directions, so it is never mirrored. */
export function DrawnCheck({ size = 24, color, strokeWidth = 2.6, delay = 0, duration = 300, still }: { size?: number; color: string; strokeWidth?: number; delay?: number; duration?: number; still?: boolean }) {
  const { reduceMotion } = useTheme();
  const p = useSharedValue(still ? 1 : 0);
  React.useEffect(() => {
    if (still) return;
    p.value = reduceMotion ? withDelay(Math.min(delay, REDUCED_DELAY), withTiming(1, FADE)) : withDelay(delay, withTiming(1, { duration, easing: OUT }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const props = useAnimatedProps(() =>
    reduceMotion
      ? { strokeDashoffset: 0, opacity: p.value }
      : // Hidden until it starts, so the round cap never shows as a dot.
        { strokeDashoffset: CHECK_LEN * (1 - p.value), opacity: p.value > 0.002 ? 1 : 0 },
  );
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <AnimatedPath d={CHECK} stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray={`${CHECK_LEN} ${CHECK_LEN}`} animatedProps={props} />
    </Svg>
  );
}

/** Six particles in a fan over the top (symmetric, so it needs no mirroring), and their distances. */
const PARTICLES = [
  { a: -65, d: 1.55, s: 0.22 },
  { a: -115, d: 1.45, s: 0.2 },
  { a: -25, d: 1.25, s: 0.17 },
  { a: -155, d: 1.3, s: 0.18 },
  { a: 12, d: 1.05, s: 0.14 },
  { a: 168, d: 1.1, s: 0.15 },
];

function Particle({ t, a, d, s, size, color }: { t: SharedValue<number>; a: number; d: number; s: number; size: number; color: string }) {
  const r = Math.max(3, Math.round(size * s));
  const dx = Math.cos((a * Math.PI) / 180) * size * d;
  const dy = Math.sin((a * Math.PI) / 180) * size * d;
  const style = useAnimatedStyle(() => {
    const k = t.value;
    // Out fast, slowing as if through air; gone by the end.
    const travel = 1 - Math.pow(1 - k, 3);
    return {
      opacity: k <= 0 ? 0 : interpolate(k, [0, 0.12, 0.55, 1], [0, 1, 0.9, 0], Extrapolation.CLAMP),
      transform: [{ translateX: dx * travel }, { translateY: dy * travel }, { scale: interpolate(k, [0, 0.2, 1], [0.4, 1, 0.5], Extrapolation.CLAMP) }],
    };
  });
  return <Animated.View style={[{ position: "absolute", width: r, height: r, borderRadius: r / 2, backgroundColor: color, left: (size - r) / 2, top: (size - r) / 2 }, style]} />;
}

/**
 * One celebratory burst around a dot of `size`: a ring opening out and a few
 * particles, about a second, driven by `t` going 0 → 1. Draws nothing outside
 * that second.
 */
export function Burst({ t, size, color }: { t: SharedValue<number>; size: number; color: string }) {
  const ring = useAnimatedStyle(() => {
    const k = t.value;
    const e = 1 - Math.pow(1 - k, 3);
    return {
      opacity: k <= 0 ? 0 : interpolate(k, [0, 0.08, 1], [0, 0.55, 0], Extrapolation.CLAMP),
      transform: [{ scale: 1 + e * 1.5 }],
    };
  });
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View style={[{ position: "absolute", left: 0, top: 0, width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: color }, ring]} />
      {PARTICLES.map((q, i) => (
        <Particle key={i} t={t} size={size} color={color} {...q} />
      ))}
    </View>
  );
}

/**
 * A number counting up from 0 to `target`, eased. The curve runs on the UI
 * thread; each new whole number is handed to React (Text has no UI-thread
 * content prop). Under reduced motion it is simply the number.
 */
export function useCountUp(target: number, { delay = 0, duration = 900 }: { delay?: number; duration?: number } = {}) {
  const { reduceMotion } = useTheme();
  const p = useSharedValue(reduceMotion ? 1 : 0);
  const [shown, setShown] = React.useState(reduceMotion ? target : 0);
  useAnimatedReaction(
    () => Math.round(p.value * target),
    (v, prev) => {
      if (v !== prev) scheduleOnRN(setShown, v);
    },
    [target],
  );
  React.useEffect(() => {
    if (reduceMotion) {
      p.value = 1;
      setShown(target);
      return;
    }
    p.value = 0;
    p.value = withDelay(delay, withTiming(1, { duration, easing: OUT }));
  }, [target, reduceMotion]); // eslint-disable-line react-hooks/exhaustive-deps
  return shown;
}

/** Fires `fn` on the JS thread once, the first time `when` turns true on the UI thread. */
export function useOnce(when: () => boolean, fn: () => void) {
  const fired = useSharedValue(0);
  useAnimatedReaction(when, (hit) => {
    if (hit && !fired.value) {
      fired.value = 1;
      scheduleOnRN(fn);
    }
  });
}
