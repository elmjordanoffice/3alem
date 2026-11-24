import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../theme";
import { hairline } from "../ui/primitives";
import { CARD_RADIUS } from "./pager-context";

/** A card's material: paper takes the surface colour of the theme; hero is the violet highlight card in both themes. */
export type CardTone = "paper" | "hero";

/**
 * A card's own fill and edge (the pager clips it to the card's corners). Night
 * lifts cards with light, not lines: in dark mode only the top edge catches a
 * little light; in light mode paper keeps a faint ring, as on the web.
 */
export function useCardSurface(tone: CardTone | undefined) {
  const { c, dark } = useTheme();
  if (!tone) return null;
  return tone === "hero" ? { bg: c.heroVia, hero: true, edge: "rgba(255,255,255,0.18)", ring: false } : { bg: c.surface, hero: false, edge: dark ? "rgba(255,255,255,0.06)" : c.hairline, ring: !dark };
}

/** The card's edge, drawn over its content so nothing scrolls across it: a faint ring, or light along the top edge. */
export function CardEdge({ color, ring }: { color: string; ring?: boolean }) {
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: CARD_RADIUS, borderColor: color }, ring ? { borderWidth: hairline } : { borderTopWidth: 1 }]} />;
}
