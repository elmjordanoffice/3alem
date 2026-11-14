import { ITEM_TYPES, PRODUCTION_TYPES, type ItemType } from "@/lib/assessment/item-schema";
import {
  CALIBRATION_DIFFICULTY,
  CRITICAL_STOP_CONFIDENCE,
  ITEM_MINUTES,
  MAX_CALIBRATION_ITEMS,
  MIN_ITEM_MINUTES,
  MIN_PRODUCTION_SHARE,
  SKILL_CLOSE_CONFIDENCE,
  SKILL_MAX_ITEMS,
  TYPE_AFFINITY,
  dialsFor,
} from "./config";
import { pendingHypothesisWork } from "./hypotheses";
import { confidenceOf, domainsOf, estimateSkill } from "./model";
import type { Budget, CandidateModel, RoleProfile, Target, TargetPurpose } from "./types";

/**
 * selectNextTarget(model, role, budget) → what to test next, or null.
 *
 * Deterministic and tested. Priority:
 *   1. Calibrate: cover every domain once at medium difficulty, including a
 *      role work sample.
 *   2. Hypotheses: validate open ones, stress-test confirmed strengths,
 *      condition-test confirmed weaknesses.
 *   3. Explore: the sub-skill with the most to learn = (1 − confidence) ×
 *      importance to the role, paired with companions an item can measure too.
 * It never schedules an item that would run past the time budget.
 */

/** The most general sub-skill per domain, used for calibration. */
export const CALIBRATION_ANCHORS: Record<string, string> = {
  technical: "technical.problem-diagnosis",
  "critical-thinking": "critical-thinking.evaluating-evidence",
  judgment: "judgment.trade-off-reasoning",
  leadership: "leadership.ownership",
  management: "management.planning-prioritisation",
  communication: "communication.clarity-structure",
  "product-thinking": "product-thinking.problem-framing",
  collaboration: "collaboration.stakeholder-management",
  adaptability: "adaptability.handling-new-information",
};

const ONCE_PER_SESSION: ItemType[] = ["INBOX", "FORCED_CHOICE_WORK_STYLE", "CONSEQUENCE_CHAIN"];
const MAX_PER_SESSION: Partial<Record<ItemType, number>> = { ROLE_PLAY: 2, REFLECTION: 1 };

export function remainingMinutes(budget: Budget) {
  return Math.max(0, budget.totalMinutes - budget.elapsedMinutes);
}

/** Which story chapter (1–4) a moment in the session belongs to. */
export function chapterFor(budget: Budget, chapters = 4): number {
  const f = budget.elapsedMinutes / Math.max(1, budget.totalMinutes);
  return Math.min(chapters, Math.max(1, Math.floor(f * chapters) + 1));
}

export function importanceOf(role: RoleProfile, key: string): number {
  const domain = role.domainOf[key] ?? key;
  const base = role.skillWeights[key] ?? role.domainWeights[domain] ?? 0.25;
  const critical = role.critical.includes(key) || role.critical.includes(domain);
  // Every domain gets at least a baseline; must-haves count double.
  return Math.max(0.25, base) * (critical ? 2 : 1);
}

function typeCount(model: CandidateModel, type: ItemType) {
  return model.items.filter((i) => i.type === type).length;
}

function typeAllowed(model: CandidateModel, type: ItemType) {
  if (type === "FORCED_CHOICE_WORK_STYLE") return false; // scheduled explicitly
  if (ONCE_PER_SESSION.includes(type) && typeCount(model, type) >= 1) return false;
  const max = MAX_PER_SESSION[type];
  return max === undefined || typeCount(model, type) < max;
}

function productionShareWith(model: CandidateModel, type: ItemType) {
  const items = [...model.items.map((i) => i.type), type].filter((t) => t !== "FORCED_CHOICE_WORK_STYLE");
  return items.filter((t) => PRODUCTION_TYPES.includes(t)).length / Math.max(1, items.length);
}

/** Skills already targeted by an item that has been presented but not yet scored. */
function inFlightSkills(model: CandidateModel): Set<string> {
  const scored = new Set(Object.values(model.skills).flatMap((s) => s.observations.map((o) => o.itemId)));
  return new Set(model.items.filter((i) => !scored.has(i.itemId)).flatMap((i) => i.targets));
}

function isClosed(model: CandidateModel, key: string) {
  const e = estimateSkill(model, key);
  return e.confidence >= SKILL_CLOSE_CONFIDENCE || e.distinctItems >= SKILL_MAX_ITEMS;
}

function difficultyFor(model: CandidateModel, key: string) {
  const e = estimateSkill(model, key);
  if (e.observations === 0) return CALIBRATION_DIFFICULTY;
  return Math.min(5, Math.max(2, Math.round(e.mean)));
}

function makeTarget(
  skills: string[],
  type: ItemType,
  difficulty: number,
  purpose: TargetPurpose,
  timed: boolean,
  model: CandidateModel,
  reason: string,
  hypothesisId?: string,
): Target {
  const primary = model.skills[skills[0]!];
  const avoidTypes = [...new Set((primary?.observations ?? []).map((o) => o.itemType))];
  return {
    skills,
    itemType: type,
    difficulty,
    purpose,
    timed: timed || type === "INBOX",
    estMinutes: ITEM_MINUTES[type],
    dials: dialsFor(difficulty, timed || type === "INBOX"),
    avoidTypes,
    reason,
    hypothesisId,
  };
}

/** Pick the best item type for a primary skill and the companions it can carry. */
function chooseType(
  model: CandidateModel,
  role: RoleProfile,
  primary: string,
  remaining: number,
  avoid: ItemType[],
): ItemType | null {
  const domain = role.domainOf[primary] ?? primary.split(".")[0]!;
  const last = model.items.at(-1)?.type;
  let candidates = ITEM_TYPES.filter(
    (t) => (TYPE_AFFINITY[t][domain] ?? 0) >= 0.5 && ITEM_MINUTES[t] <= remaining && typeAllowed(model, t),
  );
  if (candidates.length === 0) return null;
  // Keep at least 60% production tasks.
  const production = candidates.filter((t) => productionShareWith(model, t) >= MIN_PRODUCTION_SHARE);
  if (production.length) candidates = production;
  // Disguised repetition: prefer a format this skill has not been seen in.
  const fresh = candidates.filter((t) => !avoid.includes(t));
  if (fresh.length) candidates = fresh;
  // Don't run the same format twice in a row.
  const varied = candidates.filter((t) => t !== last);
  if (varied.length) candidates = varied;
  // Highest affinity; prefer shorter items late in the session.
  return [...candidates].sort(
    (a, b) =>
      (TYPE_AFFINITY[b][domain] ?? 0) - (TYPE_AFFINITY[a][domain] ?? 0) ||
      (remaining < 15 ? ITEM_MINUTES[a] - ITEM_MINUTES[b] : 0) ||
      a.localeCompare(b),
  )[0]!;
}

/** Up to two companions from other domains that this item type can also measure. */
function companions(
  model: CandidateModel,
  role: RoleProfile,
  type: ItemType,
  primary: string,
  value: (k: string) => number,
  exclude: Set<string>,
): string[] {
  const usedDomains = new Set([role.domainOf[primary]]);
  const out: string[] = [];
  const ranked = role.skillKeys
    .filter((k) => k !== primary && !exclude.has(k) && (TYPE_AFFINITY[type][role.domainOf[k] ?? ""] ?? 0) >= 0.4)
    .sort((a, b) => value(b) - value(a) || a.localeCompare(b));
  for (const k of ranked) {
    const d = role.domainOf[k]!;
    if (usedDomains.has(d) || value(k) <= 0) continue;
    usedDomains.add(d);
    out.push(k);
    if (out.length === 2) break;
  }
  return out;
}

export function selectNextTarget(model: CandidateModel, role: RoleProfile, budget: Budget): Target | null {
  const remaining = remainingMinutes(budget);
  if (remaining < MIN_ITEM_MINUTES) return null;

  const covered = new Set(model.items.flatMap((i) => i.targets.map((t) => role.domainOf[t] ?? t)));
  const domains = domainsOf(model);
  const calibrated = model.items.filter((i) => i.purpose === "calibrate").length;

  // 1. Calibrate.
  const uncovered = domains.filter((d) => !covered.has(d));
  if (uncovered.length && calibrated < MAX_CALIBRATION_ITEMS) {
    const anchor = (d: string) => {
      if (d === "technical") {
        const tech = role.skillKeys.filter((k) => role.domainOf[k] === "technical");
        return [...tech].sort((a, b) => importanceOf(role, b) - importanceOf(role, a) || a.localeCompare(b))[0] ?? CALIBRATION_ANCHORS.technical!;
      }
      return CALIBRATION_ANCHORS[d] ?? role.skillKeys.find((k) => role.domainOf[k] === d)!;
    };
    // The role work sample comes first when the technical domain is uncovered.
    const firstWorkSample = uncovered.includes("technical") && calibrated === 0 && ITEM_MINUTES.TECHNICAL_TASK <= remaining;
    const types: ItemType[] = firstWorkSample
      ? ["TECHNICAL_TASK"]
      : ITEM_TYPES.filter((t) => typeAllowed(model, t) && ITEM_MINUTES[t] <= Math.min(remaining, 8));
    let best: { type: ItemType; skills: string[]; score: number } | null = null;
    for (const t of types) {
      const fits = uncovered
        .filter((d) => (TYPE_AFFINITY[t][d] ?? 0) >= 0.4)
        .sort((a, b) => (TYPE_AFFINITY[t][b] ?? 0) - (TYPE_AFFINITY[t][a] ?? 0) || importanceOf(role, b) - importanceOf(role, a));
      const skills = fits.slice(0, 3).map(anchor);
      const score = skills.length * 10 - ITEM_MINUTES[t] + (PRODUCTION_TYPES.includes(t) ? 1 : 0);
      if (skills.length && (!best || score > best.score)) best = { type: t, skills, score };
    }
    if (best) {
      return makeTarget(best.skills, best.type, CALIBRATION_DIFFICULTY, "calibrate", false, model, `calibrate ${uncovered.join(", ")}`);
    }
  }

  // Work style: one forced-choice set after calibration, while there is room.
  if (typeCount(model, "FORCED_CHOICE_WORK_STYLE") === 0 && calibrated >= 3 && remaining >= 12) {
    return makeTarget(["collaboration.self-awareness"], "FORCED_CHOICE_WORK_STYLE", 2, "explore", false, model, "work-style tendencies");
  }

  const inFlight = inFlightSkills(model);
  const value = (k: string) => (isClosed(model, k) || inFlight.has(k) ? 0 : (1 - estimateSkill(model, k).confidence) * importanceOf(role, k));

  // 2. Hypotheses.
  const pending = pendingHypothesisWork(model, role);
  for (const { hypothesis: h, purpose } of pending) {
    if (inFlight.has(h.skill)) continue;
    const skill = model.skills[h.skill]!;
    const triggerType = model.items.find((i) => i.itemId === h.trigger.itemId)?.type;
    const avoid = [...new Set([...(triggerType ? [triggerType] : []), ...skill.observations.map((o) => o.itemType)])];
    const type = chooseType(model, role, h.skill, remaining, avoid);
    if (!type) continue;
    let difficulty = model.items.find((i) => i.itemId === h.trigger.itemId)?.difficulty ?? difficultyFor(model, h.skill);
    let timed = false;
    if (purpose === "stress") difficulty = Math.min(5, (skill.bestMet ?? difficulty) + 1);
    if (purpose === "condition") {
      const triggerTimed = skill.observations.find((o) => o.itemId === h.trigger.itemId)?.timed ?? false;
      timed = !triggerTimed;
    }
    // Validate a second open hypothesis in the same item when the format suits it.
    const pairable = pending
      .filter((w) => w.purpose === "validate" && w.hypothesis.id !== h.id && !inFlight.has(w.hypothesis.skill))
      .map((w) => w.hypothesis.skill)
      .find((k) => role.domainOf[k] !== role.domainOf[h.skill] && (TYPE_AFFINITY[type][role.domainOf[k] ?? ""] ?? 0) >= 0.4 && k !== h.skill);
    const extra = pairable ? [pairable] : companions(model, role, type, h.skill, value, new Set([h.skill])).slice(0, 1);
    return makeTarget([h.skill, ...extra], type, difficulty, purpose, timed, model, `${purpose} ${h.direction.toLowerCase()} in ${h.skill}`, h.id);
  }

  // 3. Explore.
  const ranked = role.skillKeys.map((k) => ({ k, v: value(k) })).filter((x) => x.v > 0.02).sort((a, b) => b.v - a.v || a.k.localeCompare(b.k));
  for (const { k: primary } of ranked) {
    const avoid = [...new Set(model.skills[primary]!.observations.map((o) => o.itemType))];
    const type = chooseType(model, role, primary, remaining, avoid);
    if (!type) continue;
    const extra = companions(model, role, type, primary, value, new Set([primary]));
    return makeTarget([primary, ...extra], type, difficultyFor(model, primary), "explore", false, model, `explore ${primary}`);
  }
  return null;
}

/**
 * shouldStop(model, role, budget): end when the budget is spent, or when every
 * role-critical skill is known well enough, every domain has a baseline and no
 * hypothesis is waiting for evidence.
 */
export function shouldStop(model: CandidateModel, role: RoleProfile, budget: Budget): boolean {
  if (remainingMinutes(budget) < MIN_ITEM_MINUTES) return true;
  const baseline = domainsOf(model).every((d) => Object.values(model.skills).some((s) => s.domain === d && s.observations.length > 0));
  const criticalKnown = role.critical.every((k) => confidenceOf(model, k) >= CRITICAL_STOP_CONFIDENCE);
  const hypothesesSettled = pendingHypothesisWork(model, role).length === 0;
  if (baseline && criticalKnown && hypothesesSettled) return true;
  return selectNextTarget(model, role, budget) === null;
}
