"use client";
import * as React from "react";
import Lenis from "lenis";

/**
 * The landing page's small amount of JavaScript, all of it optional:
 *  - the nav gains a hairline once the page moves, and its call to action takes
 *    the signal once the hero's has scrolled away (`data-scrolled`, `data-cta`);
 *  - `[data-narrow]` figures narrow their ranges when they scroll into view;
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
      const heroCta = document.getElementById("hero-cta");
      if (heroCta) {
        const io = new IntersectionObserver(([e]) => {
          if (e) nav.dataset.cta = e.isIntersecting ? "ink" : "signal";
        });
        io.observe(heroCta);
        cleanups.push(() => io.disconnect());
      }
    }

    if (!reduced) {
      const els = [...document.querySelectorAll<HTMLElement>("[data-narrow]")];
      root.setAttribute("data-r-motion", "");
      // Anything already on screen shows as it is; the rest narrows on arrival.
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
        { rootMargin: "0px 0px -20% 0px" },
      );
      pending.forEach((el) => io.observe(el));
      cleanups.push(() => {
        io.disconnect();
        root.removeAttribute("data-r-motion");
      });

      const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -64 }, autoRaf: true });
      cleanups.push(() => lenis.destroy());
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
  return null;
}
