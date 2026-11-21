import * as React from "react";
import { View } from "react-native";
import Svg, { Circle, Rect } from "react-native-svg";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming, Extrapolation, type SharedValue } from "react-native-reanimated";
import { palette, useTheme } from "../theme";
import { Burst, useOnce } from "./motion";

/** Geometry from src/components/brand/wordmark-paths.ts (MARK). */
const MARK = { bars: [{ x: 3, y: 48.25, w: 58 }, { x: 11, y: 33.75, w: 42 }, { x: 19, y: 19.25, w: 26 }], h: 11, dot: { cx: 32, cy: 10.25, r: 5.5 } };

/** The mark: three rounded bands narrowing upward into the vermilion dot. */
export function Mark({ size = 28, color, dot = palette.signal }: { size?: number; color?: string; dot?: string }) {
  const { c } = useTheme();
  const fill = color ?? c.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {MARK.bars.map((b) => (
        <Rect key={b.y} x={b.x} y={b.y} width={b.w} height={MARK.h} rx={MARK.h / 2} fill={fill} />
      ))}
      <Circle cx={MARK.dot.cx} cy={MARK.dot.cy} r={MARK.dot.r} fill={dot} />
    </Svg>
  );
}

/** The app symbol: the bone mark on an ink tile. */
export function Symbol({ size = 40 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.225, backgroundColor: palette.ink, alignItems: "center", justifyContent: "center" }}>
      <Mark size={size * 0.7} color={palette.bone} />
    </View>
  );
}

function Band({ t, i, rows, width, height, color }: { t: SharedValue<number>; i: number; rows: number; width: number; height: number; color: string }) {
  // Each band narrows from full width to its own width, bottom band first.
  const target = 1 - (i * (1 - 0.3)) / Math.max(1, rows - 1);
  const from = 0.04 + (i * 0.5) / rows;
  const span = 0.4;
  const style = useAnimatedStyle(() => {
    const k = interpolate(t.value, [from, from + span], [0, 1], Extrapolation.CLAMP);
    const eased = 1 - Math.pow(1 - k, 3);
    const w = interpolate(eased, [0, 1], [1, target]);
    return { width: width * w, opacity: interpolate(eased, [0, 1], [0.35, 1]) };
  });
  return <Animated.View style={[{ height, borderRadius: height / 2, backgroundColor: color, alignSelf: "center" }, style]} />;
}

/**
 * The Narrowing: wide bands of uncertainty tightening, row by row, into one
 * vermilion point. The loading state while a scene is prepared (looping) and
 * the signature on the complete screen (once). Still under reduced motion.
 *
 * Played once with `burst`, the dot pops as it lands: a ring and a few
 * vermilion particles, about a second (none under reduced motion). `onLand`
 * fires at that moment (at once when still).
 */
export function Narrowing({ width = 120, rows = 3, loop = true, color, onInk, burst, onLand }: { width?: number; rows?: number; loop?: boolean; color?: string; onInk?: boolean; burst?: boolean; onLand?: () => void }) {
  const { c, reduceMotion } = useTheme();
  const t = useSharedValue(reduceMotion ? 1 : 0);
  const height = Math.max(8, Math.round((width * 11) / 58));
  const gap = Math.round(height * 0.32);
  const band = color ?? (onInk ? "rgba(242,240,235,0.9)" : c.text);

  React.useEffect(() => {
    if (reduceMotion) {
      t.value = 1;
      return;
    }
    t.value = 0;
    const run = withTiming(1, { duration: 1700, easing: Easing.linear });
    t.value = loop ? withRepeat(withDelay(300, run), -1, true) : withDelay(200, run);
  }, [loop, reduceMotion, t]);

  const dotStart = 0.04 + ((rows - 1) * 0.5) / rows + 0.3;
  const dotEnd = Math.min(0.98, dotStart + 0.22);
  const dotStyle = useAnimatedStyle(() => {
    const k = interpolate(t.value, [dotStart, dotEnd], [0, 1], Extrapolation.CLAMP);
    // A small overshoot: the estimate lands.
    const s = k < 0.7 ? interpolate(k, [0, 0.7], [0, 1.25]) : interpolate(k, [0.7, 1], [1.25, 1]);
    return { transform: [{ scale: s }], opacity: k > 0 ? 1 : 0 };
  });

  // The pop: at the top of the dot's overshoot, once.
  const pop = useSharedValue(0);
  const peak = dotStart + (dotEnd - dotStart) * 0.7;
  const land = React.useCallback(() => {
    if (burst && !reduceMotion) pop.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) });
    onLand?.();
  }, [burst, reduceMotion, onLand, pop]);
  useOnce(() => {
    "worklet";
    return !loop && t.value >= peak;
  }, land);

  return (
    <View style={{ width, alignItems: "center", gap }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ width: height, height }}>
        {burst && !reduceMotion ? <Burst t={pop} size={height} color={c.signal} /> : null}
        <Animated.View style={[{ width: height, height, borderRadius: height / 2, backgroundColor: c.signal }, dotStyle]} />
      </View>
      {Array.from({ length: rows }, (_, k) => rows - 1 - k).map((i) => (
        <Band key={i} t={t} i={i} rows={rows} width={width} height={height} color={band} />
      ))}
    </View>
  );
}
