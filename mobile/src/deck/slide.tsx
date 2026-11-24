import * as React from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { GestureDetector, useNativeGesture } from "react-native-gesture-handler";
import Animated, { scrollTo, useAnimatedRef, useAnimatedScrollHandler } from "react-native-reanimated";
import { HeroFill } from "../ui/primitives";
import { CardEdge, useCardSurface, type CardTone } from "./card-surface";
import { SlideIndexContext, SlideScrollContext, usePagerContext } from "./pager-context";

export interface SlideProps {
  children: React.ReactNode;
  /** Pinned to the bottom of the page (the submit bar, the next affordance). */
  footer?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  /** Hidden from screen readers while another page is showing. */
  inactive?: boolean;
  /** In a card deck: the card's material. Paper takes the surface colour; hero is the violet highlight card in both themes. */
  tone?: CardTone;
  testID?: string;
}

/**
 * One page of the deck. Its content scrolls inside it when it is taller than
 * the screen; the scroller reports its offset to the pager on the UI thread so
 * the pager can take over only at the top or bottom edge, and pins it while
 * the pager owns the drag.
 */
export function Slide({ children, footer, contentStyle, inactive, tone, testID }: SlideProps) {
  const ctx = usePagerContext();
  const i = React.useContext(SlideIndexContext);
  const surface = useCardSurface(tone);
  const ref = useAnimatedRef<Animated.ScrollView>();
  const native = useNativeGesture({ simultaneousWith: ctx?.pan ?? undefined });
  const offsets = ctx!.offsets;
  const maxes = ctx!.maxes;
  const claimed = ctx!.claimed;
  const lockY = ctx!.lockY;
  const index = ctx!.index;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      if (claimed.value === 1 && index.value === i) {
        // The pager owns this drag: keep the content still.
        if (Math.abs(e.contentOffset.y - lockY.value) > 0.5) scrollTo(ref, 0, lockY.value, false);
        return;
      }
      const max = Math.max(0, e.contentSize.height - e.layoutMeasurement.height);
      offsets.modify((a) => {
        "worklet";
        a[i] = e.contentOffset.y;
        return a;
      });
      maxes.modify((a) => {
        "worklet";
        a[i] = max;
        return a;
      });
    },
  });

  const layoutH = React.useRef(0);
  const contentH = React.useRef(0);
  const syncMax = () => {
    const m = Math.max(0, contentH.current - layoutH.current);
    maxes.modify((a) => {
      "worklet";
      a[i] = m;
      return a;
    });
  };

  const scroller = React.useMemo(() => ({ scrollToEnd: () => ref.current?.scrollToEnd({ animated: true }) }), [ref]);

  return (
    <SlideScrollContext.Provider value={scroller}>
    <View style={{ flex: 1, backgroundColor: surface?.bg }} accessibilityElementsHidden={inactive} importantForAccessibility={inactive ? "no-hide-descendants" : "auto"} testID={testID}>
      {surface?.hero ? <HeroFill /> : null}
      <GestureDetector gesture={native}>
        <Animated.ScrollView
          ref={ref}
          onScroll={onScroll}
          scrollEventThrottle={16}
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onLayout={(e) => {
            layoutH.current = e.nativeEvent.layout.height;
            syncMax();
          }}
          onContentSizeChange={(_w, h) => {
            contentH.current = h;
            syncMax();
          }}
          contentContainerStyle={[{ flexGrow: 1 }, contentStyle]}
        >
          {children}
        </Animated.ScrollView>
      </GestureDetector>
      {footer}
      {surface ? <CardEdge color={surface.edge} ring={surface.ring} /> : null}
    </View>
    </SlideScrollContext.Provider>
  );
}
