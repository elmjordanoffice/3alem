/**
 * Competency framework types.
 *
 * The framework is stored as data so organisations can extend it. This file
 * defines the shape of the built-in framework that is seeded into the
 * database (CompetencyDomain, Competency) on first run.
 */

export type Locale = "en" | "ar";

/** Text in every supported language. */
export type LocalizedText = Record<Locale, string>;

/** Proficiency levels used everywhere in Aalim. */
export type Level = 1 | 2 | 3 | 4 | 5;

/** One written behavioural anchor per level. */
export type LevelAnchors = Record<Level, LocalizedText>;

export interface SubSkillDef {
  /** Stable, kebab-case key, unique across the framework, e.g. "critical-thinking.evaluating-evidence". */
  key: string;
  name: LocalizedText;
  /** One sentence: what this sub-skill is. */
  description: LocalizedText;
  /** Observable behaviour at each level. Written so a scorer can match a response to it. */
  anchors: LevelAnchors;
}

export interface DomainDef {
  /** Stable, kebab-case key, e.g. "critical-thinking". */
  key: string;
  /** 1-based display order. */
  order: number;
  name: LocalizedText;
  description: LocalizedText;
  /** "What a high level looks like" in one sentence. */
  highLevel: LocalizedText;
  /**
   * True for the technical / domain-expertise domain. Its sub-skills here are
   * generic placeholders; the JD Analyst generates role-specific ones.
   */
  generatedFromJobDescription?: boolean;
  subSkills: SubSkillDef[];
}

/** Work-style tendencies are reported as styles between two poles, never as scores. */
export interface WorkStyleDef {
  key: string;
  name: LocalizedText;
  description: LocalizedText;
  poles: { a: LocalizedText; b: LocalizedText };
}

export interface LevelNameDef {
  level: Level;
  name: LocalizedText;
}
