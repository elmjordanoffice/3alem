import * as React from "react";
import type { SharedValue } from "react-native-reanimated";
import type { PanGesture } from "react-native-gesture-handler";

/** What a slide needs from the pager around it. */
export interface PagerContextValue {
  /** The pager's pan (native only). A slide's scroller runs simultaneously with it. */
  pan: PanGesture | null;
  /** The settled (or targeted) page, on the UI thread. */
  index: SharedValue<number>;
  /** 1 while the pager owns the current drag: the active slide's scroller is pinned. */
  claimed: SharedValue<number>;
  /** Where the active slide's scroller is pinned while the pager owns the drag. */
  lockY: SharedValue<number>;
  /** Each slide's scroll offset and maximum offset, by slide index. */
  offsets: SharedValue<number[]>;
  maxes: SharedValue<number[]>;
  /** Height of one page. */
  height: number;
}

export const PagerContext = React.createContext<PagerContextValue | null>(null);
export const SlideIndexContext = React.createContext(0);

/** Lets slide content scroll its own page (a chat keeping the newest message in view). */
export const SlideScrollContext = React.createContext<{ scrollToEnd: () => void }>({ scrollToEnd: () => undefined });

export function usePagerContext() {
  return React.useContext(PagerContext);
}

// ── The card stack ─────────────────────────────────────────────────────────
// In "cards" mode each page is a rounded card on the canvas, inset from the
// screen's sides, and the next card peeks in at the bottom. Same numbers on
// native and web (and in the web app's phone deck).

/** Corner radius of a card. */
export const CARD_RADIUS = 22;
/** Space between a card and the screen's sides. */
export const CARD_INSET = 12;
/** Cards never grow wider than this (tablets); they sit centred. */
export const CARD_MAX_W = 560;
/** How much of the next card shows at the bottom. */
export const CARD_PEEK = 20;
/** Space between one card and the next. */
export const CARD_GAP = 10;
/** Padding inside a card. Task headers bleed to the card's edges by exactly this much. */
export const CARD_PAD = 20;

/** Where the card is resting on screen: its width and height, and its distance from the screen's bottom. */
export interface CardGeometry {
  width: number;
  height: number;
  /** From the card's bottom edge to the bottom of the pager (the peek and the gap). */
  bottomGap: number;
}

export const CardGeometryContext = React.createContext<CardGeometry | null>(null);

/** The card's size, or null outside a card deck. */
export function useCardGeometry() {
  return React.useContext(CardGeometryContext);
}

/** Lays out the stack for a pager of `width` × `height` whose resting card starts `top` from its top edge. */
export function cardLayout(width: number, height: number, top: number) {
  const cardW = Math.max(0, Math.min(width - CARD_INSET * 2, CARD_MAX_W));
  const cardH = Math.max(0, height - top - CARD_PEEK - CARD_GAP);
  return { cardW, cardH, left: Math.round((width - cardW) / 2), pitch: cardH + CARD_GAP, bottomGap: CARD_PEEK + CARD_GAP };
}

export interface PagerHandle {
  goTo: (index: number, opts?: { animated?: boolean }) => void;
  /** A one-time "there's more below" hint: the deck lifts ~12pt and settles, twice. Nothing under reduced motion. */
  nudge: () => void;
}

export interface PagerProps {
  children: React.ReactNode[];
  /** The page to show first. */
  initialIndex?: number;
  /** Called when a page is chosen (on release, before the spring settles). */
  onIndexChange?: (index: number) => void;
  /** Called when a page comes to rest. */
  onSettle?: (index: number) => void;
  /** A drag past the first page (the sealed past) or the last (a gate). */
  onEdge?: (edge: "start" | "end") => void;
  /** Lets a child (a ranking drag, a slider) switch paging off. */
  enabled?: boolean;
  /**
   * A stack of cards instead of full-bleed pages: the resting card's top edge
   * sits `top` points below the pager's top (under the floating bar), and the
   * next card peeks in at the bottom.
   */
  cards?: { top: number };
  testID?: string;
}
