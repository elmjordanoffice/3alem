import { z } from "zod";
import type { AgentDefinition } from "../types";
import { DOMAIN_KEYS, frameworkReference } from "./shared";

export const jdAnalysisSchema = z.object({
  roleTitle: z.string(),
  /** Two or three plain sentences. */
  summary: z.string(),
  seniority: z.enum(["entry", "mid", "senior", "lead", "executive"]),
  /** One of the given role-family keys, or "other". */
  roleFamily: z.string(),
  industry: z.string(),
  industryKeywords: z.array(z.string()),
  technicalSkills: z
    .array(
      z.object({
        slug: z.string(),
        name: z.string(),
        description: z.string(),
        anchors: z.array(z.string()).length(5),
        importance: z.enum(["MUST_HAVE", "NICE_TO_HAVE", "BASELINE"]),
      }),
    )
    .min(3)
    .max(7),
  domainWeights: z.array(
    z.object({
      domain: z.enum(DOMAIN_KEYS),
      weight: z.number().min(0).max(1),
      importance: z.enum(["MUST_HAVE", "NICE_TO_HAVE", "BASELINE"]),
      rationale: z.string(),
    }),
  ),
  flags: z.array(
    z.object({
      quote: z.string(),
      category: z.enum([
        "age",
        "gender",
        "nationality",
        "ethnicity",
        "religion",
        "appearance",
        "marital_or_family_status",
        "disability_or_health",
        "irrelevant_requirement",
      ]),
      explanation: z.string(),
      suggestion: z.string(),
    }),
  ),
  jobDescriptionLanguage: z.enum(["en", "ar"]),
});
export type JdAnalysis = z.infer<typeof jdAnalysisSchema>;

export interface JdAnalystInput {
  jobDescription: string;
  roleFamilies: { key: string; name: string }[];
}

export const jdAnalyst: AgentDefinition<JdAnalystInput, JdAnalysis> = {
  agent: "jd-analyst",
  version: "jd-analyst.v1",
  schema: jdAnalysisSchema,
  effort: "medium",
  maxTokens: 8000,
  system: `You are a senior industrial-organisational psychologist preparing a skills assessment from a job description.

Produce:
- roleTitle, a plain 2–3 sentence summary, seniority (entry | mid | senior | lead | executive), the closest roleFamily from the list provided (or "other"), the industry, and lower-case industry keywords (used to set the assessment's fictional company in a matching industry).
- technicalSkills: 3–7 role-specific technical sub-skills the job truly needs (e.g. for a data analyst: SQL and querying, statistics, data storytelling). Each has a short slug (kebab-case), a name, a one-sentence description and five behavioural level anchors (1 Emerging … 5 Expert), one sentence each, describing what a written answer to a work task would show at that level. Level 3 is a solid professional; level 5 adds what others miss. Never use length, polish or fluency as a criterion.
- domainWeights: exactly one entry for each of the nine domains of the Aalim framework below, with a weight 0–1 for how much the role depends on it, an importance (MUST_HAVE for at most three domains the role cannot do without; NICE_TO_HAVE; BASELINE) and a one-line rationale tied to the job description.
- flags: every requirement that is discriminatory or not job-relevant — age, gender, nationality, ethnicity, religion, appearance, marital or family status, disability or health unrelated to essential duties, or other irrelevant requirements (e.g. "native speaker" where fluency would do, "young and dynamic", photos). Quote the exact words, explain why, and suggest a job-relevant alternative. If there are none, return an empty list.
- jobDescriptionLanguage.

Write all text in the language of the job description. Be specific to this job; do not pad.

AALIM FRAMEWORK (domain: sub-skills)
${frameworkReference()}`,
  messages: (input) => [
    {
      role: "user",
      content: `ROLE FAMILIES: ${input.roleFamilies.map((f) => `${f.key} (${f.name})`).join(", ")}\n\nJOB DESCRIPTION:\n<job_description>\n${input.jobDescription}\n</job_description>`,
    },
  ],
};
