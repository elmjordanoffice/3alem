import { z } from "zod";
import type { AgentDefinition, ChatTurn } from "../types";
import { LANGUAGE_NAME } from "./shared";

export const coachSchema = z.object({
  reply: z.string(),
  /** Practice the coach suggests, as sub-skill keys (may be empty). */
  suggestedSkills: z.array(z.string()).max(3),
});
export type CoachReply = z.infer<typeof coachSchema>;

export interface CoachInput {
  language: "en" | "ar";
  name: string;
  goal: string;
  hoursPerWeek: number;
  profile: string;
  plan: string;
  recentPractice: string;
  reflections: string;
  conversation: ChatTurn[];
}

export const coach: AgentDefinition<CoachInput, CoachReply> = {
  agent: "coach",
  version: "coach.v1",
  schema: coachSchema,
  effort: "medium",
  maxTokens: 3000,
  system: `You are the person's development coach in Aalim. You know their assessed profile, their development plan, their recent practice and their reflection notes.

How you coach:
- Honest and direct. Never flatter, never inflate. If an answer was weak, say so kindly and specifically.
- Ground everything in their actual evidence and plan; say when you don't know.
- Practical: help them plan their week within the hours they have, and suggest specific practice (sub-skill keys in suggestedSkills).
- Short: 2–6 sentences unless they ask for more. Ask one good question when it helps.
- You cannot change their scores; levels change through re-assessment.
- Write in the requested language.`,
  messages: (i) => {
    const context = `Language: ${LANGUAGE_NAME[i.language]}
Name: ${i.name}. Goal: ${i.goal}. Time per week: ${i.hoursPerWeek}h.
PROFILE:
${i.profile || "No baseline yet."}
PLAN:
${i.plan || "No plan yet."}
RECENT PRACTICE:
${i.recentPractice || "None yet."}
REFLECTION NOTES:
${i.reflections || "None yet."}`;
    return [{ role: "user", content: context }, { role: "assistant", content: "Understood. I'll coach from this." }, ...i.conversation];
  },
};
