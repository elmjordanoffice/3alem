import { describe, expect, it } from "vitest";
import { recapFrom } from "@/lib/hire/recap";

const w = (text: string, stage = "MAIN", durationMs = 120_000) => ({ stage, content: { kind: "written", text }, durationMs });

describe("candidate recap", () => {
  it("counts scenes, follow-ups, words and minutes", () => {
    const r = recapFrom([w("one two three"), w("four five", "PROBE", 60_000), { stage: "MAIN", content: { kind: "forced_choice", picks: { a: "a" } }, durationMs: 30_000 }]);
    expect(r).toMatchObject({ scenes: 2, followUps: 1, words: 5, minutes: 4 });
  });

  it("names a habit only when it shows up in two answers or more", () => {
    const r = recapFrom([
      w("I would check the numbers first because the data was incomplete."),
      w("I'd verify with the team because the figures disagree."),
      w("I will call the client by Friday."),
    ]);
    expect(r.habits).toContain("reasons");
    expect(r.habits).toContain("checking");
    expect(r.habits).not.toContain("specifics");
    expect(r.habits.length).toBeLessThanOrEqual(3);
  });

  it("reads Arabic answers too", () => {
    const r = recapFrom([w("سأتحقق من الأرقام أولًا لأن البيانات ناقصة."), w("أريد مراجعة البيانات لأن الأرقام متضاربة.")]);
    expect(r.habits).toEqual(expect.arrayContaining(["reasons", "checking"]));
  });
});
