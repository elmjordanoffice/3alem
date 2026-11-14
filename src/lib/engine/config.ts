import type { Dials, ItemType } from "@/lib/assessment/item-schema";

/** Model constants. Changing any of these bumps ENGINE_VERSION. */
export const PRIOR_MEAN = 3;
/** Prior variance of the person's general level (the positive manifold). */
export const PERSON_PRIOR_VAR = 0.6;
/** How far a domain typically sits from the person's general level (variance). */
export const DOMAIN_SPREAD_VAR = 0.45;
/** Prior variance of a domain mean before any evidence (person + domain spread). */
export const DOMAIN_PRIOR_VAR = 1.0;
/** How far a sub-skill typically sits from its domain (variance). */
export const SUBSKILL_SPREAD_VAR = 0.35;
/** Measurement variance of one scored observation at scorer confidence 1. */
export const BASE_OBS_VAR = 0.42;
/** Follow-ups (probe, twist) are shorter answers: a little noisier. */
export const FOLLOWUP_VAR_FACTOR = 1.25;
/** An answer that exceeds what the item could show is a lower bound: treat as noisier. */
export const CEILING_VAR_FACTOR = 1.6;
export const CEILING_BUMP = 0.3;

/** Stop rules from the brief. */
export const SKILL_CLOSE_CONFIDENCE = 0.8;
export const SKILL_MAX_ITEMS = 3;
export const CRITICAL_STOP_CONFIDENCE = 0.75;
/** One answer never establishes a trait: cap confidence until two different items agree. */
export const SINGLE_ITEM_CONFIDENCE_CAP = 0.6;
/** Two items of the same type are not two contexts: cap until a second type agrees. */
export const SINGLE_TYPE_CONFIDENCE_CAP = 0.79;
/** Inconsistent evidence (> 2 SD apart) adds this much variance. */
export const INCONSISTENCY_VAR_PENALTY = 0.12;

/** Hypotheses. */
export const MAX_VALIDATION_ITEMS = 3;
export const MIN_VALIDATION_ITEMS = 2;
export const MAX_STRESS_ITEMS = 2;
/** At most this many hypotheses open at once, and per session. */
export const MAX_OPEN_HYPOTHESES = 3;
export const MAX_HYPOTHESES = 6;
/** An answer must beat the person's own predicted level by this much to open a hypothesis. */
export const SURPRISE_THRESHOLD = 0.9;

/** Share of items that must be production tasks. */
export const MIN_PRODUCTION_SHARE = 0.6;

/** Calibration covers every domain at medium difficulty. */
export const CALIBRATION_DIFFICULTY = 3;
export const MAX_CALIBRATION_ITEMS = 5;

/** Typical minutes per item type, including probe and twist. */
export const ITEM_MINUTES: Record<ItemType, number> = {
  TRADE_OFF_DILEMMA: 4,
  RANKING_ALLOCATION: 4,
  INBOX: 15,
  ROLE_PLAY: 8,
  CASE_ANALYSIS: 6,
  DESIGN_CHALLENGE: 7,
  WRITTEN_WORK_SAMPLE: 6,
  TECHNICAL_TASK: 7,
  CONSEQUENCE_CHAIN: 8,
  REFLECTION: 3,
  FORCED_CHOICE_WORK_STYLE: 3,
};

/** The shortest item; below this much time left, the session ends. */
export const MIN_ITEM_MINUTES = 3;

/**
 * Which item types measure which domains well (0–1). Drives type choice so
 * each skill is tested in a format that can actually show it.
 */
export const TYPE_AFFINITY: Record<ItemType, Record<string, number>> = {
  TRADE_OFF_DILEMMA: { judgment: 1, leadership: 0.7, "critical-thinking": 0.5, management: 0.4, collaboration: 0.4, adaptability: 0.4 },
  RANKING_ALLOCATION: { management: 1, judgment: 0.7, "critical-thinking": 0.4, "product-thinking": 0.4 },
  INBOX: { management: 0.9, communication: 0.8, judgment: 0.6, adaptability: 0.6, "critical-thinking": 0.4 },
  ROLE_PLAY: { communication: 1, collaboration: 1, leadership: 0.8, management: 0.5, adaptability: 0.5 },
  CASE_ANALYSIS: { "critical-thinking": 1, technical: 0.6, judgment: 0.5, "product-thinking": 0.3 },
  DESIGN_CHALLENGE: { "product-thinking": 1, "critical-thinking": 0.5, collaboration: 0.3 },
  WRITTEN_WORK_SAMPLE: { communication: 1, collaboration: 0.6, leadership: 0.6, management: 0.5 },
  TECHNICAL_TASK: { technical: 1, "critical-thinking": 0.6 },
  CONSEQUENCE_CHAIN: { judgment: 1, adaptability: 0.9, management: 0.6, leadership: 0.5 },
  REFLECTION: { collaboration: 0.8, adaptability: 0.8 },
  FORCED_CHOICE_WORK_STYLE: {},
};

/** Item types that rely on a role-specific work sample. */
export const WORK_SAMPLE_TYPES: ItemType[] = ["TECHNICAL_TASK", "CASE_ANALYSIS", "WRITTEN_WORK_SAMPLE"];

/** Default dial settings for each difficulty level. */
export function dialsFor(difficulty: number, timed: boolean): Dials {
  const d = Math.min(5, Math.max(1, Math.round(difficulty)));
  return {
    ambiguity: d,
    stakeholders: Math.min(5, Math.max(1, d)),
    conflictingConstraints: Math.min(5, Math.max(1, d)),
    stakes: Math.min(5, Math.max(2, d)),
    timePressure: timed ? Math.max(4, d) : Math.min(3, d),
    informationGaps: Math.min(5, Math.max(1, d - 1)),
  };
}

/** Expected level for a role at each seniority. */
export const SENIORITY_LEVEL: Record<string, number> = {
  entry: 2.5,
  mid: 3,
  senior: 3.5,
  lead: 3.75,
  executive: 4,
};
