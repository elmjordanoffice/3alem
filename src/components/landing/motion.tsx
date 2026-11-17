"use client";
import * as React from "react";
import Lenis from "lenis";

/**
 * Smooth scrolling for the marketing page only (Lenis). Off under reduced
 * motion. Anchor links glide instead of jumping.
 */
export function SmoothScroll() {
  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: 0 }, autoRaf: true });
    return () => lenis.destroy();
  }, []);
  return null;
}

/**
 * Arms scroll reveals: elements with `data-reveal` get `data-in` the first time
 * they enter the viewport. Until this runs, nothing is hidden, so the page
 * reads fine without JavaScript.
 */
export function RevealOnScroll() {
  React.useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]")];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.setAttribute("data-in", ""));
      return;
    }
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
    els.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.9) el.setAttribute("data-armed", "");
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
  return null;
}

/**
 * A section whose contents tilt back and settle flat as it scrolls into view
 * (writes `--settle` 0–1 on itself).
 */
export function ScrollSettle({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.setProperty("--settle", "1");
      return;
    }
    let raf = 0;
    let value = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const r = el.getBoundingClientRect();
      const target = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight * 0.55)));
      value += (target - value) * (1 - Math.pow(1 - 0.08, dt * 60));
      el.style.setProperty("--settle", value.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div ref={ref} className={className} style={{ "--settle": 0 } as React.CSSProperties}>
      {children}
    </div>
  );
}
