import "server-only";
import { z } from "zod";
import { systemDb, withTenant } from "@/lib/db";
import { tenantOf, type Viewer } from "@/lib/auth/session";
import { DOMAINS } from "@/lib/framework/data";
import { guideFor } from "@/lib/framework/interview-guide";
import type { Level } from "@/lib/framework/types";
import type { ReportContent, ReportSkill } from "./report-types";

/**
 * The interview kit: what to ask a candidate after the assessment, and a
 * scorecard to rate the answers.
 *
 * Focus areas come from the report, in this order: must-haves below what the
 * role needs, findings the assessment flagged but could not settle, and
 * important skills it is least sure about. A confirmed strength is added when
 * fewer than three remain, so the interview also tests the good news.
 *
 * Interviewers score before they see the assessment's levels or anyone
 * else's scorecard (independent ratings resist anchoring); once their own
 * scorecard is in, the kit shows the comparison and where people disagree.
 */

export type FocusReason = "gap" | "hypothesis" | "uncertain" | "strength";

export interface KitFocus {
  skillKey: string;
  name: string;
  reason: FocusReason;
  importance: ReportSkill["importance"];
  question: string;
  situational: string | null;
  followUps: string[];
  listenFor: string[];
  watchFor: string[];
  /** The framework's description of a developing (2) and an advanced (4) answer. */
  anchors: { level: Level; text: string }[];
  assessment: { estimate: number; range: [number, number]; confidence: number };
}

export const RECOMMENDATIONS = ["STRONG_YES", "YES", "NO", "STRONG_NO"] as const;
export type Recommendation = (typeof RECOMMENDATIONS)[number];

export const ratingSchema = z.object({ skillKey: z.string().min(1).max(80), rating: z.number().int().min(1).max(5).nullable(), note: z.string().trim().max(1000) });
export type ScorecardRating = z.infer<typeof ratingSchema>;

export interface Scorecard {
  interviewerName: string;
  mine: boolean;
  recommendation: Recommendation;
  summary: string;
  ratings: ScorecardRating[];
  submittedAt: string;
}

export interface InterviewKit {
  sessionId: string;
  candidate: string;
  role: string;
  focus: KitFocus[];
  /** Everyone's scorecards, once the viewer has submitted theirs; otherwise only the count. */
  scorecards: Scorecard[];
  scorecardCount: number;
  mine: Scorecard | null;
}

const SUB_SKILLS = new Map(DOMAINS.flatMap((d) => d.subSkills.map((s) => [s.key, s] as const)));

function anchorsFor(key: string, locale: "en" | "ar"): KitFocus["anchors"] {
  const s = SUB_SKILLS.get(key);
  if (!s) return [];
  return ([2, 4] as Level[]).map((level) => ({ level, text: s.anchors[level][locale] }));
}

/** Skills worth an interview question, most important first (at most five). */
export function focusAreas(content: ReportContent): { skill: ReportSkill; reason: FocusReason }[] {
  const all = content.domains.flatMap((d) => [d, ...d.subSkills]);
  const byKey = new Map(all.map((s) => [s.key, s]));
  const picked = new Map<string, FocusReason>();
  const add = (key: string, reason: FocusReason) => {
    if (picked.size < 5 && byKey.has(key) && !picked.has(key)) picked.set(key, reason);
  };
  // A sub-skill is a sharper question than its domain; prefer the weakest tested one.
  const sharpest = (key: string) => {
    const domain = content.domains.find((d) => d.key === key);
    const tested = domain?.subSkills.filter((s) => s.observations > 0).sort((a, b) => a.estimate - b.estimate) ?? [];
    return tested[0]?.key ?? key;
  };

  for (const g of content.fit.gaps) add(sharpest(g.key), "gap");
  for (const h of content.hypotheses) if (h.status !== "REJECTED" && h.status !== "CONFIRMED") add(h.skillKey, "hypothesis");
  const important = all
    .filter((s) => s.importance === "MUST_HAVE" || s.importance === "NICE_TO_HAVE")
    .filter((s) => s.confidence < 0.6)
    .sort((a, b) => a.confidence - b.confidence);
  for (const s of important) add(s.key, "uncertain");
  if (picked.size < 3) {
    const strengths = all.filter((s) => s.observations > 0).sort((a, b) => b.estimate - a.estimate);
    for (const s of strengths.slice(0, 3 - picked.size)) add(s.key, "strength");
  }
  if (picked.size < 3) for (const s of [...all].sort((a, b) => a.confidence - b.confidence)) add(s.key, "uncertain");
  return [...picked].map(([key, reason]) => ({ skill: byKey.get(key)!, reason }));
}

export function buildFocus(content: ReportContent, locale: "en" | "ar"): KitFocus[] {
  return focusAreas(content).map(({ skill, reason }) => {
    const domain = skill.key.split(".")[0]!;
    const guide = guideFor(skill.key) ?? guideFor(domain);
    const written = content.narrative.interviewQuestions.find((q) => q.skillKey === skill.key || q.skillKey === domain);
    const pick = (x: { en: string; ar: string }) => x[locale];
    return {
      skillKey: skill.key,
      name: skill.name,
      reason,
      importance: skill.importance,
      // The report's own question is tailored to this candidate's answers; the guide's is the standard one.
      question: written?.question ?? (guide ? pick(guide.question) : fallbackQuestion(skill.name, locale)),
      situational: guide ? pick(guide.situational) : null,
      followUps: [...(written?.followUp ? [written.followUp] : []), ...(guide?.followUps.map(pick) ?? [])].slice(0, 3),
      listenFor: guide?.listenFor.map(pick) ?? [],
      watchFor: guide?.watchFor.map(pick) ?? [],
      anchors: anchorsFor(skill.key, locale),
      assessment: { estimate: skill.estimate, range: skill.range, confidence: skill.confidence },
    };
  });
}

function fallbackQuestion(name: string, locale: "en" | "ar") {
  return locale === "ar"
    ? `حدّثنا عن موقف حديث احتجت فيه إلى «${name}». ماذا فعلت بالتحديد، ولماذا، وما الذي حدث بعد ذلك؟`
    : `Tell me about a recent situation that needed ${name.toLowerCase()}. What exactly did you do, why, and what happened?`;
}

/** True when an interviewer's rating sits a full level or more outside the assessment's range. */
export function disagrees(rating: number | null, range: [number, number]): boolean {
  return rating != null && (rating <= range[0] - 1 || rating >= range[1] + 1);
}

export async function interviewKit(viewer: Viewer, sessionId: string, content: ReportContent, meta: { candidate: string; role: string }, locale: "en" | "ar"): Promise<InterviewKit> {
  const rows = await withTenant(tenantOf(viewer), (tx) => tx.interviewScorecard.findMany({ where: { sessionId }, orderBy: { submittedAt: "asc" } }));
  const users = rows.length ? await systemDb.user.findMany({ where: { id: { in: rows.map((r) => r.interviewerId) } }, select: { id: true, name: true } }) : [];
  const cards: Scorecard[] = rows.map((r) => ({
    interviewerName: users.find((u) => u.id === r.interviewerId)?.name ?? "",
    mine: r.interviewerId === viewer.user.id,
    recommendation: r.recommendation,
    summary: r.summary,
    ratings: z.array(ratingSchema).catch([]).parse(r.ratings),
    submittedAt: r.submittedAt.toISOString(),
  }));
  const mine = cards.find((c) => c.mine) ?? null;
  return {
    sessionId,
    candidate: meta.candidate,
    role: meta.role,
    focus: buildFocus(content, locale),
    scorecards: mine ? cards : [],
    scorecardCount: cards.length,
    mine,
  };
}
