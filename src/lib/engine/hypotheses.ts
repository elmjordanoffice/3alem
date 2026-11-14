import { MAX_HYPOTHESES, MAX_OPEN_HYPOTHESES, MAX_STRESS_ITEMS, MAX_VALIDATION_ITEMS, MIN_VALIDATION_ITEMS, SURPRISE_THRESHOLD } from "./config";
import { estimateSkill, predictedLevel } from "./model";
import type { CandidateModel, Hypothesis, Observation, RoleProfile } from "./types";

/**
 * reviewHypotheses(model, role) → model with hypotheses opened, confirmed or rejected.
 *
 * A hypothesis opens when one answer sits well outside what the role leads us
 * to expect: a strong product instinct from an engineer, a pattern of rash
 * calls. One answer never establishes a trait, so each hypothesis is validated
 * with 2–3 further items in different surface contexts, never the item that
 * triggered it. Confirmed strengths are then stress-tested to find a ceiling;
 * confirmed weaknesses are tested under the opposite time condition to see
 * whether they are general or situational.
 */

const STRENGTH_MIN = 4;
const WEAKNESS_MAX = 2;

export function strengthThreshold(role: RoleProfile) {
  return Math.max(STRENGTH_MIN, role.expectedLevel + 1);
}
export function weaknessThreshold(role: RoleProfile) {
  return Math.min(WEAKNESS_MAX, role.expectedLevel - 1);
}

function mainObs(obs: Observation[]) {
  return obs.filter((o) => o.stage === "MAIN" || o.stage === "ROLE_PLAY_TURN");
}

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
}

/** Average level per item (main and follow-ups combined), excluding some items. */
function perItemLevels(obs: Observation[], excludeItemIds: Set<string>) {
  const byItem = new Map<string, number[]>();
  for (const o of obs) {
    if (excludeItemIds.has(o.itemId)) continue;
    const arr = byItem.get(o.itemId) ?? [];
    arr.push(o.level);
    byItem.set(o.itemId, arr);
  }
  return [...byItem.entries()].map(([itemId, levels]) => ({ itemId, level: mean(levels) }));
}

export function reviewHypotheses(model: CandidateModel, role: RoleProfile): CandidateModel {
  const next: CandidateModel = structuredClone(model);
  const hi = strengthThreshold(role);
  const lo = weaknessThreshold(role);

  // 1. Open new hypotheses from main answers that are surprising: outside the
  //    role's expected band AND well away from what the rest of this person's
  //    evidence predicts. Strong-everywhere candidates don't flood the queue.
  const candidates: { skill: string; latest: Observation; direction: "STRENGTH" | "WEAKNESS"; surprise: number }[] = [];
  for (const skill of Object.values(next.skills)) {
    if (next.hypotheses.some((h) => h.skill === skill.key)) continue;
    const latest = mainObs(skill.observations).at(-1);
    if (!latest || latest.seq !== mainObs(skill.observations).at(-1)?.seq) continue;
    const predicted = predictedLevel(next, skill.key, latest.seq);
    const surprise = latest.level - predicted;
    const direction =
      latest.level >= hi && surprise >= SURPRISE_THRESHOLD ? "STRENGTH" : latest.level <= lo && surprise <= -SURPRISE_THRESHOLD ? "WEAKNESS" : null;
    if (direction) candidates.push({ skill: skill.key, latest, direction, surprise: Math.abs(surprise) });
  }
  const weight = (k: string) => (role.critical.includes(k) || role.critical.includes(role.domainOf[k] ?? "") ? 2 : 1) * Math.max(0.25, role.skillWeights[k] ?? role.domainWeights[role.domainOf[k] ?? ""] ?? 0.3);
  candidates.sort((a, b) => weight(b.skill) * b.surprise - weight(a.skill) * a.surprise || a.skill.localeCompare(b.skill));
  for (const { skill: key, latest, direction } of candidates) {
    const open = next.hypotheses.filter((h) => h.status === "OPEN").length;
    if (open >= MAX_OPEN_HYPOTHESES || next.hypotheses.length >= MAX_HYPOTHESES) break;
    const skill = next.skills[key]!;
    next.hypotheses.push({
      id: `h-${skill.key}-${latest.seq}`,
      skill: skill.key,
      direction,
      status: "OPEN",
      trigger: { itemId: latest.itemId, level: latest.level, quote: latest.evidenceQuote },
      validationItemIds: [],
      ceiling: null,
      stressItemIds: [],
      stressDone: false,
      condition: null,
      conditionItemIds: [],
      openedAtSeq: latest.seq,
      resolvedAtSeq: null,
    });
  }

  // 2. Validate open hypotheses.
  for (const h of next.hypotheses) {
    const skill = next.skills[h.skill]!;
    if (h.status === "OPEN") {
      const exclude = new Set([h.trigger.itemId]);
      const levels = perItemLevels(skill.observations, exclude);
      h.validationItemIds = levels.map((l) => l.itemId);
      if (levels.length >= MIN_VALIDATION_ITEMS) {
        const m = mean(levels.map((l) => l.level));
        const confirm = h.direction === "STRENGTH" ? m >= hi - 0.5 : m <= lo + 0.5;
        const reject = h.direction === "STRENGTH" ? m < role.expectedLevel + 0.25 : m > role.expectedLevel - 0.25;
        if (confirm) settle(h, "CONFIRMED", next.seq);
        else if (reject || levels.length >= MAX_VALIDATION_ITEMS) {
          // After the third item, decide on the full posterior.
          const est = estimateSkill(next, h.skill).mean;
          const stillHolds = h.direction === "STRENGTH" ? est >= hi - 0.5 : est <= lo + 0.5;
          settle(h, stillHolds && !reject ? "CONFIRMED" : "REJECTED", next.seq);
        }
      }
    }

    // 3. Stress test confirmed strengths: raise difficulty until performance drops.
    if (h.status === "CONFIRMED" && h.direction === "STRENGTH" && !h.stressDone) {
      h.stressItemIds = next.items.filter((i) => i.hypothesisId === h.id && i.purpose === "stress").map((i) => i.itemId);
      if (skill.firstFailed !== null || (skill.bestMet ?? 0) >= 5 || h.stressItemIds.length >= MAX_STRESS_ITEMS) {
        h.stressDone = true;
        h.ceiling = skill.firstFailed !== null ? Math.max(1, skill.firstFailed - 1) : (skill.bestMet ?? null);
      }
    }

    // 4. Test confirmed weaknesses under the other time condition.
    if (h.status === "CONFIRMED" && h.direction === "WEAKNESS" && h.condition === null) {
      const timed = skill.observations.filter((o) => o.timed);
      const untimed = skill.observations.filter((o) => !o.timed);
      h.conditionItemIds = next.items.filter((i) => i.hypothesisId === h.id && i.purpose === "condition").map((i) => i.itemId);
      if (timed.length && untimed.length) {
        const t = mean(timed.map((o) => o.level));
        const u = mean(untimed.map((o) => o.level));
        h.condition = t <= lo + 0.5 && u <= lo + 0.5 ? "general" : t < u - 0.75 ? "time_pressure" : u < t - 0.75 ? "untimed" : "general";
        if (h.condition !== "general" && !skill.flags.includes("conditional")) skill.flags.push("conditional");
      } else if (h.conditionItemIds.length >= 1) {
        h.condition = "general";
      }
    }
  }
  return next;
}

function settle(h: Hypothesis, status: "CONFIRMED" | "REJECTED", seq: number) {
  h.status = status;
  h.resolvedAtSeq = seq;
}

/** Hypotheses that still need items, in priority order (role importance first). */
export function pendingHypothesisWork(model: CandidateModel, role?: RoleProfile): { hypothesis: Hypothesis; purpose: "validate" | "stress" | "condition" }[] {
  const out: { hypothesis: Hypothesis; purpose: "validate" | "stress" | "condition" }[] = [];
  for (const h of model.hypotheses) {
    if (h.status === "OPEN") out.push({ hypothesis: h, purpose: "validate" });
    else if (h.status === "CONFIRMED" && h.direction === "STRENGTH" && !h.stressDone) out.push({ hypothesis: h, purpose: "stress" });
    else if (h.status === "CONFIRMED" && h.direction === "WEAKNESS" && h.condition === null) out.push({ hypothesis: h, purpose: "condition" });
  }
  // Most important skills first; then validation before stress/condition; then oldest.
  const order = { validate: 0, stress: 1, condition: 2 } as const;
  const imp = (k: string) =>
    role ? (role.critical.includes(k) || role.critical.includes(role.domainOf[k] ?? "") ? 2 : 1) * Math.max(0.25, role.skillWeights[k] ?? role.domainWeights[role.domainOf[k] ?? ""] ?? 0.3) : 1;
  return out.sort(
    (a, b) =>
      imp(b.hypothesis.skill) - imp(a.hypothesis.skill) ||
      order[a.purpose] - order[b.purpose] ||
      a.hypothesis.openedAtSeq - b.hypothesis.openedAtSeq,
  );
}
