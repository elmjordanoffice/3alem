import * as React from "react";
import { View } from "react-native";
import { SlideIndexContext, type PagerHandle, type PagerProps } from "./pager-context";

/**
 * The web fallback of the vertical pager: native CSS scroll snapping, so the
 * browser's own touch, trackpad and wheel physics drive it. Each page snaps
 * (and `scroll-snap-stop: always` keeps a fling to one page). A long page's
 * own scroller keeps the gesture until it reaches its edge, and the browser
 * then chains the next gesture to the pager, the same hand-off the native
 * pager does with Gesture Handler.
 */
export const Pager = React.forwardRef<PagerHandle, PagerProps>(function Pager({ children, initialIndex = 0, onIndexChange, onSettle, onEdge, enabled = true, testID }, ref) {
  const el = React.useRef<HTMLDivElement>(null);
  const current = React.useRef(initialIndex);
  const settleTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const edgeAt = React.useRef(0);
  const cb = React.useRef({ onIndexChange, onSettle, onEdge });
  cb.current = { onIndexChange, onSettle, onEdge };
  const count = React.Children.count(children);

  React.useLayoutEffect(() => {
    const node = el.current;
    if (node && initialIndex) node.scrollTop = initialIndex * node.clientHeight;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useImperativeHandle(
    ref,
    () => ({
      goTo: (i, opts) => {
        const node = el.current;
        if (!node) return;
        const target = Math.max(0, Math.min(i, count - 1));
        node.scrollTo({ top: target * node.clientHeight, behavior: opts?.animated === false ? "instant" : "smooth" });
        if (target !== current.current) {
          current.current = target;
          cb.current.onIndexChange?.(target);
        }
      },
    }),
    [count],
  );

  React.useEffect(() => {
    const node = el.current;
    if (!node) return;
    const settle = () => {
      const i = Math.round(node.scrollTop / Math.max(1, node.clientHeight));
      cb.current.onSettle?.(i);
    };
    const onScroll = () => {
      const i = Math.round(node.scrollTop / Math.max(1, node.clientHeight));
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
  }, []);

  return (
    <View style={{ flex: 1, position: "relative" }} testID={testID}>
      <div
        ref={el}
        data-pager="true"
        style={{
          position: "absolute",
          inset: 0,
          overflowY: enabled ? "scroll" : "hidden",
          overflowX: "hidden",
          scrollSnapType: "y mandatory",
          overscrollBehaviorY: "contain",
          scrollbarWidth: "none",
        }}
      >
        {React.Children.map(children, (child, i) => (
          <div data-slide={i} style={{ height: "100%", scrollSnapAlign: "start", scrollSnapStop: "always", position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <SlideIndexContext.Provider value={i}>{child}</SlideIndexContext.Provider>
          </div>
        ))}
      </div>
    </View>
  );
});
