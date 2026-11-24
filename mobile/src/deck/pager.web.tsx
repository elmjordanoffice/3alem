import * as React from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { lift, useTheme } from "../theme";
import { CARD_PEEK, CARD_RADIUS, CardGeometryContext, cardLayout, SlideIndexContext, type CardGeometry, type PagerHandle, type PagerProps } from "./pager-context";

/**
 * Depth for the card stack on the web, from CSS scroll-driven animations (where
 * the browser has them, and only without reduced motion): as a card leaves the
 * top it stays put, sinks back to 0.94 and dims while the next one scrolls over
 * it, then lets go once covered; a card coming up grows from 0.95 with its top
 * edge fixed. Cards dim toward the canvas with an overlay rather than turning
 * see-through, so the card underneath never shows through the one above. The
 * browser runs it on the compositor, frame for frame with the scroll. The same
 * numbers as the native pager.
 */
const DECK_CSS = `
[data-deck-card]{position:relative}
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    [data-deck-card]{
      view-timeline:--aalim-card block;
      view-timeline-inset:var(--deck-top) 0px;
      animation:aalim-deck-card linear both;
      animation-timeline:--aalim-card;
      transform-origin:50% 0;
    }
    [data-deck-card]::after{
      content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:60;
      background:var(--deck-canvas);opacity:0;
      animation:aalim-deck-dim linear both;
      animation-timeline:--aalim-card;
    }
  }
}
@keyframes aalim-deck-card{
  entry 0%{transform:scale(.95)}
  entry 100%{transform:none}
  exit 0%{transform:none;opacity:1}
  exit 70%{opacity:1}
  exit 100%{transform:translateY(var(--deck-hold)) scale(.94);opacity:0}
}
@keyframes aalim-deck-dim{
  entry 0%{opacity:.1}
  entry 100%{opacity:0}
  exit 0%{opacity:0}
  exit 100%{opacity:.45}
}
[data-pager]::-webkit-scrollbar{display:none}
`;

function useDeckStyles() {
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    let el = document.getElementById("aalim-deck-css");
    if (!el) {
      el = document.createElement("style");
      el.id = "aalim-deck-css";
      document.head.appendChild(el);
    }
    if (el.textContent !== DECK_CSS) el.textContent = DECK_CSS;
  }, []);
}

/**
 * The web fallback of the vertical pager: native CSS scroll snapping, so the
 * browser's own touch, trackpad and wheel physics drive it. Each page snaps
 * (and `scroll-snap-stop: always` keeps a fling to one page). A long page's
 * own scroller keeps the gesture until it reaches its edge, and the browser
 * then chains the next gesture to the pager, the same hand-off the native
 * pager does with Gesture Handler. With `cards`, pages are rounded cards and
 * the next one peeks in at the bottom.
 */
export const Pager = React.forwardRef<PagerHandle, PagerProps>(function Pager({ children, initialIndex = 0, onIndexChange, onSettle, onEdge, enabled = true, cards, testID }, ref) {
  useDeckStyles();
  const { c, reduceMotion } = useTheme();
  const el = React.useRef<HTMLDivElement>(null);
  const inner = React.useRef<HTMLDivElement>(null);
  const current = React.useRef(initialIndex);
  const settleTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const edgeAt = React.useRef(0);
  const cb = React.useRef({ onIndexChange, onSettle, onEdge });
  cb.current = { onIndexChange, onSettle, onEdge };
  const count = React.Children.count(children);
  const [size, setSize] = React.useState({ w: 0, h: 0 });
  const layout = cards && size.h ? cardLayout(size.w, size.h, cards.top) : null;
  // One page's travel: the full height, or a card plus the gap to the next.
  const pitchRef = React.useRef(0);
  pitchRef.current = layout ? layout.pitch : size.h;
  const motion = React.useRef(reduceMotion);
  motion.current = reduceMotion;
  const pitch = () => pitchRef.current || el.current?.clientHeight || 1;

  // Land on the current page once it has a size (a goTo can arrive before the first layout).
  const placed = React.useRef(false);
  React.useLayoutEffect(() => {
    const node = el.current;
    if (!node || placed.current || !size.h) return;
    placed.current = true;
    if (current.current) node.scrollTop = current.current * pitch();
  }, [size.h]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useImperativeHandle(
    ref,
    () => ({
      goTo: (i, opts) => {
        const node = el.current;
        const target = Math.max(0, Math.min(i, count - 1));
        if (!node || !placed.current) {
          // Not laid out yet: remember it, and land there on the first layout.
          if (target !== current.current) {
            current.current = target;
            cb.current.onIndexChange?.(target);
          }
          return;
        }
        const instant = opts?.animated === false || (motion.current && Boolean(cards));
        node.scrollTo({ top: target * pitch(), behavior: instant ? "instant" : "smooth" });
        // Reduced motion: nothing travels; the card is simply there, fading in.
        if (motion.current && cards && opts?.animated !== false) {
          node.querySelector<HTMLElement>(`[data-slide="${target}"] [data-deck-card]`)?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
        }
        if (target !== current.current) {
          current.current = target;
          cb.current.onIndexChange?.(target);
        }
      },
      nudge: () => {
        if (motion.current) return;
        inner.current?.animate(
          [
            { transform: "translateY(0)", easing: "cubic-bezier(.22,1,.36,1)" },
            { transform: "translateY(-12px)", offset: 0.18, easing: "cubic-bezier(.34,1.4,.64,1)" },
            { transform: "translateY(0)", offset: 0.45 },
            { transform: "translateY(0)", offset: 0.52, easing: "cubic-bezier(.22,1,.36,1)" },
            { transform: "translateY(-12px)", offset: 0.7, easing: "cubic-bezier(.34,1.4,.64,1)" },
            { transform: "translateY(0)" },
          ],
          { duration: 1500 },
        );
      },
    }),
    [count, cards],
  );

  React.useEffect(() => {
    const node = el.current;
    if (!node) return;
    const settle = () => {
      const i = Math.round(node.scrollTop / pitch());
      cb.current.onSettle?.(i);
    };
    const onScroll = () => {
      const i = Math.round(node.scrollTop / pitch());
      if (i !== current.current) {
        current.current = i;
        cb.current.onIndexChange?.(i);
      }
      if (settleTimer.current) clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(settle, 160);
    };
    const edge = (e: "start" | "end") => {
      const now = Date.now();
      if (now - edgeAt.current < 900) return;
      edgeAt.current = now;
      cb.current.onEdge?.(e);
    };
    // The sealed past: pulling down on the first page, or up on the last.
    const canScroll = (target: EventTarget | null, dir: -1 | 1) => {
      let n = target as HTMLElement | null;
      while (n && n !== node) {
        const s = getComputedStyle(n);
        if ((s.overflowY === "auto" || s.overflowY === "scroll") && n.scrollHeight > n.clientHeight + 1) {
          if (dir < 0 ? n.scrollTop > 0 : n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
        }
        n = n.parentElement;
      }
      return false;
    };
    const atStart = () => node.scrollTop <= 1;
    const atEnd = () => node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
    const onWheel = (e: WheelEvent) => {
      if (e.deltaY < -4 && atStart() && !canScroll(e.target, -1)) edge("start");
      else if (e.deltaY > 4 && atEnd() && !canScroll(e.target, 1)) edge("end");
    };
    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
      // A finger on the deck ends the swipe hint.
      inner.current?.getAnimations().forEach((a) => a.cancel());
    };
    const onTouchMove = (e: TouchEvent) => {
      const dy = (e.touches[0]?.clientY ?? 0) - touchY;
      if (dy > 48 && atStart() && !canScroll(e.target, -1)) edge("start");
      else if (dy < -48 && atEnd() && !canScroll(e.target, 1)) edge("end");
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    node.addEventListener("wheel", onWheel, { passive: true });
    node.addEventListener("touchstart", onTouchStart, { passive: true });
    node.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      node.removeEventListener("scroll", onScroll);
      node.removeEventListener("wheel", onWheel);
      node.removeEventListener("touchstart", onTouchStart);
      node.removeEventListener("touchmove", onTouchMove);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [size.h > 0]); // eslint-disable-line react-hooks/exhaustive-deps

  const geometry = React.useMemo<CardGeometry | null>(() => (layout ? { width: layout.cardW, height: layout.cardH, bottomGap: layout.bottomGap } : null), [layout?.cardW, layout?.cardH, layout?.bottomGap]); // eslint-disable-line react-hooks/exhaustive-deps

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    const h = Math.round(e.nativeEvent.layout.height);
    if (w !== size.w || h !== size.h) setSize({ w, h });
  };

  const scroller: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    overflowY: enabled ? "scroll" : "hidden",
    overflowX: "hidden",
    scrollSnapType: "y mandatory",
    overscrollBehaviorY: "contain",
    scrollbarWidth: "none",
  };

  let body: React.ReactNode = null;
  if (layout && cards) {
    // Night: each card lifted off the canvas by the web app's own card shadow.
    const vars = { "--deck-top": `${cards.top}px`, "--deck-hold": `${layout.cardH - 28}px`, "--deck-canvas": c.canvas, boxShadow: String(lift("card", c).boxShadow ?? ""), backgroundColor: c.surface } as React.CSSProperties;
    body = (
      <div ref={el} data-pager="true" style={{ ...scroller, scrollPaddingTop: cards.top }}>
        <div ref={inner} style={{ paddingTop: cards.top, paddingBottom: CARD_PEEK }}>
          {React.Children.map(children, (child, i) => (
            <div data-slide={i} style={{ height: layout.pitch, scrollSnapAlign: "start", scrollSnapStop: "always", position: "relative" }}>
              <div data-deck-card="true" style={{ ...vars, width: layout.cardW, height: layout.cardH, marginLeft: "auto", marginRight: "auto", borderRadius: CARD_RADIUS, overflow: "hidden", display: "flex", flexDirection: "column", isolation: "isolate" }}>
                <SlideIndexContext.Provider value={i}>{child}</SlideIndexContext.Provider>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (size.h) {
    body = (
      <div ref={el} data-pager="true" style={scroller}>
        {React.Children.map(children, (child, i) => (
          <div data-slide={i} style={{ height: "100%", scrollSnapAlign: "start", scrollSnapStop: "always", position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <SlideIndexContext.Provider value={i}>{child}</SlideIndexContext.Provider>
          </div>
        ))}
      </div>
    );
  }

  return (
    <View style={{ flex: 1, position: "relative" }} testID={testID} onLayout={onLayout}>
      <CardGeometryContext.Provider value={geometry}>{body}</CardGeometryContext.Provider>
    </View>
  );
});
