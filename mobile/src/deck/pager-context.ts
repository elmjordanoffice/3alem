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

export interface PagerHandle {
  goTo: (index: number, opts?: { animated?: boolean }) => void;
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
  testID?: string;
}
