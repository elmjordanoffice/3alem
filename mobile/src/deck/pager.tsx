import * as React from "react";
import { Platform, StyleSheet, View, type LayoutChangeEvent, type ViewStyle } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, { cancelAnimation, Easing, Extrapolation, interpolate, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { lift as shadow, spring, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { CARD_RADIUS, CardGeometryContext, cardLayout, PagerContext, SlideIndexContext, type CardGeometry, type PagerContextValue, type PagerHandle, type PagerProps } from "./pager-context";

/** iOS's rubber band: resistance grows the further you pull. */
function rubber(x: number, dim: number) {
  "worklet";
  const c = 0.55;
  const s = Math.sign(x);
  const a = Math.abs(x);
  return s * (1 - 1 / ((a * c) / dim + 1)) * dim;
}

/** How far a card leaving upward drifts up as it sinks back into the stack. */
const LIFT = 28;
/** The one-time swipe hint: how far the deck lifts. */
const NUDGE = 12;

/**
 * A vertical pager in the spirit of TikTok, driven entirely on the UI thread
 * (Reanimated + Gesture Handler). Full-bleed pages by default; with `cards`, a
 * stack of rounded cards where the next one peeks in at the bottom.
 *
 * Long slides scroll inside themselves. The pager's pan runs simultaneously
 * with each slide's native scroller, and only takes the drag ("claims" it) when
 * that scroller is already at its top edge (dragging down) or bottom edge
 * (dragging up). From then on the scroller is pinned and the pages follow the
 * finger; on release a velocity-aware spring settles on the nearest page, one
 * page at a time. Touching a page mid-flight catches it (interruptible).
 *
 * In the stack every card's depth comes from one shared position (`trans`), on
 * the UI thread, so nothing re-renders while you drag: the card leaving upward
 * sinks back (scales to 0.94, dims, drifts up a little) while the next one
 * slides over it, growing from 0.95 to full size with its top edge leading.
 */
export const Pager = React.forwardRef<PagerHandle, PagerProps>(function Pager({ children, initialIndex = 0, onIndexChange, onSettle, onEdge, enabled = true, cards, testID }, ref) {
  const { reduceMotion } = useTheme();
  const count = React.Children.count(children);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const layout = cards && size.h ? cardLayout(size.w, size.h, cards.top) : null;
  // One page's travel: the full height, or a card plus the gap to the next.
  const pitch = layout ? layout.pitch : size.h;

  const index = useSharedValue(initialIndex);
  const trans = useSharedValue(0);
  const claimed = useSharedValue(0);
  const lockY = useSharedValue(0);
  const offsets = useSharedValue<number[]>([]);
  const maxes = useSharedValue<number[]>([]);
  const h = useSharedValue(0);
  const last = useSharedValue(Math.max(0, count - 1));
  // Per-drag state.
  const origin = useSharedValue(0);
  const base = useSharedValue(0);
  const startIndex = useSharedValue(0);
  const on = useSharedValue(enabled ? 1 : 0);
  const reduce = useSharedValue(reduceMotion ? 1 : 0);
  // The swipe hint's lift, and the reduced-motion fade of a card arriving by tap.
  const lift = useSharedValue(0);
  const fade = useSharedValue(1);
  const fadeAt = useSharedValue(-1);

  React.useEffect(() => {
    on.value = enabled ? 1 : 0;
  }, [enabled, on]);
  React.useEffect(() => {
    reduce.value = reduceMotion ? 1 : 0;
  }, [reduceMotion, reduce]);

  const settled = React.useCallback(
    (i: number) => {
      haptic.settle();
      onSettle?.(i);
    },
    [onSettle],
  );
  const edge = React.useCallback((e: "start" | "end") => onEdge?.(e), [onEdge]);
  const chosen = React.useCallback((i: number) => onIndexChange?.(i), [onIndexChange]);

  // Keep the page in place when the size changes (rotation, keyboard on Android).
  React.useEffect(() => {
    h.value = pitch;
    trans.value = -index.value * pitch;
  }, [pitch, h, index, trans]);

  // Slides added or removed: clamp to the last page.
  React.useEffect(() => {
    last.value = Math.max(0, count - 1);
    if (index.value > count - 1 && count > 0) {
      index.value = count - 1;
      trans.value = withSpring(-(count - 1) * h.value, spring.page);
      chosen(count - 1);
    }
  }, [count, last, index, trans, h, chosen]);

  const stack = Boolean(cards);
  React.useImperativeHandle(
    ref,
    () => ({
      goTo: (i, opts) => {
        const target = Math.max(0, Math.min(i, last.value));
        const prev = index.value;
        index.value = target;
        if (opts?.animated === false || !h.value) {
          cancelAnimation(trans);
          trans.value = -target * h.value;
          return;
        }
        const done = (fin?: boolean) => {
          "worklet";
          if (fin) scheduleOnRN(settled, target);
        };
        if (reduce.value && stack) {
          // Reduced motion: nothing travels. The card is simply there, fading in.
          cancelAnimation(trans);
          trans.value = -target * h.value;
          fadeAt.value = target;
          fade.value = 0;
          fade.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.quad) }, done);
        } else {
          trans.value = reduce.value ? withTiming(-target * h.value, { duration: 220, easing: Easing.out(Easing.cubic) }, done) : withSpring(-target * h.value, spring.page, done);
        }
        if (prev !== target) chosen(target);
      },
      nudge: () => {
        if (reduce.value) return;
        const up = () => withTiming(-NUDGE, { duration: 260, easing: Easing.out(Easing.cubic) });
        cancelAnimation(lift);
        lift.value = withSequence(up(), withSpring(0, spring.settle), withDelay(140, up()), withSpring(0, spring.settle));
      },
    }),
    [index, last, h, trans, reduce, settled, chosen, stack, fade, fadeAt, lift],
  );

  const release = (velocityY: number) => {
    "worklet";
    if (claimed.value === 0) return;
    claimed.value = 0;
    const H = h.value;
    if (!H) return;
    const from = startIndex.value;
    const pos = -trans.value / H;
    // Project the fling a little forward, then move at most one page.
    const projected = pos - (velocityY * 0.18) / H;
    let target = Math.round(projected);
    target = Math.max(from - 1, Math.min(from + 1, target));
    target = Math.max(0, Math.min(last.value, target));
    if (trans.value > 24 && from === 0) scheduleOnRN(edge, "start");
    else if (trans.value < -last.value * H - 24 && from === last.value) scheduleOnRN(edge, "end");
    index.value = target;
    const done = (fin?: boolean) => {
      "worklet";
      if (fin) scheduleOnRN(settled, target);
    };
    trans.value = reduce.value
      ? withTiming(-target * H, { duration: 200, easing: Easing.out(Easing.cubic) }, done)
      : withSpring(-target * H, { ...spring.page, velocity: velocityY }, done);
    if (target !== from) scheduleOnRN(chosen, target);
  };

  const pan = usePanGesture({
    activeOffsetY: [-8, 8],
    failOffsetX: [-16, 16],
    onBegin: () => {
      "worklet";
      claimed.value = 0;
      origin.value = 0;
      startIndex.value = index.value;
      // A finger on the deck ends the swipe hint.
      if (lift.value !== 0) {
        cancelAnimation(lift);
        lift.value = withSpring(0, spring.settle);
      }
      // A page caught mid-flight: the finger owns it from where it is.
      const resting = -index.value * h.value;
      if (Math.abs(trans.value - resting) > 1) {
        cancelAnimation(trans);
        base.value = trans.value;
        claimed.value = 1;
        lockY.value = offsets.value[index.value] ?? 0;
      } else {
        base.value = resting;
      }
    },
    onUpdate: (e) => {
      "worklet";
      if (!on.value || !h.value) return;
      const i = index.value;
      const dy = e.translationY;
      if (claimed.value === 0) {
        const off = offsets.value[i] ?? 0;
        const max = maxes.value[i] ?? 0;
        const atTop = off <= 1;
        const atBottom = off >= max - 1;
        if ((dy < 0 && atBottom) || (dy > 0 && atTop)) {
          claimed.value = 1;
          origin.value = dy;
          lockY.value = Math.max(0, Math.min(off, max));
        } else return;
      }
      const d = dy - origin.value;
      let next = base.value + d;
      const min = -last.value * h.value;
      // Past the first page (the sealed past) or the last: rubber band.
      if (next > 0) next = rubber(next, h.value);
      else if (next < min) next = min + rubber(next - min, h.value);
      trans.value = next;
    },
    onDeactivate: (e) => {
      "worklet";
      release(e.velocityY);
    },
    // A touch that caught a page mid-flight but never became a drag (a tap).
    onFinalize: () => {
      "worklet";
      release(0);
    },
  });

  const track = useAnimatedStyle(() => ({ transform: [{ translateY: trans.value + lift.value }] }));

  const ctx = React.useMemo<PagerContextValue>(() => ({ pan, index, claimed, lockY, offsets, maxes, height: layout ? layout.cardH : size.h }), [pan, index, claimed, lockY, offsets, maxes, layout?.cardH, size.h]); // eslint-disable-line react-hooks/exhaustive-deps
  const geometry = React.useMemo<CardGeometry | null>(() => (layout ? { width: layout.cardW, height: layout.cardH, bottomGap: layout.bottomGap } : null), [layout?.cardW, layout?.cardH, layout?.bottomGap]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    const hh = Math.round(e.nativeEvent.layout.height);
    if (w !== size.w || hh !== size.h) setSize({ w, h: hh });
  };

  let body: React.ReactNode = null;
  if (size.h > 0 && layout && cards) {
    const frame: ViewStyle = { position: "absolute", top: cards.top, left: layout.left, width: layout.cardW, height: layout.cardH };
    body = (
      <GestureDetector gesture={pan}>
        <View style={StyleSheet.absoluteFill}>
          {React.Children.map(children, (child, i) => (
            <DeckCard i={i} trans={trans} pitch={h} last={last} reduce={reduce} lift={lift} fade={fade} fadeAt={fadeAt} cardH={layout.cardH} frame={frame}>
              <SlideIndexContext.Provider value={i}>{child}</SlideIndexContext.Provider>
            </DeckCard>
          ))}
        </View>
      </GestureDetector>
    );
  } else if (size.h > 0) {
    body = (
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.track, track]}>
          {React.Children.map(children, (child, i) => (
            <SlideIndexContext.Provider value={i}>
              <View style={{ height: size.h }}>{child}</View>
            </SlideIndexContext.Provider>
          ))}
        </Animated.View>
      </GestureDetector>
    );
  }

  return (
    <View style={styles.fill} onLayout={onLayout} testID={testID}>
      <PagerContext.Provider value={ctx}>
        <CardGeometryContext.Provider value={geometry}>{body}</CardGeometryContext.Provider>
      </PagerContext.Provider>
    </View>
  );
});

/**
 * One card of the stack, placed and shaded from the pager's shared position.
 * `d` is how many pages below the resting slot this card is: 1 peeks in at the
 * bottom, 0 rests, below 0 it is leaving upward under the next card. Later
 * cards draw over earlier ones, so the incoming card covers the leaving one.
 */
function DeckCard({
  i,
  trans,
  pitch,
  last,
  reduce,
  lift,
  fade,
  fadeAt,
  cardH,
  frame,
  children,
}: {
  i: number;
  trans: SharedValue<number>;
  pitch: SharedValue<number>;
  last: SharedValue<number>;
  reduce: SharedValue<number>;
  lift: SharedValue<number>;
  fade: SharedValue<number>;
  fadeAt: SharedValue<number>;
  cardH: number;
  frame: ViewStyle;
  children: React.ReactNode;
}) {
  const { c } = useTheme();
  const card = useAnimatedStyle(() => {
    const P = pitch.value;
    if (!P) return {};
    const d = i + trans.value / P;
    let y = d * P;
    let s = 1;
    let o = 1;
    if (reduce.value) {
      // Reduced motion: no depth, no scaling. Cards travel only under the finger.
      if (Math.abs(d) > 1.2) o = 0;
    } else if (d > 0 && i > 0) {
      // Coming up from below: grows from 0.95 with its top edge fixed, so the peek never slips off screen.
      const k = Math.min(d, 1);
      s = 1 - 0.05 * k;
      if (d > 1.5) o = 0;
      y -= ((1 - s) * cardH) / 2;
    } else if (d < 0 && i < last.value) {
      // Leaving upward, under the next card: sinks back and drifts up a little,
      // then lets go once covered, so no sliver of it shows at rest.
      const k = Math.min(-d, 1);
      y = -k * LIFT;
      s = 1 - 0.06 * k;
      o = interpolate(-d, [0.7, 1], [1, 0], Extrapolation.CLAMP);
    }
    if (fadeAt.value === i) o *= fade.value;
    return { opacity: o, transform: [{ translateY: y + lift.value }, { scale: s }] };
  });
  // Dimming toward the canvas (rather than turning the card see-through) keeps the card underneath hidden:
  // the leaving card sinks to the look of 0.55 opacity, the peeking one rises from 0.9.
  const dim = useAnimatedStyle(() => {
    const P = pitch.value;
    if (!P || reduce.value) return { opacity: 0 };
    const d = i + trans.value / P;
    if (d < 0 && i < last.value) return { opacity: 0.45 * Math.min(-d, 1) };
    if (d > 0 && i > 0) return { opacity: 0.1 * Math.min(d, 1) };
    return { opacity: 0 };
  });
  // Night lifts the card with a soft shadow (iOS); the shadow sits on the unclipped outer view, the content is
  // clipped to the corners inside it. Android skips it: elevation would fight the stack's own depth.
  return (
    <Animated.View style={[frame, { borderRadius: CARD_RADIUS, backgroundColor: c.surface }, Platform.OS === "ios" ? shadow("card", c) : null, card]}>
      <View style={[StyleSheet.absoluteFill, { borderRadius: CARD_RADIUS, overflow: "hidden" }]}>
        {children}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.canvas }, dim]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: "hidden" },
  track: { position: "absolute", top: 0, left: 0, right: 0 },
});
