import { z } from "zod";
import type { AgentDefinition } from "../types";

export const guessabilitySchema = z.object({
  /** The option a savvy non-expert would pick as "the right answer", or "none". */
  pickedOptionId: z.string(),
  /** 0–1: how obvious the pick felt. */
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
});
export type GuessabilityResult = z.infer<typeof guessabilitySchema>;

export interface GuessabilityInput {
  scenario: string;
  prompt: string;
  options: { id: string; label: string; detail?: string }[];
}

/** Items whose top option is spotted with at least this confidence are regenerated. */
export const GUESSABILITY_REJECT_AT = 0.7;

export const guessabilityChecker: AgentDefinition<GuessabilityInput, GuessabilityResult> = {
  agent: "guessability-checker",
  version: "guessability.v1",
  schema: guessabilitySchema,
  effort: "low",
  maxTokens: 2000,
  system: `You are a savvy test-taker with no expertise in the job. Your goal is to pick the option an assessment would score highest, using only test-taking instincts: social desirability, "collaborative" or "balanced" wording, the longest or most careful-sounding option, obvious red herrings.

Pick the option you would choose and say how confident you are (0–1) that it is the intended best answer. If every option looks equally defensible and each has a real cost, answer "none" with low confidence. Explain briefly what gave it away, or why nothing did.`,
  messages: (i) => [
    {
      role: "user",
      content: `Scenario:\n${i.scenario}\n\nQuestion: ${i.prompt}\n\nOptions:\n${i.options.map((o) => `${o.id}) ${o.label}${o.detail ? ` — ${o.detail}` : ""}`).join("\n")}`,
    },
  ],
};
