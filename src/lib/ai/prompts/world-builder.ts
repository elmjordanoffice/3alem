import { worldSchema, type World } from "@/lib/assessment/world-schema";
import type { AgentDefinition } from "../types";
import { LANGUAGE_NAME } from "./shared";

export interface WorldBuilderInput {
  roleTitle: string;
  roleSummary: string;
  industry: string;
  language: "en" | "ar";
}

export const worldBuilder: AgentDefinition<WorldBuilderInput, World> = {
  agent: "world-builder",
  version: "world-builder.v1",
  schema: worldSchema,
  effort: "low",
  maxTokens: 4000,
  system: `You create the fictional company in which a candidate's whole assessment takes place, as one continuous story ("A week at …").

Rules:
- An invented company in the given industry, not a real one, with a believable pressure this week (a launch, an audit, a peak season, a merger).
- yourRole: the candidate's role in the story, matching the job being assessed.
- A cast of exactly seven people filling these slots, in this order: manager (the candidate's manager), report1 (their strongest team member), report2 (a team member who is struggling), peer (a cross-functional peer), client (a key client contact), exec (a sceptical senior executive), specialist (a subject-matter expert).
- Names from many cultures and genders across the cast. One behavioural sentence of personality each — no stereotypes.
- Four chapters across a working week, each with a title and a one-line summary.
- Culturally neutral: no idioms, holidays or culture-specific references.
- Write everything in the requested language.`,
  messages: (input) => [
    {
      role: "user",
      content: `Language: ${LANGUAGE_NAME[input.language]}\nIndustry: ${input.industry}\nRole being assessed: ${input.roleTitle}\nRole summary: ${input.roleSummary}`,
    },
  ],
};
