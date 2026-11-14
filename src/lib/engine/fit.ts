import { estimateDomain, estimateSkill } from "./model";
import { importanceOf } from "./select";
import type { CandidateModel, RoleProfile } from "./types";

export type RoleFitLevel = "STRONG" | "GOOD" | "PARTIAL" | "WEAK";

export interface RoleFit {
  fit: RoleFitLevel;
  /** Weighted mean of (estimate − expected level) across what matters for the role. */
  margin: number;
  confidence: number;
  /** Must-haves below the expected level, with the gap. */
  gaps: { key: string; gap: number }[];
}

/**
 * Overall role fit. Must-haves count double; a large gap on any must-have caps
 * the fit at Partial, because averages can hide a deal-breaker.
 */
export function roleFit(model: CandidateModel, role: RoleProfile): RoleFit {
  const keys = new Set<string>([...role.critical]);
  for (const [d, w] of Object.entries(role.domainWeights)) if (w >= 0.5) keys.add(d);
  if (keys.size === 0) for (const d of Object.keys(role.domainWeights)) keys.add(d);

  let sum = 0;
  let wsum = 0;
  let csum = 0;
  const gaps: { key: string; gap: number }[] = [];
  for (const key of keys) {
    const est = model.skills[key] ? estimateSkill(model, key) : estimateDomain(model, key);
    const w = importanceOf(role, key);
    sum += w * (est.mean - role.expectedLevel);
    csum += w * est.confidence;
    wsum += w;
    if (role.critical.includes(key) && est.mean < role.expectedLevel) gaps.push({ key, gap: role.expectedLevel - est.mean });
  }
  const margin = wsum ? sum / wsum : 0;
  let fit: RoleFitLevel = margin >= 0.25 ? "STRONG" : margin >= -0.25 ? "GOOD" : margin >= -0.75 ? "PARTIAL" : "WEAK";
  if (gaps.some((g) => g.gap >= 1) && (fit === "STRONG" || fit === "GOOD")) fit = "PARTIAL";
  return { fit, margin, confidence: wsum ? csum / wsum : 0, gaps: gaps.sort((a, b) => b.gap - a.gap) };
}

/** Work-style position per style in [-1, 1]: −1 = fully pole a, +1 = fully pole b. */
export function workStylePositions(model: CandidateModel): Record<string, { position: number; n: number }> {
  const out: Record<string, { position: number; n: number }> = {};
  for (const [style, t] of Object.entries(model.workStyle)) {
    const n = t.a + t.b;
    out[style] = { position: n ? (t.b - t.a) / n : 0, n };
  }
  return out;
}
