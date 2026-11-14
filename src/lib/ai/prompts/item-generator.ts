import { z } from "zod";
import { itemContentSchema, itemHiddenSchema, type ItemContent, type ItemHidden, type ItemType } from "@/lib/assessment/item-schema";
import type { World } from "@/lib/assessment/world-schema";
import type { Dials } from "@/lib/assessment/item-schema";
import type { AgentDefinition } from "../types";
import { LANGUAGE_NAME, QUESTION_DESIGN_RULES } from "./shared";

export const generatedItemSchema = z.object({ content: itemContentSchema, hidden: itemHiddenSchema });
export type GeneratedItem = { content: ItemContent; hidden: ItemHidden };

export interface ItemGeneratorInput {
  targets: string[];
  difficulty: number;
  dials: Dials;
  itemType: ItemType;
  timed: boolean;
  language: "en" | "ar";
  world: World;
  chapter: { number: number; title: string; summary: string };
  /** Short summaries of the candidate's earlier decisions, for consequences. */
  history: string[];
  roleSummary: string;
  /** Anchors for the target sub-skills (framework or role-specific). */
  anchors: string;
  /** Item types already used for the primary target (use a different-looking context). */
  avoidTypes: ItemType[];
}

const TASK_KIND: Record<ItemType, string> = {
  TRADE_OFF_DILEMMA: `task.kind "choice": 3–4 options, each defensible with a real cost; requireJustification true. Fill hidden.optionNotes for every option.`,
  RANKING_ALLOCATION: `task.kind "ranking" (6 entries to order) or "allocation" (split 100 points across 3–5 rows, or assign people to work).`,
  INBOX: `task.kind "inbox": 8 messages arriving over a morning, conflicting for time; replyCount 2; timeLimitSeconds 900. The person triages all and writes two replies.`,
  ROLE_PLAY: `task.kind "roleplay": a stakeholder card with only what the candidate would know, an opening line, maxTurns 6–10. hidden.roleplayBrief is required: hidden goals, starting mood, what softens and hardens them (observable behaviours), and what a resolution looks like.`,
  CASE_ANALYSIS: `task.kind "written": a brief with a data table and/or chart; the person finds the problem and recommends. Hide an outlier or inconsistency in the data.`,
  DESIGN_CHALLENGE: `task.kind "design": 3–4 structured sections (e.g. problem, users, solution, how you'd test it).`,
  WRITTEN_WORK_SAMPLE: `task.kind "written" with written.format set: the person writes the email, memo, message or one-pager.`,
  TECHNICAL_TASK: `task.kind "written": a role-specific work sample (review code, critique an analysis or plan, estimate, diagnose) answerable by a competent practitioner from the materials given.`,
  CONSEQUENCE_CHAIN: `task.kind "chain": 4 rounds; each round's options lead to consequences shown in the next round.`,
  REFLECTION: `task.kind "written": after a short account of what happened, "What would you do differently, and why?"`,
  FORCED_CHOICE_WORK_STYLE: `task.kind "forced_choice": 8 pairs of equally attractive statements; hidden.workStyleMap maps each statement to a style (workstyle.risk | workstyle.pace | workstyle.focus | workstyle.mode) and pole a|b.`,
};

export const itemGenerator: AgentDefinition<ItemGeneratorInput, GeneratedItem> = {
  agent: "item-generator",
  version: "item-generator.v1",
  schema: generatedItemSchema,
  effort: "medium",
  maxTokens: 16000,
  system: `You are an expert assessment designer (industrial-organisational psychologist) writing ONE item for an adaptive workplace skills assessment. The candidate experiences one continuous story in a fictional company; your item is the next scene.

${QUESTION_DESIGN_RULES}

Output rules:
- content is shown to the candidate; hidden never is. Never reveal skills, levels or the rubric in content.
- scenario: at most 180 words. Put detail into materials (emails look like real emails with from/to/subject/sentAt/body/footnote; tables have columns and rows like a spreadsheet; charts have series and data).
- Use the cast's real names and roles from the world; stay consistent with the chapter and earlier decisions.
- Include a probe and a twist (except forced choice). twist.change states the one constraint that changes; twist.prompt asks how they adapt.
- hidden.rubric: one entry per target sub-skill (and per probe/twist target), with five item-specific anchors (levels 1→5) adapted from the framework anchors provided. Observable behaviour only; never length, confidence of tone, polish or fluency (clarity and structure only for communication sub-skills).
- hidden.strongIndicators and hidden.redFlags: 3–5 each, each tied to a sub-skill, with lower-case keywords in the item's language.
- hidden.embeddedDetail: what is hidden, where, and keywords that show the candidate noticed it.
- Difficulty 1–5 is set by six dials (ambiguity, stakeholders, conflicting constraints, stakes, time pressure, information gaps); match the dials given.
- Write all candidate-facing text in the requested language.`,
  messages: (i) => [
    {
      role: "user",
      content: `Language: ${LANGUAGE_NAME[i.language]}
Item type: ${i.itemType}. ${TASK_KIND[i.itemType]}
Target sub-skills (primary first): ${i.targets.join(", ")}
Difficulty: ${i.difficulty} — dials ${JSON.stringify(i.dials)}${i.timed ? " — this task is timed" : ""}
Formats already used for the primary target (look different from these): ${i.avoidTypes.join(", ") || "none"}

Role: ${i.roleSummary}

World: ${i.world.companyName} (${i.world.industry}). ${i.world.premise}
The candidate is: ${i.world.yourRole}. ${i.world.team}
Cast: ${i.world.cast.map((c) => `${c.slot}: ${c.name}, ${c.role} — ${c.personality}`).join(" | ")}
Chapter ${i.chapter.number}: ${i.chapter.title} — ${i.chapter.summary}

Candidate's earlier decisions:
${i.history.length ? i.history.map((h) => `- ${h}`).join("\n") : "- none yet"}

Framework anchors for the targets:
${i.anchors}`,
    },
  ],
};
