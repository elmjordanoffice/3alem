import { weekStartOf, type PracticeEvent } from "./momentum";

/**
 * A weekly challenge in Grow: one small, varied goal each week, the same for
 * everyone that week, so practice doesn't settle into a rut. Each one asks
 * for something that helps learning (spacing, retrying, reflecting, range),
 * never for a score.
 */
export type ChallengeKey = "threeDays" | "twoComebacks" | "reflectThree" | "newSkills" | "twoTwists";

export const CHALLENGES: { key: ChallengeKey; target: number }[] = [
  { key: "threeDays", target: 3 },
  { key: "twoComebacks", target: 2 },
  { key: "reflectThree", target: 3 },
  { key: "newSkills", target: 2 },
  { key: "twoTwists", target: 2 },
];

const WEEK = 7 * 86_400_000;

export function challengeFor(weekStart: number) {
  return CHALLENGES[Math.floor(weekStart / WEEK) % CHALLENGES.length]!;
}

export interface ChallengeState {
  key: ChallengeKey;
  target: number;
  done: number;
  complete: boolean;
  /** When it was completed, to celebrate once. */
  completedAt: Date | null;
}

export function weeklyChallenge(events: PracticeEvent[], opts: { locale: "en" | "ar"; now?: Date }): ChallengeState {
  const now = opts.now ?? new Date();
  const start = weekStartOf(now, opts.locale === "ar" ? 0 : 1);
  const { key, target } = challengeFor(start);
  const sorted = [...events].sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());
  const before = sorted.filter((e) => e.completedAt.getTime() < start);
  const week = sorted.filter((e) => e.completedAt.getTime() >= start && e.completedAt.getTime() < start + WEEK);
  const seenBefore = new Set(before.flatMap((e) => e.skillKeys));

  // Walk the week in order, so we know when the target was reached.
  let done = 0;
  let completedAt: Date | null = null;
  const days = new Set<number>();
  const newSkills = new Set<string>();
  for (const e of week) {
    if (key === "threeDays") days.add(Math.floor((e.completedAt.getTime() - start) / 86_400_000));
    const best = e.levels.length ? Math.max(...e.levels) : 0;
    const counts =
      key === "threeDays"
        ? days.size
        : key === "twoComebacks"
          ? done + (e.previousBest !== null && best > e.previousBest ? 1 : 0)
          : key === "reflectThree"
            ? done + (e.reflected ? 1 : 0)
            : key === "twoTwists"
              ? done + (e.twist ? 1 : 0)
              : (e.skillKeys.filter((k) => !seenBefore.has(k)).forEach((k) => newSkills.add(k)), newSkills.size);
    done = counts;
    if (!completedAt && done >= target) completedAt = e.completedAt;
  }
  return { key, target, done: Math.min(done, target), complete: done >= target, completedAt };
}
