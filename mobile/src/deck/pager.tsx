import * as React from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withSpring, withTiming, Easing } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { spring, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { PagerContext, SlideIndexContext, type PagerContextValue, type PagerHandle, type PagerProps } from "./pager-context";

/** iOS's rubber band: resistance grows the further you pull. */
function rubber(x: number, dim: number) {
  "worklet";
  const c = 0.55;
  const s = Math.sign(x);
  const a = Math.abs(x);
  return s * (1 - 1 / ((a * c) / dim + 1)) * dim;
}

/**
 * A vertical, full-screen pager in the spirit of TikTok, driven entirely on
 * the UI thread (Reanimated + Gesture Handler).
 *
 * Long slides scroll inside themselves. The pager's pan runs simultaneously
 * with each slide's native scroller, and only takes the drag ("claims" it) when
 * that scroller is already at its top edge (dragging down) or bottom edge
 * (dragging up). From then on the scroller is pinned and the pages follow the
 * finger; on release a velocity-aware spring settles on the nearest page, one
 * page at a time. Touching a page mid-flight catches it (interruptible).
 */
export const Pager = React.forwardRef<PagerHandle, PagerProps>(function Pager({ children, initialIndex = 0, onIndexChange, onSettle, onEdge, enabled = true, testID }, ref) {
  const { reduceMotion } = useTheme();
  const count = React.Children.count(children);
  const [height, setHeight] = React.useState(0);

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

  // Keep the page in place when the height changes (rotation, keyboard on Android).
  React.useEffect(() => {
    h.value = height;
    trans.value = -index.value * height;
  }, [height, h, index, trans]);

  // Slides added or removed: clamp to the last page.
  React.useEffect(() => {
    last.value = Math.max(0, count - 1);
    if (index.value > count - 1 && count > 0) {
      index.value = count - 1;
      trans.value = withSpring(-(count - 1) * h.value, spring.page);
      chosen(count - 1);
    }
  }, [count, last, index, trans, h, chosen]);

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
        trans.value = reduce.value ? withTiming(-target * h.value, { duration: 220, easing: Easing.out(Easing.cubic) }, done) : withSpring(-target * h.value, spring.page, done);
        if (prev !== target) chosen(target);
      },
    }),
    [index, last, h, trans, reduce, settled, chosen],
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

  const track = useAnimatedStyle(() => ({ transform: [{ translateY: trans.value }] }));

  const ctx = React.useMemo<PagerContextValue>(() => ({ pan, index, claimed, lockY, offsets, maxes, height }), [pan, index, claimed, lockY, offsets, maxes, height]);

  const onLayout = (e: LayoutChangeEvent) => {
    const next = Math.round(e.nativeEvent.layout.height);
    if (next !== height) setHeight(next);
  };

  return (
    <View style={styles.fill} onLayout={onLayout} testID={testID}>
      {height > 0 ? (
        <PagerContext.Provider value={ctx}>
          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.track, track]}>
              {React.Children.map(children, (child, i) => (
                <SlideIndexContext.Provider value={i}>
                  <View style={{ height }}>{child}</View>
                </SlideIndexContext.Provider>
              ))}
            </Animated.View>
          </GestureDetector>
        </PagerContext.Provider>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  fill: { flex: 1, overflow: "hidden" },
  track: { position: "absolute", top: 0, left: 0, right: 0 },
});
