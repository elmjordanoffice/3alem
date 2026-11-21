import * as React from "react";
import { View } from "react-native";
import { fonts, useTheme } from "../theme";
import { T } from "./text";

/** Initials on a stone disc: people in the fictional company never get faces. */
export function Avatar({ name, size = 36, ink }: { name: string; size?: number; ink?: boolean }) {
  const { c } = useTheme();
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase();
  const arabic = /[؀-ۿ]/.test(initials);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: ink ? c.text : c.surfaceSunken, alignItems: "center", justifyContent: "center" }}>
      <T
        variant="caption"
        align="center"
        style={{ color: ink ? c.canvas : c.secondary, fontFamily: arabic ? fonts.arabic[600] : fonts.sans[600], fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * (arabic ? 0.6 : 0.46)), letterSpacing: 0 }}
      >
        {arabic ? initials.replace(/(.)(.)/, "$1 $2") : initials}
      </T>
    </View>
  );
}
