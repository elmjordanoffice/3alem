import * as React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { Branding } from "../api/types";
import { useLocale } from "../i18n";
import { fonts, useTheme } from "../theme";
import { Glass } from "../deck/chrome";
import { Symbol } from "../ui/brand";
import { T } from "../ui/text";

/** The employer, quietly, at the top of every pre-assessment screen: its initial on a violet disc, or Aalim's own symbol. */
export function OrgHeader({ branding }: { branding?: Branding }) {
  const { c } = useTheme();
  const { rtl } = useLocale();
  if (!branding)
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Symbol size={32} />
        <T variant="headline" latin style={{ fontFamily: fonts.sans[800], letterSpacing: -0.3 }}>
          Aalim
        </T>
      </View>
    );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.accent, alignItems: "center", justifyContent: "center" }}>
        <T variant="footnote" latin align="center" style={{ color: c.actionText, fontFamily: fonts.sans[800], letterSpacing: 0 }}>
          {branding.orgName.trim().charAt(0).toUpperCase()}
        </T>
      </View>
      <T variant="subhead" numberOfLines={1} style={{ flexShrink: 1, fontFamily: rtl ? fonts.arabic[600] : fonts.sans[700] }}>
        {branding.orgName}
      </T>
    </View>
  );
}

/**
 * A scrolling screen on the canvas with safe areas, the screen's direction
 * (RTL in Arabic), and an optional frosted bar pinned to the bottom for its
 * call to action.
 */
export function Screen({ children, bar, contentStyle, header, testID, scroll = true }: { children: React.ReactNode; bar?: React.ReactNode; contentStyle?: StyleProp<ViewStyle>; header?: React.ReactNode; testID?: string; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const { dir } = useLocale();
  const { c, dark } = useTheme();
  const [barH, setBarH] = React.useState(bar ? 120 : 0);
  const body = (
    <View style={[{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: (bar ? barH : insets.bottom) + 28, gap: 24, width: "100%", maxWidth: 640, alignSelf: "center", flexGrow: 1 }, contentStyle]}>
      {header}
      {children}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.canvas, direction: dir }} testID={testID}>
      <StatusBar style={dark ? "light" : "dark"} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {scroll ? (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            {body}
          </ScrollView>
        ) : (
          body
        )}
        {bar ? (
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0 }} onLayout={(e) => setBarH(e.nativeEvent.layout.height)}>
            <Glass edge="top" style={{ paddingTop: 14, paddingHorizontal: 20, paddingBottom: Math.max(insets.bottom, 14) + 6 }}>
              <View style={{ width: "100%", maxWidth: 600, alignSelf: "center", gap: 10 }}>{bar}</View>
            </Glass>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}
