import * as React from "react";
import { ScrollView, View } from "react-native";
import type { SlideProps } from "./slide";
import { SlideScrollContext } from "./pager-context";

/** One page of the web pager: its own scroller; the browser chains to the pager at its edges. */
export function Slide({ children, footer, contentStyle, inactive, testID }: SlideProps) {
  const ref = React.useRef<React.ComponentRef<typeof ScrollView>>(null);
  const scroller = React.useMemo(() => ({ scrollToEnd: () => ref.current?.scrollToEnd({ animated: true }) }), []);
  return (
    <SlideScrollContext.Provider value={scroller}>
    <View style={{ flex: 1 }} accessibilityElementsHidden={inactive} importantForAccessibility={inactive ? "no-hide-descendants" : "auto"} testID={testID}>
      <ScrollView ref={ref} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={[{ flexGrow: 1 }, contentStyle]} style={{ flex: 1 }}>
        {children}
      </ScrollView>
      {footer}
    </View>
    </SlideScrollContext.Provider>
  );
}
