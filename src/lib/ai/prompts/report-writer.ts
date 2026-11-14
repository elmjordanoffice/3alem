import { z } from "zod";
import type { AgentDefinition } from "../types";
import { LANGUAGE_NAME } from "./shared";

const claim = z.object({
  skillKey: z.string(),
  headline: z.string(),
  explanation: z.string(),
  /** Ids of the evidence items supporting the claim (from the list given). */
  evidenceIds: z.array(z.string()).min(1),
});

export const reportNarrativeSchema = z.object({
  /** Exactly three plain sentences. */
  portrait: z.string(),
  strengths: z.array(claim).max(4),
  hiddenPotential: z.array(claim).max(3),
  developmentAreas: z.array(claim).max(4),
  decisionPattern: z.object({ headline: z.string(), explanation: z.string(), evidenceIds: z.array(z.string()) }),
  interviewQuestions: z
    .array(z.object({ question: z.string(), followUp: z.string(), skillKey: z.string(), why: z.string() }))
    .min(3)
    .max(6),
  /** Grow reports only: the development plan. */
  plan: z
    .array(
      z.object({
        skillKey: z.string(),
        why: z.string(),
        practice: z.array(z.string()),
        days30: z.string(),
        days60: z.string(),
        days90: z.string(),
        resources: z.array(z.string()),
      }),
    )
    .max(3)
    .optional(),
});
export type ReportNarrative = z.infer<typeof reportNarrativeSchema>;

export interface ReportWriterInput {
  kind: "HIRE" | "GROW";
  language: "en" | "ar";
  roleTitle: string;
  roleFit: string;
  /** Computed in code: levels, ranges and confidence per domain and sub-skill. */
  profile: string;
  /** Candidate strengths/weaknesses the engine confirmed, with ceilings and conditions. */
  hypotheses: string;
  /** Strengths beyond the job description: high levels on low-weight skills. */
  beyondRole: string;
  /** Work-style positions (styles, never scores). */
  workStyle: string;
  /** Evidence list: id, sub-skill, level, verbatim quote, context. */
  evidence: string;
  /** Sub-skills with the lowest confidence, for interview questions. */
  lowConfidence: string;
}

export const reportWriter: AgentDefinition<ReportWriterInput, ReportNarrative> = {
  agent: "report-writer",
  version: "report-writer.v1",
  schema: reportNarrativeSchema,
  effort: "medium",
  maxTokens: 12000,
  system: `You write the narrative parts of a skills assessment report. Levels, ranges, confidence and role fit are computed elsewhere and given to you; never change them or invent numbers.

Rules:
- Every claim cites at least one evidence id from the list given. Do not make claims the evidence does not support.
- Specific and constructive, never judgmental. Describe behaviour in the work scenarios, not personality.
- portrait: exactly three plain sentences a busy reader understands.
- strengths: the clearest strengths, each with evidence.
- hiddenPotential: strengths beyond what the role needs (from the "beyond role" list), e.g. "Management judgment above their current technical role". Empty if none.
- developmentAreas: phrased as what to build next, with evidence; mention when a pattern is conditional (e.g. only under time pressure).
- decisionPattern: how they decide, e.g. "Decides fast and revises well when given new information".
- interviewQuestions: 3–6 questions that probe the lowest-confidence areas, each with a follow-up and why it matters.
- HIRE tone: neutral and professional, addressed to the hiring team; never recommend rejecting anyone. GROW tone: warm and direct, addressed to the person ("you"), never flattering; include plan (top three focus areas, why, practice scenarios, 30/60/90-day actions, resources).
- Do not comment on grammar, accent, fluency or answer length.
- Write in the requested language.`,
  messages: (i) => [
    {
      role: "user",
      content: `Report kind: ${i.kind}
Language: ${LANGUAGE_NAME[i.language]}
Role: ${i.roleTitle}
Role fit (computed): ${i.roleFit}

PROFILE
${i.profile}

CONFIRMED PATTERNS
${i.hypotheses || "none"}

BEYOND THE ROLE
${i.beyondRole || "none"}

WORK STYLE
${i.workStyle || "not measured"}

LOWEST-CONFIDENCE AREAS
${i.lowConfidence}

EVIDENCE
${i.evidence}`,
    },
  ],
};
