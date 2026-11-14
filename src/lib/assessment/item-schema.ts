import { z } from "zod";
import { material } from "./materials";

/**
 * The item contract shared by the Item Generator (AI), the curated item bank
 * and the candidate UI.
 *
 * - `ItemContent` is candidate-visible. It is sent to the browser.
 * - `ItemHidden` (rubric, indicators, red flags, embedded detail, option notes)
 *   is NEVER sent to the browser. It goes only to the Scorer.
 *
 * Schemas avoid open-ended records so they work with structured outputs.
 */

export const ITEM_TYPES = [
  "TRADE_OFF_DILEMMA",
  "RANKING_ALLOCATION",
  "INBOX",
  "ROLE_PLAY",
  "CASE_ANALYSIS",
  "DESIGN_CHALLENGE",
  "WRITTEN_WORK_SAMPLE",
  "TECHNICAL_TASK",
  "CONSEQUENCE_CHAIN",
  "REFLECTION",
  "FORCED_CHOICE_WORK_STYLE",
] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

/** Types where the person produces something (≥60% of items must be these). */
export const PRODUCTION_TYPES: readonly ItemType[] = [
  "INBOX",
  "ROLE_PLAY",
  "DESIGN_CHALLENGE",
  "WRITTEN_WORK_SAMPLE",
  "TECHNICAL_TASK",
  "RANKING_ALLOCATION",
  "CASE_ANALYSIS",
  "REFLECTION",
];

const choiceOption = z.object({
  id: z.string(),
  label: z.string(),
  detail: z.string().optional(),
});

const listEntry = z.object({ id: z.string(), label: z.string(), detail: z.string().optional() });

const inboxMessage = z.object({
  id: z.string(),
  from: z.object({ name: z.string(), role: z.string().optional() }),
  subject: z.string(),
  receivedAt: z.string(),
  body: z.string(),
  footnote: z.string().optional(),
});

/** One round of a consequence chain. `consequences` say what happens after each option. */
const chainRound = z.object({
  id: z.string(),
  situation: z.string(),
  options: z.array(choiceOption).min(2).max(4),
  /** What happens next for each option id; shown at the start of the next round. */
  consequences: z.array(z.object({ optionId: z.string(), text: z.string() })),
});

const forcedChoicePair = z.object({
  id: z.string(),
  a: z.object({ id: z.string(), text: z.string() }),
  b: z.object({ id: z.string(), text: z.string() }),
});

export const taskSchema = z.object({
  kind: z.enum(["choice", "ranking", "allocation", "written", "inbox", "roleplay", "design", "chain", "forced_choice"]),
  /** The instruction, as a verb: "Choose…", "Rank…", "Write…". */
  prompt: z.string(),
  /** choice: 3–4 defensible options, each with a real cost. */
  options: z.array(choiceOption).optional(),
  /** choice: ask for a short justification with the choice. */
  requireJustification: z.boolean().optional(),
  /** ranking: 5–7 entries. */
  rankItems: z.array(listEntry).optional(),
  /** allocation: points to split across rows. */
  allocation: z.object({ total: z.number().int(), rows: z.array(listEntry).min(2).max(6) }).optional(),
  /** written: format hint for the answer. */
  written: z.object({ format: z.enum(["email", "memo", "message", "plan", "free"]), placeholder: z.string().optional() }).optional(),
  /** inbox: 6–8 messages; the person triages all and replies to `replyCount`. */
  inbox: z.object({ messages: z.array(inboxMessage).min(4).max(10), replyCount: z.number().int().min(1).max(3) }).optional(),
  /** roleplay: the stakeholder's public card and opening line. Hidden goals live in ItemHidden. */
  roleplay: z
    .object({
      stakeholder: z.object({ name: z.string(), role: z.string(), context: z.string() }),
      openingLine: z.string(),
      maxTurns: z.number().int().min(3).max(12),
    })
    .optional(),
  /** design: structured answer blocks. */
  design: z.object({ sections: z.array(z.object({ id: z.string(), label: z.string(), hint: z.string() })).min(2).max(5) }).optional(),
  /** chain: 3–5 rounds. */
  chain: z.object({ rounds: z.array(chainRound).min(3).max(5) }).optional(),
  /** forced_choice: pairs of equally attractive statements. */
  forcedChoice: z.object({ pairs: z.array(forcedChoicePair).min(4).max(12) }).optional(),
});
export type ItemTask = z.infer<typeof taskSchema>;

export const followUpSchema = z.object({
  prompt: z.string(),
  /** For a twist: the single constraint that changes, shown before the prompt. */
  change: z.string().optional(),
});

export const itemContentSchema = z.object({
  /** Short title shown above the scenario, e.g. "The payment bug". */
  title: z.string(),
  /** At most ~180 words. */
  scenario: z.string(),
  materials: z.array(material),
  task: taskSchema,
  /** "Why?", "What do you do first?", "What would change your mind?" */
  probe: followUpSchema.optional(),
  /** Changes one constraint and asks again. */
  twist: followUpSchema.optional(),
  /** Only for timed tasks (inbox). Never shown as a countdown elsewhere. */
  timeLimitSeconds: z.number().int().optional(),
});
export type ItemContent = z.infer<typeof itemContentSchema>;

export const rubricEntrySchema = z.object({
  competencyKey: z.string(),
  /** Item-specific behavioural anchors for levels 1..5, in order. */
  anchors: z.array(z.string()).length(5),
});

/** A strong-answer indicator or red flag, with words a careful reader would use. */
export const signalSchema = z.object({
  text: z.string(),
  competencyKey: z.string(),
  /** Lower-case words/phrases used by the offline scorer to spot the signal. */
  keywords: z.array(z.string()),
});

export const itemHiddenSchema = z.object({
  rubric: z.array(rubricEntrySchema).min(1),
  strongIndicators: z.array(signalSchema),
  redFlags: z.array(signalSchema),
  embeddedDetail: z
    .object({
      description: z.string(),
      /** Where it is hidden, e.g. "email footnote", "row East in the table". */
      location: z.string(),
      keywords: z.array(z.string()),
    })
    .nullable(),
  /** For choices: why each option is defensible, and its cost. */
  optionNotes: z.array(z.object({ optionId: z.string(), defensibleBecause: z.string(), cost: z.string() })).optional(),
  /** Role-play: what the stakeholder really wants and how their mood moves. */
  roleplayBrief: z
    .object({
      hiddenGoals: z.array(z.string()),
      startingMood: z.enum(["calm", "guarded", "frustrated", "angry", "sceptical"]),
      softensWhen: z.array(z.string()),
      hardensWhen: z.array(z.string()),
      resolution: z.string(),
    })
    .optional(),
  /** Forced choice: which work-style pole each statement indicates. */
  workStyleMap: z
    .array(z.object({ pairId: z.string(), a: z.object({ style: z.string(), pole: z.enum(["a", "b"]) }), b: z.object({ style: z.string(), pole: z.enum(["a", "b"]) }) }))
    .optional(),
  /** Which sub-skills the probe and twist answers mainly show. */
  probeTargets: z.array(z.string()).optional(),
  twistTargets: z.array(z.string()).optional(),
});
export type ItemHidden = z.infer<typeof itemHiddenSchema>;

/** The six difficulty dials, each 1–5. */
export const dialsSchema = z.object({
  ambiguity: z.number().int().min(1).max(5),
  stakeholders: z.number().int().min(1).max(5),
  conflictingConstraints: z.number().int().min(1).max(5),
  stakes: z.number().int().min(1).max(5),
  timePressure: z.number().int().min(1).max(5),
  informationGaps: z.number().int().min(1).max(5),
});
export type Dials = z.infer<typeof dialsSchema>;

/**
 * A curated bank item. Text may use cast tokens resolved against the session's
 * fictional world: {{company}}, {{you}}, {{manager}}, {{report1}}, {{report2}},
 * {{peer}}, {{client}}, {{exec}}, {{specialist}} (names) and the same with
 * ".role" for their job titles, e.g. {{manager.role}}.
 */
export const bankItemSchema = z.object({
  id: z.string(),
  type: z.enum(ITEM_TYPES),
  difficulty: z.number().int().min(1).max(5),
  dials: dialsSchema,
  /** Sub-skill keys this item mainly measures (2–4). */
  targets: z.array(z.string()).min(1).max(4),
  /** Role families this item suits; empty = any role. */
  roleFamilies: z.array(z.string()),
  /** Estimated minutes including probe and twist. */
  minutes: z.number().int().min(1).max(20),
  /** Optional label of a story moment, for chapter placement: "early" | "middle" | "late". */
  storyPhase: z.enum(["early", "middle", "late"]).optional(),
  content: z.object({ en: itemContentSchema, ar: itemContentSchema }),
  hidden: z.object({ en: itemHiddenSchema, ar: itemHiddenSchema.optional() }),
});
export type BankItem = z.infer<typeof bankItemSchema>;

/** Cast slots every fictional world fills, so bank items can reference them. */
export const CAST_SLOTS = ["manager", "report1", "report2", "peer", "client", "exec", "specialist"] as const;
export type CastSlot = (typeof CAST_SLOTS)[number];
