import { describe, expect, it } from "vitest";
import { momentum, unlockedBy, weekStartOf, weeklyTarget, type PracticeEvent } from "@/lib/grow/momentum";

// Thursday 19 November 2026, noon UTC.
const now = new Date("2026-11-19T12:00:00Z");
const at = (iso: string) => new Date(iso);
let n = 0;
const ev = (iso: string, levels: number[], extra: Partial<PracticeEvent> = {}): PracticeEvent => ({ id: `p${n++}`, completedAt: at(iso), skillKeys: ["judgment.trade-off-reasoning"], levels, previousBest: null, reflected: false, ...extra });

describe("Grow momentum", () => {
  it("sets the weekly goal from the hours chosen", () => {
    expect(weeklyTarget(2)).toBe(4);
    expect(weeklyTarget(0.2)).toBe(1);
    expect(weeklyTarget(20)).toBe(7);
  });

  it("starts weeks on Monday in English and Sunday in Arabic", () => {
    expect(new Date(weekStartOf(now, 1)).toISOString().slice(0, 10)).toBe("2026-11-16");
    expect(new Date(weekStartOf(now, 0)).toISOString().slice(0, 10)).toBe("2026-11-15");
  });

  it("counts this week, the days practised and the week streak", () => {
    const m = momentum(
      [ev("2026-11-03T09:00:00Z", [2]), ev("2026-11-10T09:00:00Z", [3]), ev("2026-11-16T09:00:00Z", [3]), ev("2026-11-18T09:00:00Z", [3])],
      { hoursPerWeek: 2, planSkills: [], locale: "en", now },
    );
    expect(m.week).toEqual({ done: 2, target: 4, days: [true, false, true, false, false, false, false] });
    expect(m.streakWeeks).toBe(3);
  });

  it("keeps last week's streak until this week has a session", () => {
    const m = momentum([ev("2026-11-10T09:00:00Z", [3])], { hoursPerWeek: 2, planSkills: [], locale: "en", now });
    expect(m.streakWeeks).toBe(1);
    expect(m.week.done).toBe(0);
  });

  it("unlocks milestones from what happened, and says what a session unlocked", () => {
    const retry = ev("2026-11-18T10:00:00Z", [4], { previousBest: 2, reflected: true });
    const m = momentum([ev("2026-11-18T09:00:00Z", [2]), retry], { hoursPerWeek: 0.5, planSkills: ["judgment.trade-off-reasoning"], locale: "en", now });
    const unlocked = Object.fromEntries(m.milestones.map((x) => [x.key, Boolean(x.unlockedAt)]));
    expect(unlocked).toMatchObject({ first: true, reflective: true, comeback: true, advanced: true, weekGoal: true, fullCircle: true, streak3: false, ten: false });
    expect(unlockedBy(m, retry).sort()).toEqual(["advanced", "comeback", "reflective"]);
    expect(m.next).toBe("streak3");
  });
});
