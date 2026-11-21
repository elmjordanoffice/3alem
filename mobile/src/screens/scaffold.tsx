import * as React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import type { Branding } from "../api/types";
import { useLocale } from "../i18n";
import { useTheme } from "../theme";
import { Glass } from "../deck/chrome";
import { Mark } from "../ui/brand";
import { T } from "../ui/text";

/** The employer, quietly, at the top of every pre-assessment screen. */
export function OrgHeader({ branding, onInk }: { branding?: Branding; onInk?: boolean }) {
  const { c } = useTheme();
  if (!branding)
    return (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Mark size={22} color={onInk ? "#F2F0EB" : c.text} />
        <T variant="label" style={{ color: onInk ? "#F2F0EB" : c.text }} latin>
          Aalim
        </T>
      </View>
    );
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: onInk ? "#F2F0EB" : c.text, alignItems: "center", justifyContent: "center" }}>
        <T variant="label" latin align="center" style={{ color: onInk ? "#141414" : c.canvas, fontSize: 12, letterSpacing: 0 }}>
          {branding.orgName.trim().charAt(0).toUpperCase()}
        </T>
      </View>
      <T variant="subhead" style={{ color: onInk ? "#F2F0EB" : c.text }} numberOfLines={1}>
        {branding.orgName}
      </T>
    </View>
  );
}

/**
 * A scrolling screen with safe areas, the screen's direction (RTL in Arabic),
 * and an optional frosted bar pinned to the bottom for its call to action.
 */
export function Screen({ children, bar, ink, contentStyle, header, testID, scroll = true }: { children: React.ReactNode; bar?: React.ReactNode; ink?: boolean; contentStyle?: StyleProp<ViewStyle>; header?: React.ReactNode; testID?: string; scroll?: boolean }) {
  const insets = useSafeAreaInsets();
  const { dir } = useLocale();
  const { c, dark } = useTheme();
  const [barH, setBarH] = React.useState(bar ? 120 : 0);
  const bg = ink ? "#141414" : c.canvas;
  const body = (
    <View style={[{ paddingTop: insets.top + 14, paddingHorizontal: 22, paddingBottom: (bar ? barH : insets.bottom) + 28, gap: 28, width: "100%", maxWidth: 640, alignSelf: "center", flexGrow: 1 }, contentStyle]}>
      {header}
      {children}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: bg, direction: dir }} testID={testID}>
      <StatusBar style={ink || dark ? "light" : "dark"} />
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
            {ink ? (
              <View style={{ paddingTop: 14, paddingHorizontal: 22, paddingBottom: Math.max(insets.bottom, 14) + 6, backgroundColor: "#141414", borderTopWidth: 1, borderColor: "rgba(242,240,235,0.12)" }}>
                <View style={{ width: "100%", maxWidth: 600, alignSelf: "center", gap: 10 }}>{bar}</View>
              </View>
            ) : (
              <Glass edge="top" style={{ paddingTop: 14, paddingHorizontal: 22, paddingBottom: Math.max(insets.bottom, 14) + 6 }}>
                <View style={{ width: "100%", maxWidth: 600, alignSelf: "center", gap: 10 }}>{bar}</View>
              </Glass>
            )}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}
