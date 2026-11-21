import * as React from "react";
import { View } from "react-native";
import { fonts, useTheme } from "../theme";
import { T } from "./text";

/** Initials on a stone disc: people in the fictional company never get faces. `colors` overrides the disc (on ink, say). */
export function Avatar({ name, size = 36, ink, colors }: { name: string; size?: number; ink?: boolean; colors?: { bg: string; fg: string } }) {
  const { c } = useTheme();
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase();
  const arabic = /[؀-ۿ]/.test(initials);
  const bg = colors?.bg ?? (ink ? c.text : c.surfaceSunken);
  const fg = colors?.fg ?? (ink ? c.canvas : c.secondary);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <T
        variant="caption"
        align="center"
        style={{ color: fg, fontFamily: arabic ? fonts.arabic[600] : fonts.sans[600], fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * (arabic ? 0.6 : 0.46)), letterSpacing: 0 }}
      >
        {arabic ? initials.replace(/(.)(.)/, "$1 $2") : initials}
      </T>
    </View>
  );
}
