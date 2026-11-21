import * as React from "react";
import { StyleSheet, View } from "react-native";
import { palette, useTheme } from "../theme";
import { hairline } from "../ui/primitives";
import { CARD_RADIUS } from "./pager-context";

/** A card's material: paper takes the surface colour of the theme; ink stays ink in both themes. */
export type CardTone = "paper" | "ink";

/** A card's own fill and hairline edge (the pager clips it to the card's corners). */
export function useCardSurface(tone: CardTone | undefined) {
  const { c, dark } = useTheme();
  if (!tone) return null;
  return tone === "ink" ? { bg: palette.ink, edge: dark ? "rgba(242,240,235,0.16)" : "rgba(242,240,235,0.06)" } : { bg: c.surface, edge: c.hairline };
}

/** The hairline around a card, drawn over its content so nothing scrolls across it. */
export function CardEdge({ color }: { color: string }) {
  return <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: CARD_RADIUS, borderWidth: hairline, borderColor: color }]} />;
}
