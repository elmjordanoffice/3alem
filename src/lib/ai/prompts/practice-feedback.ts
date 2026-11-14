import { z } from "zod";
import type { AgentDefinition } from "../types";
import { LANGUAGE_NAME } from "./shared";

export const practiceFeedbackSchema = z.object({
  didWell: z.array(z.object({ point: z.string(), quote: z.string() })).max(3),
  expertWouldConsider: z.array(z.string()).min(1).max(4),
  oneStrongApproach: z.string(),
  scores: z.array(z.object({ competencyKey: z.string(), level: z.number().int().min(1).max(5), confidence: z.number().min(0).max(1) })),
});
export type PracticeFeedback = z.infer<typeof practiceFeedbackSchema>;

export interface PracticeFeedbackInput {
  language: "en" | "ar";
  itemText: string;
  rubric: string;
  strongIndicators: string[];
  embeddedDetail: string | null;
  response: string;
}

export const practiceFeedback: AgentDefinition<PracticeFeedbackInput, PracticeFeedback> = {
  agent: "practice-feedback",
  version: "practice-feedback.v1",
  schema: practiceFeedbackSchema,
  effort: "medium",
  maxTokens: 4000,
  system: `You are a skilled, honest workplace coach giving feedback on one practice answer. The person is practising to get better; they want specifics, not praise.

Give:
- didWell: up to three things they genuinely did well, each with the exact words from their answer as the quote. If nothing stands out, return an empty list.
- expertWouldConsider: what an expert would also have considered (1–4 points), concrete and tied to this scenario, including the hidden detail if they missed it.
- oneStrongApproach: one strong way to handle it, in 3–5 sentences, framed as "One strong approach…", never as the only right answer.
- scores: a level 1–5 for each rubric sub-skill the answer shows, using only the rubric.
Never comment on grammar, spelling or length. Never flatter. Write in the requested language, addressing the person as "you".`,
  messages: (i) => [
    {
      role: "user",
      content: `Language: ${LANGUAGE_NAME[i.language]}\n\nSCENARIO:\n${i.itemText}\n\nRUBRIC:\n${i.rubric}\n\nStrong indicators: ${i.strongIndicators.join("; ")}\nHidden detail: ${i.embeddedDetail ?? "none"}\n\nANSWER:\n<answer>\n${i.response}\n</answer>`,
    },
  ],
};
