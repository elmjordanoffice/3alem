/**
 * Momentum in Grow: the parts of practice that are fun to watch move.
 *
 * - This week: sessions done against a goal set by the hours the person
 *   chose at onboarding (one 25-minute session per 25 minutes, 1 to 7), with
 *   the days they practised. Weeks start on Sunday in Arabic and Monday in
 *   English.
 * - Streak: consecutive weeks with at least one session. This week counts
 *   once it has a session; until then the streak still stands from last week.
 * - Milestones: small, honest firsts, each unlocked by something the person
 *   did, never by a score alone, and dated, so the newest can be celebrated.
 *
 * Personal and private: nothing here is shown to an employer or a team.
 */
export type MilestoneKey = "first" | "reflective" | "comeback" | "weekGoal" | "advanced" | "streak3" | "fullCircle" | "ten";

export const MILESTONES: MilestoneKey[] = ["first", "reflective", "comeback", "weekGoal", "advanced", "streak3", "fullCircle", "ten"];

export interface PracticeEvent {
  id: string;
  completedAt: Date;
  skillKeys: string[];
  levels: number[];
  /** For a retry: the best level of the first attempt. */
  previousBest: number | null;
  reflected: boolean;
  /** A "try again with a twist" round. */
  twist?: boolean;
}

export interface Momentum {
  week: { done: number; target: number; days: boolean[] };
  streakWeeks: number;
  total: number;
  milestones: { key: MilestoneKey; unlockedAt: Date | null }[];
  next: MilestoneKey | null;
}

const DAY = 86_400_000;

export function weeklyTarget(hoursPerWeek: number): number {
  return Math.max(1, Math.min(7, Math.floor((hoursPerWeek * 60) / 25)));
}

/** Midnight (UTC) at the start of the week containing `d`. */
export function weekStartOf(d: Date, firstDay: 0 | 1): number {
  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const back = (day.getUTCDay() - firstDay + 7) % 7;
  return day.getTime() - back * DAY;
}

export function momentum(events: PracticeEvent[], opts: { hoursPerWeek: number; planSkills: string[]; locale: "en" | "ar"; now?: Date }): Momentum {
  const now = opts.now ?? new Date();
  const firstDay: 0 | 1 = opts.locale === "ar" ? 0 : 1;
  const target = weeklyTarget(opts.hoursPerWeek);
  const sorted = [...events].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());

  // This week.
  const thisWeek = weekStartOf(now, firstDay);
  const days = Array.from({ length: 7 }, () => false);
  let done = 0;
  for (const e of sorted) {
    const t = e.completedAt.getTime();
    if (t >= thisWeek && t < thisWeek + 7 * DAY) {
      done++;
      days[Math.floor((t - thisWeek) / DAY)] = true;
    }
  }

  // Sessions per week, for the streak and the weekly goal.
  const perWeek = new Map<number, number>();
  for (const e of sorted) {
    const w = weekStartOf(e.completedAt, firstDay);
    perWeek.set(w, (perWeek.get(w) ?? 0) + 1);
  }
  let streakWeeks = 0;
  for (let w = perWeek.has(thisWeek) ? thisWeek : thisWeek - 7 * DAY; perWeek.has(w); w -= 7 * DAY) streakWeeks++;

  // Milestones, unlocked in order of what happened.
  const at = new Map<MilestoneKey, Date>();
  const unlock = (k: MilestoneKey, d: Date) => {
    if (!at.has(k)) at.set(k, d);
  };
  const seenSkills = new Set<string>();
  const weekCount = new Map<number, number>();
  let run = 0;
  let lastWeek: number | null = null;
  sorted.forEach((e, i) => {
    unlock("first", e.completedAt);
    if (e.reflected) unlock("reflective", e.completedAt);
    const best = e.levels.length ? Math.max(...e.levels) : 0;
    if (e.previousBest !== null && best > e.previousBest) unlock("comeback", e.completedAt);
    if (best >= 4) unlock("advanced", e.completedAt);
    const w = weekStartOf(e.completedAt, firstDay);
    weekCount.set(w, (weekCount.get(w) ?? 0) + 1);
    if ((weekCount.get(w) ?? 0) >= target) unlock("weekGoal", e.completedAt);
    if (lastWeek === null || w !== lastWeek) {
      run = lastWeek !== null && w - lastWeek === 7 * DAY ? run + 1 : 1;
      lastWeek = w;
    }
    if (run >= 3) unlock("streak3", e.completedAt);
    e.skillKeys.forEach((k) => seenSkills.add(k));
    if (opts.planSkills.length && opts.planSkills.every((k) => seenSkills.has(k))) unlock("fullCircle", e.completedAt);
    if (i + 1 >= 10) unlock("ten", e.completedAt);
  });

  const milestones = MILESTONES.map((key) => ({ key, unlockedAt: at.get(key) ?? null }));
  return {
    week: { done, target, days },
    streakWeeks,
    total: sorted.length,
    milestones,
    next: milestones.find((m) => !m.unlockedAt)?.key ?? null,
  };
}

/** What one session unlocked, to celebrate right after it. */
export function unlockedBy(m: Momentum, event: PracticeEvent): MilestoneKey[] {
  return m.milestones.filter((x) => x.unlockedAt && x.unlockedAt.getTime() === event.completedAt.getTime()).map((x) => x.key);
}
