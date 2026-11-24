import * as React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { fonts } from "../theme";
import { T } from "./text";

/**
 * Night's discs: violet, blue, teal and coral, each a soft gradient with white
 * initials (AA on both stops). People in the fictional company never get faces.
 */
const TONES = [
  ["#6C5CE7", "#5040CE"],
  ["#2F5FD6", "#2448B8"],
  ["#0F7F74", "#0B675F"],
  ["#D6345D", "#B8284F"],
] as const;

function toneFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length]!;
}

/** Initials on a disc; the tone follows the name, so a person keeps their colour. `colors` overrides it (on the highlight card, say). */
export function Avatar({ name, size = 36, colors }: { name: string; size?: number; colors?: { bg: string; fg: string } }) {
  const parts = name.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "")).toUpperCase();
  const arabic = /[؀-ۿ]/.test(initials);
  const [from, to] = toneFor(name.trim());
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", backgroundColor: colors?.bg ?? to, alignItems: "center", justifyContent: "center" }}
    >
      {colors ? null : <LinearGradient colors={[from, to]} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={StyleSheet.absoluteFill} />}
      <T
        variant="caption"
        align="center"
        style={{ color: colors?.fg ?? "#FFFFFF", fontFamily: arabic ? fonts.arabic[700] : fonts.sans[700], fontSize: Math.round(size * 0.36), lineHeight: Math.round(size * (arabic ? 0.6 : 0.46)), letterSpacing: 0 }}
      >
        {arabic ? initials.replace(/(.)(.)/, "$1 $2") : initials}
      </T>
    </View>
  );
}
