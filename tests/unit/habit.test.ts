import { describe, expect, it } from "vitest";
import { habit } from "@/lib/grow/habit";
import type { PracticeEvent } from "@/lib/grow/momentum";

// Saturday 21 November 2026, 18:00 UTC. Weeks start Monday (en).
const now = new Date("2026-11-21T18:00:00Z");
const ev = (date: string): PracticeEvent => ({ id: date, completedAt: new Date(`${date}T09:00:00Z`), skillKeys: ["a"], levels: [3], previousBest: null, reflected: false });

describe("the daily rep streak", () => {
  it("counts consecutive days, with today only once it's done", () => {
    const h = habit([ev("2026-11-19"), ev("2026-11-20")], { locale: "en", now });
    expect(h).toMatchObject({ streak: 2, doneToday: false });
    expect(habit([ev("2026-11-19"), ev("2026-11-20"), ev("2026-11-21")], { locale: "en", now }).streak).toBe(3);
  });

  it("forgives one missed day per week as a rest day", () => {
    const h = habit([ev("2026-11-17"), ev("2026-11-18"), ev("2026-11-20")], { locale: "en", now });
    expect(h.streak).toBe(3);
    expect(h.week.map((d) => d.state)).toEqual(["missed", "done", "done", "rest", "done", "today", "future"]);
  });

  it("ends the streak on a second missed day in the same week", () => {
    const h = habit([ev("2026-11-16"), ev("2026-11-18"), ev("2026-11-20")], { locale: "en", now });
    // Tue 17 is the rest day; Thu 19 is missed, so only Fri 20 counts.
    expect(h.streak).toBe(1);
    expect(h.best).toBe(2);
  });

  it("is zero with no practice, and today waits", () => {
    const h = habit([], { locale: "en", now });
    expect(h).toMatchObject({ streak: 0, doneToday: false, best: 0 });
    expect(h.week[5]!.state).toBe("today");
  });
});
