import type { ItemType, Dials } from "@/lib/assessment/item-schema";

export const ENGINE_VERSION = "engine-1.0.0";

export type Stage = "MAIN" | "PROBE" | "TWIST" | "ROLE_PLAY_TURN";

/** One scored piece of evidence about one sub-skill. */
export interface Observation {
  itemId: string;
  stage: Stage;
  /** Scorer level, 1–5 (may be fractional when two passes are averaged). */
  level: number;
  /** Scorer confidence, 0–1. */
  confidence: number;
  /** Difficulty of the item the observation came from, 1–5. */
  difficulty: number;
  itemType: ItemType;
  /** Whether the task was under time pressure (timePressure dial ≥ 4 or a timed task). */
  timed: boolean;
  evidenceQuote: string;
  /** Database id of the ItemScore, when persisted. */
  scoreId?: string;
  /** Order in which the observation arrived. */
  seq: number;
}

export interface SkillState {
  key: string;
  domain: string;
  observations: Observation[];
  flags: SkillFlag[];
  /** Highest difficulty met (level ≥ difficulty − 0.25). */
  bestMet: number | null;
  /** Lowest difficulty failed after a success below it. */
  firstFailed: number | null;
}

export type SkillFlag = "inconsistent" | "ceiling_not_found" | "conditional";

export type HypothesisDirection = "STRENGTH" | "WEAKNESS";
export type HypothesisStatus = "OPEN" | "CONFIRMED" | "REJECTED";

export interface Hypothesis {
  id: string;
  skill: string;
  direction: HypothesisDirection;
  status: HypothesisStatus;
  /** The observation that triggered it. */
  trigger: { itemId: string; level: number; quote: string };
  /** Items used to validate (never the triggering item). */
  validationItemIds: string[];
  /** For strengths: the stress-test result. */
  ceiling: number | null;
  stressItemIds: string[];
  stressDone: boolean;
  /** For weaknesses: where it shows up. */
  condition: "general" | "time_pressure" | "untimed" | null;
  conditionItemIds: string[];
  openedAtSeq: number;
  resolvedAtSeq: number | null;
}

export interface ItemRecord {
  itemId: string;
  type: ItemType;
  difficulty: number;
  targets: string[];
  minutes: number;
  chapter: number;
  purpose: TargetPurpose;
  timed: boolean;
  hypothesisId?: string;
}

export interface WorkStyleTally {
  /** Counts of choices towards pole a and pole b. */
  a: number;
  b: number;
}

export interface CandidateModel {
  version: string;
  skills: Record<string, SkillState>;
  hypotheses: Hypothesis[];
  items: ItemRecord[];
  workStyle: Record<string, WorkStyleTally>;
  /** Monotonic counter for observations. */
  seq: number;
  /** Integrity/consistency flags raised during the session (context only). */
  flags: { kind: string; detail: string; seq: number }[];
}

export type TargetPurpose = "calibrate" | "explore" | "validate" | "stress" | "condition";

/** What to test next. The language model (or the bank) turns this into an item. */
export interface Target {
  /** Sub-skill keys, primary first (1–3). */
  skills: string[];
  difficulty: number;
  itemType: ItemType;
  purpose: TargetPurpose;
  hypothesisId?: string;
  /** Run this one under time pressure (condition tests, inbox). */
  timed: boolean;
  estMinutes: number;
  dials: Dials;
  /** Item types already used for the primary skill, to disguise repetition. */
  avoidTypes: ItemType[];
  /** Short reason, logged for audit. */
  reason: string;
}

/** How the role shapes the assessment. Built from the template's skill weights. */
export interface RoleProfile {
  /** Importance per sub-skill key (0–1). Unlisted sub-skills get the domain weight. */
  skillWeights: Record<string, number>;
  /** Importance per domain key (0–1). */
  domainWeights: Record<string, number>;
  /** Domain or sub-skill keys that are must-haves. */
  critical: string[];
  /** Level a solid hire at this seniority shows (2.5 junior … 4 executive). */
  expectedLevel: number;
  /** All sub-skill keys in play (framework + role-specific technical). */
  skillKeys: string[];
  /** Sub-skill → domain. */
  domainOf: Record<string, string>;
}

export interface Budget {
  totalMinutes: number;
  elapsedMinutes: number;
}

export interface SkillEstimate {
  key: string;
  domain: string;
  mean: number;
  variance: number;
  confidence: number;
  observations: number;
  distinctItems: number;
  distinctTypes: number;
}
