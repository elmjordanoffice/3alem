import type { ItemType } from "@/lib/assessment/item-schema";
import {
  BASE_OBS_VAR,
  CEILING_BUMP,
  CEILING_VAR_FACTOR,
  DOMAIN_PRIOR_VAR,
  DOMAIN_SPREAD_VAR,
  FOLLOWUP_VAR_FACTOR,
  INCONSISTENCY_VAR_PENALTY,
  PERSON_PRIOR_VAR,
  PRIOR_MEAN,
  SINGLE_ITEM_CONFIDENCE_CAP,
  SINGLE_TYPE_CONFIDENCE_CAP,
  SUBSKILL_SPREAD_VAR,
} from "./config";
import {
  ENGINE_VERSION,
  type CandidateModel,
  type ItemRecord,
  type Observation,
  type RoleProfile,
  type SkillEstimate,
  type SkillState,
  type Stage,
} from "./types";

/**
 * The Candidate Model: for every sub-skill, a level estimate, a confidence and
 * the evidence behind it.
 *
 * Statistically it is a three-level Gaussian model: a person-level general
 * mean (people strong in one area tend to be stronger in others), each domain
 * near the person mean (DOMAIN_SPREAD_VAR), each sub-skill near its domain
 * mean (SUBSKILL_SPREAD_VAR). Every scored answer is a noisy measurement whose
 * noise falls as scorer confidence rises. Evidence flows down the hierarchy,
 * so a sub-skill that was never tested directly still gets a sensible,
 * low-confidence estimate, and a sub-skill's own evidence dominates once it
 * has some.
 *
 * Everything here is pure and JSON-serialisable: the model is snapshotted after
 * every response for audit.
 */

export function createModel(role: RoleProfile): CandidateModel {
  const skills: Record<string, SkillState> = {};
  for (const key of [...role.skillKeys].sort()) {
    skills[key] = { key, domain: role.domainOf[key] ?? key.split(".")[0]!, observations: [], flags: [], bestMet: null, firstFailed: null };
  }
  return { version: ENGINE_VERSION, skills, hypotheses: [], items: [], workStyle: {}, seq: 0, flags: [] };
}

/** A scored answer, as produced by the Scorer for one sub-skill. */
export interface ScoreInput {
  competencyKey: string;
  level: number;
  confidence: number;
  evidenceQuote: string;
  scoreId?: string;
}

/** Measurement variance for one observation. */
export function observationVariance(o: Pick<Observation, "confidence" | "stage" | "level" | "difficulty">): number {
  let r = BASE_OBS_VAR / Math.max(0.25, Math.min(1, o.confidence));
  if (o.stage === "PROBE" || o.stage === "TWIST") r *= FOLLOWUP_VAR_FACTOR;
  if (atItemCeiling(o)) r *= CEILING_VAR_FACTOR;
  return r;
}

/** The answer met everything this item could show: the true level may be higher. */
export function atItemCeiling(o: Pick<Observation, "level" | "difficulty">): boolean {
  return o.level >= o.difficulty + 0.75 && o.level >= 4;
}

/** The value fed to the model (lower-bound observations are nudged up). */
function observationValue(o: Observation): number {
  return atItemCeiling(o) ? Math.min(5.3, o.level + CEILING_BUMP) : o.level;
}

/** Bayesian update of a Gaussian with one measurement. */
function kalman(mean: number, variance: number, value: number, r: number): [number, number] {
  const k = variance / (variance + r);
  return [mean + k * (value - mean), (1 - k) * variance];
}

/** Person-level posterior from observations outside one domain. */
function personPosterior(obs: Observation[]): [number, number] {
  let m = PRIOR_MEAN;
  let v = PERSON_PRIOR_VAR;
  for (const o of obs) [m, v] = kalman(m, v, observationValue(o), observationVariance(o) + SUBSKILL_SPREAD_VAR + DOMAIN_SPREAD_VAR);
  return [m, v];
}

/** Domain posterior: a prior from the rest of the person's evidence, then this domain's evidence. */
function domainPosterior(domainObs: Observation[], otherObs: Observation[]): [number, number] {
  const [pm, pv] = personPosterior(otherObs);
  let m = pm;
  let v = Math.min(DOMAIN_PRIOR_VAR, pv + DOMAIN_SPREAD_VAR);
  for (const o of domainObs) [m, v] = kalman(m, v, observationValue(o), observationVariance(o) + SUBSKILL_SPREAD_VAR);
  return [m, v];
}

function splitByDomain(model: CandidateModel, domain: string, excludeKey?: string) {
  const inDomain: Observation[] = [];
  const outside: Observation[] = [];
  for (const s of Object.values(model.skills)) {
    if (s.key === excludeKey) continue;
    (s.domain === domain ? inDomain : outside).push(...s.observations);
  }
  return { inDomain, outside };
}

function confidenceFromVariance(v: number): number {
  return Math.max(0, Math.min(1, 1 - v / DOMAIN_PRIOR_VAR));
}

/** Current estimate for one sub-skill. */
export function estimateSkill(model: CandidateModel, key: string): SkillEstimate {
  const skill = model.skills[key];
  if (!skill) throw new Error(`Unknown skill ${key}`);
  const { inDomain, outside } = splitByDomain(model, skill.domain, key);
  const [dm, dv] = domainPosterior(inDomain, outside);

  let m = dm;
  let v = dv + SUBSKILL_SPREAD_VAR;
  for (const o of skill.observations) [m, v] = kalman(m, v, observationValue(o), observationVariance(o));
  if (skill.flags.includes("inconsistent")) v += INCONSISTENCY_VAR_PENALTY;

  const distinctItems = new Set(skill.observations.map((o) => o.itemId)).size;
  const distinctTypes = new Set(skill.observations.map((o) => o.itemType)).size;
  let confidence = confidenceFromVariance(v);
  if (skill.observations.length > 0 && distinctItems < 2) confidence = Math.min(confidence, SINGLE_ITEM_CONFIDENCE_CAP);
  else if (distinctItems >= 2 && distinctTypes < 2) confidence = Math.min(confidence, SINGLE_TYPE_CONFIDENCE_CAP);

  return {
    key,
    domain: skill.domain,
    mean: clampLevel(m),
    variance: v,
    confidence,
    observations: skill.observations.length,
    distinctItems,
    distinctTypes,
  };
}

/** Domain-level estimate: pooled evidence from all its sub-skills. */
export function estimateDomain(model: CandidateModel, domain: string): SkillEstimate {
  const { inDomain: obs, outside } = splitByDomain(model, domain);
  const [m, v] = domainPosterior(obs, outside);
  const distinctItems = new Set(obs.map((o) => o.itemId)).size;
  const distinctTypes = new Set(obs.map((o) => o.itemType)).size;
  let confidence = confidenceFromVariance(v);
  if (obs.length > 0 && distinctItems < 2) confidence = Math.min(confidence, SINGLE_ITEM_CONFIDENCE_CAP);
  return { key: domain, domain, mean: clampLevel(m), variance: v, confidence, observations: obs.length, distinctItems, distinctTypes };
}

/**
 * What the model would predict for a sub-skill from everything except one
 * observation: used to decide whether an answer is surprising.
 */
export function predictedLevel(model: CandidateModel, key: string, excludeSeq: number): number {
  const copy: CandidateModel = { ...model, skills: { ...model.skills } };
  const skill = model.skills[key];
  if (!skill) return PRIOR_MEAN;
  copy.skills[key] = { ...skill, observations: skill.observations.filter((o) => o.seq !== excludeSeq) };
  return estimateSkill(copy, key).mean;
}

/** Confidence for a key that may be a domain or a sub-skill. */
export function confidenceOf(model: CandidateModel, key: string): number {
  return model.skills[key] ? estimateSkill(model, key).confidence : estimateDomain(model, key).confidence;
}

export function domainsOf(model: CandidateModel): string[] {
  return [...new Set(Object.values(model.skills).map((s) => s.domain))].sort();
}

function clampLevel(x: number) {
  return Math.min(5, Math.max(1, x));
}

export interface ItemScoreBatch {
  item: Pick<ItemRecord, "itemId" | "type" | "difficulty" | "timed">;
  stage: Stage;
  scores: ScoreInput[];
}

/**
 * updateModel(model, scores) → new model. Pure: returns a copy.
 *
 * - Adds each score as an observation.
 * - Flags a sub-skill as inconsistent when a new answer is more than two
 *   standard deviations from what the model expected (lowers confidence).
 * - Tracks the highest difficulty met and the first difficulty failed, which
 *   the stress test uses to find a ceiling.
 */
export function updateModel(model: CandidateModel, batch: ItemScoreBatch): CandidateModel {
  const next: CandidateModel = structuredClone(model);
  for (const s of batch.scores) {
    const skill = next.skills[s.competencyKey];
    if (!skill) continue; // Scorer mentioned a skill outside this session's map; ignore.
    const level = clampLevel(s.level);
    const before = skill.observations.length ? estimateSkill(next, skill.key) : null;

    next.seq += 1;
    const obs: Observation = {
      itemId: batch.item.itemId,
      stage: batch.stage,
      level,
      confidence: Math.max(0, Math.min(1, s.confidence)),
      difficulty: batch.item.difficulty,
      itemType: batch.item.type as ItemType,
      timed: batch.item.timed,
      evidenceQuote: s.evidenceQuote,
      scoreId: s.scoreId,
      seq: next.seq,
    };
    skill.observations.push(obs);

    // Only compare against evidence from other items: a probe disagreeing with
    // its own main answer is not an inconsistency across contexts.
    if (before && skill.observations.some((o) => o.itemId !== obs.itemId)) {
      const sd = Math.sqrt(before.variance + observationVariance(obs));
      if (Math.abs(level - before.mean) > 2 * sd && !skill.flags.includes("inconsistent")) {
        skill.flags.push("inconsistent");
        next.flags.push({ kind: "inconsistent", detail: skill.key, seq: next.seq });
      }
    }

    if (batch.stage === "MAIN" || batch.stage === "ROLE_PLAY_TURN") {
      const d = batch.item.difficulty;
      if (level >= d - 0.25) skill.bestMet = Math.max(skill.bestMet ?? 0, d);
      else if (skill.bestMet !== null && d > skill.bestMet) skill.firstFailed = Math.min(skill.firstFailed ?? 6, d);
      if (atItemCeiling(obs) && !skill.flags.includes("ceiling_not_found")) skill.flags.push("ceiling_not_found");
      if (skill.firstFailed !== null) skill.flags = skill.flags.filter((f) => f !== "ceiling_not_found");
    }
  }
  return next;
}

/** Record that an item was presented (for budget, type mix and chapters). */
export function recordItem(model: CandidateModel, item: ItemRecord): CandidateModel {
  const next = structuredClone(model);
  next.items.push(item);
  return next;
}

/** Forced-choice answers add to work-style tallies (styles, never scores). */
export function recordWorkStyle(model: CandidateModel, picks: { style: string; pole: "a" | "b" }[]): CandidateModel {
  const next = structuredClone(model);
  for (const p of picks) {
    const t = (next.workStyle[p.style] ??= { a: 0, b: 0 });
    t[p.pole] += 1;
  }
  return next;
}

/** All estimates, sorted by key. */
export function allEstimates(model: CandidateModel): SkillEstimate[] {
  return Object.keys(model.skills)
    .sort()
    .map((k) => estimateSkill(model, k));
}
