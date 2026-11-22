import { describe, expect, it } from "vitest";
import { CHALLENGES, challengeFor, weeklyChallenge } from "@/lib/grow/challenge";
import { weekStartOf, type PracticeEvent } from "@/lib/grow/momentum";

const ev = (iso: string, extra: Partial<PracticeEvent> = {}): PracticeEvent => ({ id: iso, completedAt: new Date(iso), skillKeys: ["judgment.trade-off-reasoning"], levels: [3], previousBest: null, reflected: false, ...extra });
const WEEK = 7 * 86_400_000;

/** A "now" in a week whose challenge is `key`. */
function weekWith(key: string): Date {
  let start = weekStartOf(new Date("2026-11-19T12:00:00Z"), 1);
  while (challengeFor(start).key !== key) start += WEEK;
  return new Date(start + 3 * 86_400_000 + 12 * 3_600_000);
}

describe("weekly challenge", () => {
  it("rotates through every challenge, one per week", () => {
    const start = weekStartOf(new Date("2026-11-19T12:00:00Z"), 1);
    const keys = new Set(Array.from({ length: CHALLENGES.length }, (_, i) => challengeFor(start + i * WEEK).key));
    expect(keys.size).toBe(CHALLENGES.length);
  });

  it("counts distinct days for 'three days'", () => {
    const now = weekWith("threeDays");
    const d = (n: number, h = 9) => new Date(weekStartOf(now, 1) + n * 86_400_000 + h * 3_600_000).toISOString();
    const s = weeklyChallenge([ev(d(0)), ev(d(0, 15)), ev(d(1)), ev(d(3))], { locale: "en", now });
    expect(s).toMatchObject({ key: "threeDays", target: 3, done: 3, complete: true });
    expect(s.completedAt?.toISOString()).toBe(d(3));
  });

  it("counts only comebacks that beat the first attempt", () => {
    const now = weekWith("twoComebacks");
    const d = (n: number) => new Date(weekStartOf(now, 1) + n * 86_400_000 + 9 * 3_600_000).toISOString();
    const s = weeklyChallenge([ev(d(0), { previousBest: 2, levels: [3] }), ev(d(1), { previousBest: 3, levels: [3] })], { locale: "en", now });
    expect(s).toMatchObject({ done: 1, complete: false, completedAt: null });
  });

  it("counts skills new this week", () => {
    const now = weekWith("newSkills");
    const start = weekStartOf(now, 1);
    const s = weeklyChallenge(
      [ev(new Date(start - 86_400_000).toISOString(), { skillKeys: ["a"] }), ev(new Date(start + 3_600_000).toISOString(), { skillKeys: ["a", "b"] }), ev(new Date(start + 7_200_000).toISOString(), { skillKeys: ["c"] })],
      { locale: "en", now },
    );
    expect(s).toMatchObject({ done: 2, complete: true });
  });
});
