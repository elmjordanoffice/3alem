import * as React from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { BlurView } from "expo-blur";
import { GestureDetector, GestureHandlerRootView, usePanGesture } from "react-native-gesture-handler";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useLocale, useT } from "../i18n";
import { radius, spring, useTheme } from "../theme";
import { Press } from "./press";
import { hairline } from "./primitives";
import { T } from "./text";

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * A bottom sheet: frosted backdrop, a grabber you can drag down, a spring in
 * and out. Content scrolls inside; the footer stays put.
 */
export function Sheet({ visible, onClose, title, subtitle, children, footer }: SheetProps) {
  const [mounted, setMounted] = React.useState(visible);
  const { height } = useWindowDimensions();
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);
  const { reduceMotion } = useTheme();

  React.useEffect(() => {
    if (visible) {
      setMounted(true);
      drag.value = 0;
      progress.value = reduceMotion ? withTiming(1, { duration: 180 }) : withSpring(1, spring.sheet);
    } else if (mounted) {
      progress.value = withTiming(0, { duration: 220, easing: Easing.in(Easing.quad) }, (done) => {
        if (done) scheduleOnRN(setMounted, false);
      });
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null;
  return (
    <Modal transparent visible animationType="none" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SheetBody {...{ title, subtitle, children, footer, onClose, progress, drag, height }} />
      </GestureHandlerRootView>
    </Modal>
  );
}

function SheetBody({ title, subtitle, children, footer, onClose, progress, drag, height }: Omit<SheetProps, "visible"> & { progress: ReturnType<typeof useSharedValue<number>>; drag: ReturnType<typeof useSharedValue<number>>; height: number }) {
  const { c, dark } = useTheme();
  const { dir } = useLocale();
  const t = useT("common");
  const insets = useSafeAreaInsets();

  const pan = usePanGesture({
    activeOffsetY: [-6, 6],
    onUpdate: (e) => {
      "worklet";
      drag.value = Math.max(0, e.translationY) + Math.min(0, e.translationY) * 0.15;
    },
    onDeactivate: (e) => {
      "worklet";
      if (e.translationY > 120 || e.velocityY > 900) {
        scheduleOnRN(onClose);
      } else {
        drag.value = withSpring(0, spring.sheet);
      }
    },
  });

  const backdrop = useAnimatedStyle(() => ({ opacity: interpolate(progress.value, [0, 1], [0, 1]) - Math.min(0.6, drag.value / 600) }));
  const panel = useAnimatedStyle(() => ({ transform: [{ translateY: interpolate(progress.value, [0, 1], [height, 0]) + drag.value }] }));

  return (
    <View style={{ flex: 1, justifyContent: "flex-end", direction: dir }}>
      <Animated.View style={[StyleSheet.absoluteFill, backdrop]}>
        <BlurView intensity={Platform.OS === "android" ? 30 : 18} tint={dark ? "dark" : "default"} experimentalBlurMethod="dimezisBlurView" style={StyleSheet.absoluteFill} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: c.scrim }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t("close")} accessibilityRole="button" />
      </Animated.View>
      <Animated.View
        accessibilityViewIsModal
        style={[
          {
            maxHeight: height * 0.92,
            backgroundColor: c.surface,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            borderWidth: hairline,
            borderColor: c.hairline,
            paddingBottom: Math.max(insets.bottom, 16),
          },
          panel,
        ]}
      >
        <GestureDetector gesture={pan}>
          <View style={{ paddingTop: 10, paddingHorizontal: 22, paddingBottom: 6 }}>
            <View style={{ alignSelf: "center", width: 40, height: 5, borderRadius: 3, backgroundColor: c.hairlineStrong, marginBottom: 14 }} />
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <T variant="title2" accessibilityRole="header">
                  {title}
                </T>
                {subtitle ? (
                  <T variant="subhead" tone="secondary">
                    {subtitle}
                  </T>
                ) : null}
              </View>
              <Press onPress={onClose} accessibilityLabel={t("close")} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surfaceSunken, alignItems: "center", justifyContent: "center" }} hitSlop={6}>
                <X size={18} color={c.secondary} strokeWidth={2.2} />
              </Press>
            </View>
          </View>
        </GestureDetector>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: 18, gap: 22 }} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
        {footer ? <View style={{ paddingHorizontal: 22, paddingTop: 10 }}>{footer}</View> : null}
      </Animated.View>
    </View>
  );
}
