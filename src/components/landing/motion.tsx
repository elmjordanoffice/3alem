"use client";
import * as React from "react";
import Lenis from "lenis";

/**
 * The landing page's small amount of JavaScript, all of it optional:
 *  - the nav frosts over once the page moves (`data-scrolled`);
 *  - `[data-reveal]` blocks rise in, and `[data-narrow]` figures narrow their
 *    ranges, when they scroll into view (`data-in`);
 *  - Lenis smooth scrolling, with anchors clearing the sticky nav.
 * Without JavaScript, or under reduced motion, everything shows its final state.
 */
export function LandingMotion() {
  React.useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: (() => void)[] = [];

    const nav = document.querySelector<HTMLElement>("[data-r-nav]");
    if (nav) {
      const onScroll = () => nav.toggleAttribute("data-scrolled", window.scrollY > 4);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", onScroll));
    }

    if (!reduced) {
      const els = [...document.querySelectorAll<HTMLElement>("[data-narrow], [data-reveal]")];
      root.setAttribute("data-r-motion", "");
      // Anything already on screen shows as it is; the rest arrives as it scrolls in.
      const pending = els.filter((el) => {
        const r = el.getBoundingClientRect();
        const visible = r.top < window.innerHeight && r.bottom > 0;
        if (visible) el.setAttribute("data-in", "");
        return !visible;
      });
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.setAttribute("data-in", "");
              io.unobserve(e.target);
            }
          }
        },
        { rootMargin: "0px 0px -12% 0px" },
      );
      pending.forEach((el) => io.observe(el));
      cleanups.push(() => {
        io.disconnect();
        root.removeAttribute("data-r-motion");
      });

      const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -80 }, autoRaf: true });
      cleanups.push(() => lenis.destroy());
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
  return null;
}
