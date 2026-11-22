import "server-only";
import { withTenant } from "@/lib/db";
import type { ReportContent } from "@/lib/hire/report-types";
import type { PracticeItem } from "./practice";
import { getGrowProfile } from "./profile";
import { momentum, unlockedBy, type Momentum, type MilestoneKey, type PracticeEvent } from "./momentum";
import { weeklyChallenge } from "./challenge";

/** Completed practice as momentum events (oldest first). */
export async function practiceEvents(userId: string): Promise<PracticeEvent[]> {
  const rows = await withTenant({ userId }, (tx) =>
    tx.practiceSession.findMany({ where: { userId, completedAt: { not: null } }, orderBy: { completedAt: "asc" }, select: { id: true, completedAt: true, competencyKeys: true, feedback: true, item: true, reflectionNote: true } }),
  );
  return rows.map((r) => {
    const item = r.item as unknown as PracticeItem;
    const levels = ((r.feedback as { scores?: { level: number }[] } | null)?.scores ?? []).map((s) => s.level);
    const prev = item.retryOf && item.previous?.scores.length ? Math.max(...item.previous.scores.map((s) => s.level)) : null;
    return { id: r.id, completedAt: r.completedAt!, skillKeys: r.competencyKeys, levels, previousBest: prev, reflected: Boolean(r.reflectionNote?.trim()), twist: Boolean(item.twistOf) };
  });
}

export async function momentumFor(userId: string, locale: "en" | "ar"): Promise<Momentum> {
  const [events, profile, report] = await Promise.all([
    practiceEvents(userId),
    getGrowProfile(userId),
    withTenant({ userId }, (tx) => tx.report.findFirst({ where: { subjectUserId: userId, kind: "GROW", status: "READY" }, orderBy: { createdAt: "desc" }, select: { content: true } })),
  ]);
  const plan = ((report?.content as unknown as ReportContent | undefined)?.narrative.plan ?? []).map((p) => p.skillKey);
  return momentum(events, { hoursPerWeek: profile?.hoursPerWeek ?? 2, planSkills: plan, locale });
}

export interface Celebration {
  improved: { from: number; to: number } | null;
  unlocked: MilestoneKey[];
  week: Momentum["week"];
  streakWeeks: number;
}

/** What to celebrate on a practice result, only while it is fresh (ten minutes). */
export async function celebrationFor(userId: string, sessionId: string, locale: "en" | "ar"): Promise<Celebration | null> {
  const m = await momentumFor(userId, locale);
  const events = await practiceEvents(userId);
  const e = events.find((x) => x.id === sessionId);
  if (!e || Date.now() - e.completedAt.getTime() > 10 * 60_000) return null;
  const best = e.levels.length ? Math.max(...e.levels) : 0;
  const improved = e.previousBest !== null && best > e.previousBest ? { from: e.previousBest, to: best } : null;
  return { improved, unlocked: unlockedBy(m, e), week: m.week, streakWeeks: m.streakWeeks };
}

/** Momentum for the browser (dates as ISO strings). */
export function momentumView(m: Momentum) {
  return { ...m, milestones: m.milestones.map((x) => ({ key: x.key, unlockedAt: x.unlockedAt ? x.unlockedAt.toISOString() : null })) };
}

/** This week's challenge and how far along it is. */
export async function challengeFor(userId: string, locale: "en" | "ar") {
  const s = weeklyChallenge(await practiceEvents(userId), { locale });
  return { ...s, completedAt: s.completedAt ? s.completedAt.toISOString() : null };
}
