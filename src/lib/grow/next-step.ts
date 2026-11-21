/**
 * Today's focus in Grow, chosen rather than fixed. The candidates are the
 * plan's focus skills (most important first). Each gets a score:
 *
 * - its place in the plan (the biggest gap toward the goal comes first);
 * - days since it was last practised (spacing: a skill rested for a few
 *   days is ready again; one practised today waits);
 * - how the last attempts went: two attempts at Advanced or above mean it is
 *   holding, so the next skill gets the turn; a weak last attempt brings it
 *   back soon, while it is fresh.
 *
 * Returns the skill and the reason, so the page can say why.
 */
export type NextReason =
  | { key: "start" }
  | { key: "rested"; days: number }
  | { key: "consolidate"; level: number }
  | { key: "retry"; level: number }
  | { key: "biggestGap" };

export interface PracticeRecord {
  skillKeys: string[];
  completedAt: Date | null;
  scores: { competencyKey: string; level: number }[];
}

export function nextStep(plan: string[], history: PracticeRecord[], now = new Date()): { skillKey: string; reason: NextReason } | null {
  if (plan.length === 0) return null;
  const done = history.filter((h) => h.completedAt).sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
  if (done.length === 0) return { skillKey: plan[0]!, reason: { key: "start" } };

  const scored = plan.map((key, i) => {
    const attempts = done.filter((h) => h.skillKeys.includes(key));
    const levels = attempts.map((a) => a.scores.find((s) => s.competencyKey === key)?.level).filter((l): l is number => typeof l === "number");
    const days = attempts[0] ? (now.getTime() - attempts[0].completedAt!.getTime()) / 86400_000 : Infinity;
    let score = (plan.length - i) * 1.2; // plan order: biggest gap first
    let reason: NextReason = { key: "biggestGap" };
    if (!attempts.length) {
      score += 2;
    } else if (levels.length >= 2 && levels[0]! >= 4 && levels[1]! >= 4) {
      score -= 4; // holding: give the next skill its turn
    } else if (levels[0] !== undefined && levels[0] <= 2 && days < 3) {
      score += 3;
      reason = { key: "retry", level: levels[0] };
    } else if (levels[0] !== undefined && levels[0] >= 3 && levels[0] < 4) {
      score += 1;
      reason = { key: "consolidate", level: levels[0] };
    }
    if (days < 0.5) score -= 3; // practised today: rest it
    else if (days >= 3 && Number.isFinite(days)) {
      score += Math.min(3, days / 3);
      if (reason.key === "biggestGap") reason = { key: "rested", days: Math.floor(days) };
    }
    return { key, score, reason };
  });
  const best = scored.sort((a, b) => b.score - a.score)[0]!;
  return { skillKey: best.key, reason: best.reason };
}
