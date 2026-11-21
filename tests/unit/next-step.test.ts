import { describe, expect, it } from "vitest";
import { nextStep } from "@/lib/grow/next-step";

const day = 86400_000;
const now = new Date("2026-11-21T12:00:00Z");
const at = (daysAgo: number) => new Date(now.getTime() - daysAgo * day);
const plan = ["a", "b", "c"];

describe("Grow's next step", () => {
  it("starts with the biggest gap when nothing has been practised", () => {
    expect(nextStep(plan, [], now)).toEqual({ skillKey: "a", reason: { key: "start" } });
  });

  it("rests a skill practised today and moves on", () => {
    const r = nextStep(plan, [{ skillKeys: ["a"], completedAt: at(0.1), scores: [{ competencyKey: "a", level: 3 }] }], now);
    expect(r?.skillKey).toBe("b");
  });

  it("gives the next skill its turn once one is holding at Advanced", () => {
    const h = [
      { skillKeys: ["a"], completedAt: at(1), scores: [{ competencyKey: "a", level: 4 }] },
      { skillKeys: ["a"], completedAt: at(2), scores: [{ competencyKey: "a", level: 4 }] },
    ];
    expect(nextStep(plan, h, now)?.skillKey).not.toBe("a");
  });

  it("brings a weak attempt back while it is fresh", () => {
    const h = [
      { skillKeys: ["b"], completedAt: at(1), scores: [{ competencyKey: "b", level: 2 }] },
      { skillKeys: ["a"], completedAt: at(1.2), scores: [{ competencyKey: "a", level: 3 }] },
      { skillKeys: ["c"], completedAt: at(1.4), scores: [{ competencyKey: "c", level: 3 }] },
    ];
    expect(nextStep(plan, h, now)).toEqual({ skillKey: "b", reason: { key: "retry", level: 2 } });
  });

  it("says when a skill has rested long enough", () => {
    const h = [
      { skillKeys: ["a"], completedAt: at(0.2), scores: [{ competencyKey: "a", level: 3 }] },
      { skillKeys: ["b"], completedAt: at(0.3), scores: [{ competencyKey: "b", level: 3 }] },
      { skillKeys: ["c"], completedAt: at(9), scores: [{ competencyKey: "c", level: 3 }] },
    ];
    const r = nextStep(plan, h, now);
    expect(r?.skillKey).toBe("c");
  });
});
