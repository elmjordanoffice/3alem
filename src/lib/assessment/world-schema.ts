import { z } from "zod";
import { CAST_SLOTS } from "./item-schema";

/** The fictional company a session's story takes place in. */
export const castMemberSchema = z.object({
  slot: z.enum(CAST_SLOTS),
  name: z.string(),
  role: z.string(),
  /** One sentence: how they behave at work. Shapes role-play and story tone. */
  personality: z.string(),
});

export const worldSchema = z.object({
  companyName: z.string(),
  industry: z.string(),
  /** 2–3 sentences: what the company does and what is happening this week. */
  premise: z.string(),
  /** The candidate's role in the story, e.g. "Operations team lead". */
  yourRole: z.string(),
  /** One sentence about the team they lead or join. */
  team: z.string(),
  cast: z.array(castMemberSchema).length(CAST_SLOTS.length),
  /** Four chapter titles with one-line summaries, in story order. */
  chapters: z.array(z.object({ title: z.string(), summary: z.string() })).length(4),
});
export type World = z.infer<typeof worldSchema>;
export type CastMember = z.infer<typeof castMemberSchema>;

export const bankWorldSchema = z.object({
  id: z.string(),
  /** Industry keywords a job description may contain, lower-case. */
  industryKeywords: z.array(z.string()),
  en: worldSchema,
  ar: worldSchema,
});
export type BankWorld = z.infer<typeof bankWorldSchema>;
