import { Platform, type ViewStyle } from "react-native";
import type { Colors } from "./tokens";

/**
 * How Night lifts things off the canvas: with light, not lines.
 *
 * - card: a surface resting on the canvas, a soft shadow under it.
 * - raised: the violet highlight card, glowing violet.
 * - glow: a primary control (or a stat tile) glowing in its own colour.
 * - float: something over the content (a sheet, a toast).
 *
 * On the web these are the exact shadows of the web app's tokens.css; on iOS
 * the nearest native shadow (which can't shrink with a negative spread, so it
 * is smaller and softer); on Android a little elevation, used sparingly (it
 * also lifts the view in the drawing order, so overlays never get it).
 * A view with a shadow needs a background colour and no `overflow: hidden`
 * (clip an inner view instead).
 */
export type LiftKind = "card" | "raised" | "glow" | "float";

/** `#RRGGBB` at alpha `a`, as rgba(). */
export function alpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return `rgba(${r},${g},${b},${a})`;
}

export function lift(kind: LiftKind, c: Colors, color?: string): ViewStyle {
  const dark = c.scheme === "dark";
  const tint = color ?? (kind === "raised" ? (dark ? c.accent : c.heroFrom) : kind === "glow" ? c.accent : c.shadow);

  if (Platform.OS === "web") {
    const web: Record<LiftKind, string> = {
      card: dark ? "inset 0 1px 0 rgba(255,255,255,0.04), 0 18px 40px -26px rgba(6,4,30,0.85)" : "0 1px 2px rgba(27,24,64,0.04), 0 14px 32px -20px rgba(43,31,122,0.28)",
      raised: `0 26px ${dark ? 54 : 50}px -22px ${alpha(tint, dark ? 0.65 : 0.55)}, inset 0 1px 0 rgba(255,255,255,0.18)`,
      glow: color ? `0 18px 36px -20px ${alpha(tint, 0.7)}` : `0 12px 26px -12px ${alpha(tint, 0.8)}, inset 0 1px 0 rgba(255,255,255,0.18)`,
      float: dark ? "0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px -18px rgba(6,4,30,0.8)" : "0 0 0 1px rgba(27,24,64,0.06), 0 24px 48px -18px rgba(43,31,122,0.35)",
    };
    return { boxShadow: web[kind] };
  }

  if (Platform.OS === "android") {
    const elevation = { card: dark ? 0 : 2, raised: 8, glow: 5, float: 12 }[kind];
    return elevation ? { elevation, shadowColor: tint } : {};
  }

  const ios: Record<LiftKind, ViewStyle> = {
    card: { shadowOffset: { width: 0, height: dark ? 12 : 10 }, shadowOpacity: dark ? 0.5 : 0.12, shadowRadius: dark ? 18 : 16 },
    raised: { shadowOffset: { width: 0, height: 16 }, shadowOpacity: dark ? 0.5 : 0.38, shadowRadius: 22 },
    glow: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: dark ? 0.45 : 0.32, shadowRadius: 14 },
    float: { shadowOffset: { width: 0, height: 16 }, shadowOpacity: dark ? 0.6 : 0.22, shadowRadius: 24 },
  };
  return { shadowColor: tint, ...ios[kind] };
}
