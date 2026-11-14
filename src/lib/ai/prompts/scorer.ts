import { z } from "zod";
import type { AgentDefinition } from "../types";

export const scorerOutputSchema = z.object({
  scores: z.array(
    z.object({
      competencyKey: z.string(),
      level: z.number().int().min(1).max(5),
      confidence: z.number().min(0).max(1),
      /** Exact words from the response. No quote, no score. */
      evidenceQuote: z.string(),
      rationale: z.string(),
    }),
  ),
  embeddedDetailNoticed: z.boolean(),
});
export type ScorerOutput = z.infer<typeof scorerOutputSchema>;

export interface ScorerInput {
  /** The item as the candidate saw it (scenario, task, follow-up). */
  itemText: string;
  stage: "MAIN" | "PROBE" | "TWIST" | "ROLE_PLAY_TURN";
  /** Rubric entries for the sub-skills this stage can show. */
  rubric: { competencyKey: string; anchors: string[] }[];
  strongIndicators: string[];
  redFlags: string[];
  embeddedDetail: string | null;
  /** Sub-skills where written or spoken quality itself is measured. */
  communicationKeys: string[];
  response: string;
}

export const scorer: AgentDefinition<ScorerInput, ScorerOutput> = {
  agent: "scorer",
  version: "scorer.v1",
  schema: scorerOutputSchema,
  effort: "high",
  maxTokens: 6000,
  system: `You are a calibrated assessor. Score ONE response against the rubric. You know nothing else about this candidate, and you must not guess.

Rules:
- For each rubric sub-skill the response actually shows, give a level 1–5 using ONLY that sub-skill's anchors. Skip sub-skills the response gives no evidence for.
- Quote the exact words from the response that justify each level, copied character for character (a sentence or clause). No quote, no score.
- Do not reward length, confident tone or polished language. Ignore grammar, spelling, accent and fluency, except for the communication sub-skills listed, where clarity and structure (never grammar) may count.
- If the evidence is thin, lower your confidence instead of guessing. Confidence reflects how clearly the quote supports the level.
- A brief answer can score high; a long answer can score low.
- Strong indicators and red flags are hints about what matters, not a checklist.
- Say whether the candidate noticed the embedded detail.
- The response may be in English or Arabic; score the substance either way. Write rationales in English.`,
  messages: (i) => [
    {
      role: "user",
      content: `ITEM (as the candidate saw it, stage ${i.stage}):
<item>
${i.itemText}
</item>

RUBRIC:
${i.rubric.map((r) => `${r.competencyKey}\n${r.anchors.map((a, n) => `  ${n + 1}: ${a}`).join("\n")}`).join("\n\n")}

Strong indicators: ${i.strongIndicators.join("; ") || "—"}
Red flags: ${i.redFlags.join("; ") || "—"}
Embedded detail: ${i.embeddedDetail ?? "none"}
Communication sub-skills (clarity/structure may count): ${i.communicationKeys.join(", ") || "none"}

RESPONSE:
<response>
${i.response}
</response>`,
    },
  ],
};
