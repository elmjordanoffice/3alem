import * as React from "react";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, { Easing, useAnimatedProps, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
// Shared with the web app (metro.config.js watches ../src/lib/brand): the same title draws the same picture everywhere.
import { arcLength, arcPath, sceneArt, type ArtArc } from "../../../src/lib/brand/scene-art";
import { palette, spring, useTheme } from "../theme";
import { ARRIVE } from "../ui/motion";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Between one sweep starting to draw and the next. */
const STAGGER = 140;

/**
 * A scene's cover art: the brand's own shapes (Focus), composed from the
 * scene's title by the shared generator: faint ripples round a coral point,
 * and two or three bold open rings closing in on it.
 * White light on the violet highlight card, in both themes, as on the web.
 *
 * It draws itself in once: each sweep draws round from its start, inner
 * first, then the point pops into place. Still under reduced motion.
 * Abstract, so it never mirrors in Arabic.
 *
 * The composition is 360 × 200. A box taller than that keeps the full width
 * and shows more of the ripples above (they run out to a wide radius); a
 * wider one crops the sides.
 */
export const SceneArt = React.memo(function SceneArt({ seed, width, height, play = true }: { seed: string; width: number; height: number; play?: boolean }) {
  const { reduceMotion } = useTheme();
  const art = React.useMemo(() => sceneArt(seed), [seed]);
  const animate = play && !reduceMotion;
  const aspect = width / Math.max(1, height);
  const slice = aspect >= art.width / art.height;
  const vbH = slice ? art.height : art.width / aspect;
  const extra = vbH - art.height;
  const dotDelay = ARRIVE + art.sweeps.length * STAGGER + 260;

  return (
    <View style={{ width, height, overflow: "hidden" }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" pointerEvents="none">
      <Svg width={width} height={height} viewBox={`0 ${-extra} ${art.width} ${vbH}`} preserveAspectRatio={slice ? "xMidYMax slice" : "xMidYMid meet"}>
        {art.field.map((a, i) => (
          <Path key={i} d={arcPath(a)} fill="none" stroke={palette.heroText} strokeWidth={a.w} strokeOpacity={a.strength} strokeLinecap="round" />
        ))}
        {art.sweeps.map((a, i) => (
          <Sweep key={i} arc={a} delay={ARRIVE + i * STAGGER} animate={animate} />
        ))}
        <Pupil cx={art.dot.cx} cy={art.dot.cy} r={art.dot.r} color={palette.coral} delay={dotDelay} animate={animate} />
      </Svg>
    </View>
  );
});

/** One bold arc, drawing round from its start. */
function Sweep({ arc, delay, animate }: { arc: ArtArc; delay: number; animate: boolean }) {
  const length = arcLength(arc);
  const p = useSharedValue(animate ? 0 : 1);
  React.useEffect(() => {
    if (animate) p.value = withDelay(delay, withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const props = useAnimatedProps(() => ({ strokeDashoffset: length * (1 - p.value) }));
  // White light, solid enough to read as the mark, soft enough to sit in the violet (the web's 0.24 + 0.5 × strength).
  return (
    <AnimatedPath
      d={arcPath(arc)}
      fill="none"
      stroke={palette.heroText}
      strokeWidth={arc.w}
      strokeOpacity={0.24 + arc.strength * 0.5}
      strokeLinecap="round"
      strokeDasharray={`${length}`}
      animatedProps={props}
    />
  );
}

/** The coral point, popping into place once the rings have drawn. */
function Pupil({ cx, cy, r, color, delay, animate }: { cx: number; cy: number; r: number; color: string; delay: number; animate: boolean }) {
  const p = useSharedValue(animate ? 0 : 1);
  React.useEffect(() => {
    if (animate) p.value = withDelay(delay, withSpring(1, spring.settle));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const props = useAnimatedProps(() => ({ r: r * p.value, opacity: p.value > 0.01 ? 1 : 0 }));
  return <AnimatedCircle cx={cx} cy={cy} fill={color} animatedProps={props} />;
}
