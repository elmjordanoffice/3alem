"use client";
import * as React from "react";
import { EvidenceField } from "@/components/brand/evidence-field";

/**
 * The landing page's scroll film. A tall section with a sticky stage: one
 * normalised progress `p` (smoothed, so nothing snaps) drives the evidence
 * field and four beats. The beats are server-rendered children that read CSS
 * variables set here, so React never re-renders per frame:
 *
 *   --p          overall progress 0–1
 *   --b0 … --b3  each beat's visibility 0–1 (hero, world, range, evidence)
 *   --k          how far the focus range has narrowed (beat 2)
 *   --hl         how far the highlighter has swept (beat 3)
 *   --scene      the scene counter, as an integer (for a CSS counter)
 *
 * `data-beat` names the beat in front, so only its links take pointer events.
 * `window.__film(p)` forces a state for screenshots.
 */
const BEATS: [number, number][] = [
  [-1, 0.2],
  [0.2, 0.45],
  [0.45, 0.7],
  [0.7, 2],
];
const FADE = 0.07;

export function ScrollFilm({
  children,
  backdrop,
  anchors = [],
  heightVh = 440,
}: {
  children: React.ReactNode;
  /** Rendered behind the field (a ghost wordmark the rows overlap). */
  backdrop?: React.ReactNode;
  /** In-page anchors at a given progress, so nav links land on a beat. */
  anchors?: { id: string; p: number }[];
  heightVh?: number;
}) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const state = React.useRef({ target: 0, value: 0, forced: null as number | null });
  const fieldProgress = React.useCallback(() => smooth(clamp01((state.current.value - 0.16) / 0.62)), []);

  React.useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const w = window as unknown as { __film?: (p: number | null) => void };
    w.__film = (p) => {
      state.current.forced = p;
    };

    let raf = 0;
    let last = performance.now();
    let written = -1;
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;
      const rect = section.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      s.target = s.forced ?? clamp01(-rect.top / span);
      const damp = reduced || s.forced !== null ? 1 : 1 - Math.pow(1 - 0.09, dt * 60);
      s.value += (s.target - s.value) * damp;
      if (Math.abs(s.value - s.target) < 0.0005) s.value = s.target;

      if (s.value !== written) {
        written = s.value;
        const p = s.value;
        const env = BEATS.map(([a, b]) => clamp01((p - a) / FADE) * clamp01((b - p) / FADE));
        env.forEach((v, i) => stage.style.setProperty(`--b${i}`, v.toFixed(3)));
        const k = smooth(clamp01((p - 0.47) / 0.18));
        stage.style.setProperty("--p", p.toFixed(4));
        stage.style.setProperty("--k", k.toFixed(3));
        stage.style.setProperty("--hl", smooth(clamp01((p - 0.74) / 0.12)).toFixed(3));
        stage.style.setProperty("--scene", String(1 + Math.round(k * 8)));
        const front = env.indexOf(Math.max(...env));
        stage.dataset.beat = String(front);
        // While the hero's own call to action is on screen, the nav's steps back.
        document.documentElement.dataset.hero = front === 0 ? "1" : "0";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      delete w.__film;
      delete document.documentElement.dataset.hero;
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative" style={{ height: `${heightVh}vh` }}>
      {anchors.map((a) => (
        <span key={a.id} id={a.id} className="absolute" style={{ top: `${(a.p * (heightVh - 100) * 100) / heightVh}%` }} aria-hidden />
      ))}
      <div
        ref={stageRef}
        data-beat="0"
        className="film-stage sticky top-0 h-dvh overflow-hidden"
        style={{ "--b0": 1, "--b1": 0, "--b2": 0, "--b3": 0, "--k": 0, "--hl": 0, "--scene": 1, "--p": 0 } as React.CSSProperties}
      >
        {/* Atmosphere: a bloom behind the headline, one near the field, a low horizon glow. */}
        <div className="film-atmosphere absolute inset-0" aria-hidden />
        {backdrop}
        <EvidenceField getProgress={fieldProgress} horizon={0.7} horizonEnd={0.6} className="film-field" />
        <div className="film-scrim-center pointer-events-none absolute inset-0" aria-hidden />
        <div className="film-scrim-side pointer-events-none absolute inset-0" aria-hidden />
        <div className="film-vignette pointer-events-none absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute inset-0">{children}</div>
      </div>
    </section>
  );
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function smooth(t: number) {
  return t * t * (3 - 2 * t);
}
