import * as React from "react";
import { View } from "react-native";
import Svg, { Circle, G, Rect } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withDelay, withSpring } from "react-native-reanimated";
// Shared with the web app (metro.config.js watches ../src/lib/brand): the same title draws the same picture everywhere.
import { sceneArt, type ArtBand } from "../../../src/lib/brand/scene-art";
import { palette, spring, useTheme } from "../theme";
import { ARRIVE } from "../ui/motion";

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Between one band of the stack starting to narrow and the next. */
const STAGGER = 80;

/**
 * A scene's cover art: the brand's own shapes, composed from the scene's
 * title by the shared generator (a faint field of thin bands; a stack of
 * rounded bands narrowing upward into the vermilion dot, leaning by `tilt`).
 * Bone on ink, in both themes.
 *
 * It draws itself in once: each band of the stack narrows from the full width
 * to its own, bottom first, then the dot drops into place, on springs. Still
 * under reduced motion. Abstract, so it never mirrors in Arabic.
 *
 * The composition is 360 × 200. A box taller than that keeps the full width
 * and lets the field run on upward (mirrored, so it never visibly repeats); a
 * wider one crops the sides.
 */
export const SceneArt = React.memo(function SceneArt({ seed, width, height, play = true }: { seed: string; width: number; height: number; play?: boolean }) {
  const { c, reduceMotion } = useTheme();
  const art = React.useMemo(() => sceneArt(seed), [seed]);
  const animate = play && !reduceMotion;
  const aspect = width / Math.max(1, height);
  const slice = aspect >= art.width / art.height;
  const vbH = slice ? art.height : art.width / aspect;
  const extra = vbH - art.height;

  const field = React.useMemo(() => {
    const out: ArtBand[] = [...art.field];
    if (extra > 0) {
      const tiles = Math.ceil(extra / 180);
      for (let k = 1; k <= tiles; k++) {
        for (const b of art.field) {
          const y = b.y - 180 * k;
          if (y + b.h < -extra) continue;
          out.push({ ...b, y, x: k % 2 ? art.width - b.x - b.w : b.x });
        }
      }
    }
    return out;
  }, [art, extra]);

  // The stack leans around its own centre (dot included).
  const bottom = art.stack[0]!;
  const minX = Math.min(...art.stack.map((b) => b.x));
  const maxX = Math.max(...art.stack.map((b) => b.x + b.w));
  const cx = (minX + maxX) / 2;
  const cy = (art.dot.cy - art.dot.r + bottom.y + bottom.h) / 2;
  const dotDelay = ARRIVE + art.stack.length * STAGGER + 140;

  return (
    <View style={{ width, height, overflow: "hidden" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 ${-extra} ${art.width} ${vbH}`} preserveAspectRatio={slice ? "xMidYMax slice" : "xMidYMid meet"}>
        {field.map((b, i) => (
          <Rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={b.h / 2} fill={palette.bone} fillOpacity={b.strength} />
        ))}
        <G transform={art.tilt ? `rotate(${art.tilt} ${cx} ${cy})` : undefined}>
          {art.stack.map((b, i) => (
            <StackBand key={i} band={b} full={art.width} delay={ARRIVE + i * STAGGER} animate={animate} />
          ))}
          <Dot cx={art.dot.cx} cy={art.dot.cy} r={art.dot.r} color={c.signal} delay={dotDelay} animate={animate} />
        </G>
      </Svg>
    </View>
  );
});

/** One band of the stack, narrowing from the full width to its own. */
function StackBand({ band, full, delay, animate }: { band: ArtBand; full: number; delay: number; animate: boolean }) {
  const p = useSharedValue(animate ? 0 : 1);
  React.useEffect(() => {
    if (animate) p.value = withDelay(delay, withSpring(1, spring.rise));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const props = useAnimatedProps(() => ({ x: band.x * p.value, width: full + (band.w - full) * p.value }));
  return <AnimatedRect y={band.y} height={band.h} rx={band.h / 2} fill={palette.bone} fillOpacity={band.strength} animatedProps={props} />;
}

/** The vermilion dot, dropping into place once the stack has narrowed. */
function Dot({ cx, cy, r, color, delay, animate }: { cx: number; cy: number; r: number; color: string; delay: number; animate: boolean }) {
  const p = useSharedValue(animate ? 0 : 1);
  React.useEffect(() => {
    if (animate) p.value = withDelay(delay, withSpring(1, spring.settle));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const props = useAnimatedProps(() => ({ cy: cy - 30 * (1 - p.value), opacity: p.value > 0.01 ? 1 : 0 }));
  return <AnimatedCircle cx={cx} r={r} fill={color} animatedProps={props} />;
}
