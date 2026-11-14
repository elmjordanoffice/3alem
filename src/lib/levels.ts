import type { Level } from "@/lib/framework/types";

export const LEVELS: readonly Level[] = [1, 2, 3, 4, 5];

/** Map a continuous estimate (1.0–5.0) to its display band. */
export function levelBand(estimate: number): Level {
  const clamped = Math.min(5, Math.max(1, estimate));
  return Math.min(5, Math.max(1, Math.round(clamped))) as Level;
}

/** Confidence (0–1) to a three-step label. Never shown as a percentage. */
export function confidenceBand(confidence: number): "low" | "moderate" | "high" {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.5) return "moderate";
  return "low";
}

/**
 * A display range around an estimate that widens as confidence falls.
 * At confidence 1 the range is ±0.15; at 0 it is ±1.0. Clamped to 1–5.
 */
export function levelRange(estimate: number, confidence: number): [number, number] {
  const c = Math.min(1, Math.max(0, confidence));
  const half = 0.15 + (1 - c) * 0.85;
  const lo = Math.max(1, Math.round((estimate - half) * 10) / 10);
  const hi = Math.min(5, Math.round((estimate + half) * 10) / 10);
  return [lo, hi];
}
