"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The evidence field: Aalim's hero asset. عالم means "a world", so the brand's
 * signature (a skill estimate drawn as a band on the 1–5 scale) becomes one:
 * rows of estimates on a ground plane, receding into fog. Far rows are wide and
 * lavender (uncertain); as evidence comes in they narrow and turn saffron.
 *
 * - `getProgress` (0–1) drives convergence, e.g. from a scroll film.
 * - Without it, rows converge as they travel towards the viewer (ambient loop).
 *
 * Canvas 2D with a cheap bloom (downsample and add back). Pixel ratio is capped
 * at 1.75 and drops to 1 if frames stay slow; it renders only while visible and
 * holds still under reduced motion.
 */
export function EvidenceField({
  getProgress,
  className,
  horizon = 0.5,
  speed = 0.32,
  bloom = 0.5,
  intensity = 1,
  spread = 1,
  horizonEnd,
  palette = "evidence",
}: {
  getProgress?: () => number;
  className?: string;
  /** Horizon height as a share of the canvas height. */
  horizon?: number;
  /** World units per second towards the viewer. */
  speed?: number;
  bloom?: number;
  /** Overall brightness, 0–1. */
  intensity?: number;
  /** Widens the field for short, wide panels. */
  spread?: number;
  /** With a driver, the horizon moves here as progress goes to 1 (the camera tilts into the world). */
  horizonEnd?: number;
  /** "evidence" narrows to saffron; "quiet" stays lavender and white (for app surfaces, where saffron means evidence only). */
  palette?: "evidence" | "quiet";
}) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const progressRef = React.useRef(getProgress);
  React.useEffect(() => {
    progressRef.current = getProgress;
  }, [getProgress]);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const glow = document.createElement("canvas");
    const gctx = glow.getContext("2d")!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const Z_NEAR = 1.05;
    const Z_FAR = 20;
    const TRACK = 2.6; // world half-width of the 1–5 scale: a runway towards the horizon
    const CAM_H = 1;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    let W = 0;
    let H = 0;

    type Row = { z: number; centre: number; spread: number; seed: number };
    let rows: Row[] = [];
    const rand = mulberry32(7);
    const spawn = (z: number): Row => ({ z, centre: 2.1 + rand() * 2.5, spread: 1.2 + rand() * 0.9, seed: rand() });
    const build = () => {
      const n = W < 640 ? 34 : 56;
      rows = Array.from({ length: n }, (_, i) => spawn(Z_NEAR + ((Z_FAR - Z_NEAR) * (i + 0.5)) / n));
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      glow.width = Math.max(1, Math.round(W / 6));
      glow.height = Math.max(1, Math.round(H / 6));
      if (!rows.length || (W < 640) !== (rows.length === 30)) build();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Pointer parallax, eased.
    let camX = 0;
    let camXTarget = 0;
    let hz = 0;
    let hzTarget = 0;
    const onPointer = (e: PointerEvent) => {
      camXTarget = (e.clientX / window.innerWidth - 0.5) * -0.7;
      hzTarget = (e.clientY / window.innerHeight - 0.5) * -0.02;
    };
    if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      if (visible) loop(performance.now());
    });
    io.observe(canvas);

    let raf = 0;
    let last = performance.now();
    const start = last;
    let slow = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // Governor: if frames stay slow, drop the pixel ratio once.
      if (dt > 0.034) slow++;
      else slow = Math.max(0, slow - 1);
      if (slow > 30 && dpr > 1) {
        dpr = 1;
        resize();
      }
      const damp = 1 - Math.pow(1 - 0.06, dt * 60);
      camX += (camXTarget - camX) * damp;
      hz += (hzTarget - hz) * damp;

      const p = progressRef.current ? clamp01(progressRef.current()) : null;
      const intro = reduced ? 1 : easeOut(clamp01((now - start) / 1400));

      if (!reduced) {
        for (const row of rows) {
          row.z -= speed * dt;
          if (row.z < Z_NEAR) Object.assign(row, spawn(row.z + (Z_FAR - Z_NEAR)));
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const f = Math.min(H * spread, W * 0.9) * 0.62;
      const hy = H * (horizon + (p !== null && horizonEnd !== undefined ? (horizonEnd - horizon) * smooth(p) : 0) + hz);
      const toX = (v: number, z: number) => W / 2 + ((((v - 1) / 4) * 2 - 1) * TRACK + camX) * (f / z);

      // Key light: a warm glow where the ground meets the fog, brightening with evidence.
      {
        const warm = palette === "quiet" ? "143,146,247" : "242,181,50";
        const glowA = (0.1 + 0.22 * (p ?? 0.5)) * intro * intensity;
        const rx = W * 0.55;
        const g = ctx.createRadialGradient(W / 2, hy, 0, W / 2, hy, rx);
        g.addColorStop(0, `rgba(${warm},${glowA})`);
        g.addColorStop(0.35, `rgba(143,146,247,${glowA * 0.45})`);
        g.addColorStop(1, "rgba(143,146,247,0)");
        ctx.save();
        ctx.translate(W / 2, hy);
        ctx.scale(1, 0.32);
        ctx.translate(-W / 2, -hy);
        ctx.globalAlpha = 1;
        ctx.fillStyle = g;
        ctx.fillRect(0, hy - rx, W, rx * 2);
        ctx.restore();
      }

      // Rails: the scale's ends and middle, converging on the vanishing point.
      ctx.lineWidth = 1;
      for (const v of [1, 3, 5]) {
        const g = ctx.createLinearGradient(0, hy, 0, H);
        g.addColorStop(0, "rgba(245,244,255,0)");
        g.addColorStop(1, `rgba(245,244,255,${(v === 3 ? 0.07 : 0.1) * intro * intensity})`);
        ctx.strokeStyle = g;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(toX(v, Z_FAR), hy + (CAM_H * f) / Z_FAR);
        ctx.lineTo(toX(v, Z_NEAR * 0.6), hy + (CAM_H * f) / (Z_NEAR * 0.6));
        ctx.stroke();
      }

      const sorted = [...rows].sort((a, b) => b.z - a.z);
      for (const row of sorted) {
        const z = row.z;
        const y = hy + (CAM_H * f) / z;
        if (y > H + 40) continue;
        const depth = (z - Z_NEAR) / (Z_FAR - Z_NEAR);
        // Fade at the horizon and again just before a row leaves the bottom edge.
        const fog = Math.pow(1 - depth, 1.1) * clamp01((1 - depth) * 5) * smooth(clamp01((H + 10 - y) / (H * 0.3))) * intro * intensity;
        // Evidence: with a driver, rows converge with progress (staggered);
        // without one, they converge as they come closer.
        const kz = smooth(clamp01((0.92 - depth) / 0.75));
        let k = p === null ? kz : smooth(clamp01(p * 1.45 - row.seed * 0.45 + kz * 0.12 * p));
        // A few rows are already evidenced at the start, previewing the payoff.
        if (p !== null && row.seed < 0.07) k = Math.max(k, 0.9);
        const half = row.spread * (1 - k) + 0.16 * k;
        const lo = Math.max(1, row.centre - half);
        const hi = Math.min(5, row.centre + half);
        // Thin, depth-scaled bands, clamped so near rows stay lines, not slabs.
        const th = Math.min(7, Math.max(1.2, (0.045 * f) / z));

        // The scale: a hairline with ticks at 2, 3, 4.
        ctx.globalAlpha = 0.13 * fog;
        ctx.fillStyle = "#f5f4ff";
        const x1 = toX(1, z);
        const x5 = toX(5, z);
        ctx.fillRect(x1, y - 0.5, x5 - x1, 1);
        for (const t of [2, 3, 4]) ctx.fillRect(toX(t, z) - 0.5, y - th * 1.1, 1, th * 2.2);

        // The band.
        const [r, g, b] = mix([143, 146, 247], palette === "quiet" ? [214, 215, 255] : [242, 181, 50], k);
        ctx.globalAlpha = (0.42 + 0.58 * k) * fog;
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        const bx = toX(lo, z);
        const bw = Math.max(th, toX(hi, z) - bx);
        roundRect(ctx, bx, y - th / 2, bw, th, th / 2);
        ctx.fill();

        // The estimate.
        ctx.globalAlpha = (0.5 + 0.5 * k) * fog;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(toX(row.centre, z), y, Math.max(1.2, th * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }

      // Bloom: downsample, then add back softly.
      if (bloom > 0) {
        gctx.clearRect(0, 0, glow.width, glow.height);
        gctx.imageSmoothingQuality = "high";
        gctx.drawImage(canvas, 0, 0, glow.width, glow.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = bloom;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(glow, 0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      cancelAnimationFrame(raf);
      if (!visible || document.hidden) return;
      frame(now);
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      last = performance.now();
      if (!document.hidden) loop(last);
    };
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [horizon, speed, bloom, intensity, spread, horizonEnd, palette]);

  return <canvas ref={ref} aria-hidden className={cn("pointer-events-none absolute inset-0 size-full rtl:-scale-x-100", className)} />;
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}
function smooth(t: number) {
  return t * t * (3 - 2 * t);
}
function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function mix(a: number[], b: number[], t: number) {
  return a.map((v, i) => Math.round(v + (b[i]! - v) * t)) as [number, number, number];
}
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
/** Small seeded PRNG so the field is the same on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
