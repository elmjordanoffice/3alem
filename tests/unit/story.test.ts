import { describe, expect, it } from "vitest";
import { clockFor, dayOf, noteFor } from "@/lib/hire/story";

const cast = [{ name: "Leila Haddad", role: "Head of Operations" }, { name: "Tomás Rivera", role: "Coordinator" }];

describe("the week, alive", () => {
  it("reads the day from the chapter title", () => {
    expect(dayOf("Day 2: The first delays", 1)).toBe(2);
    expect(dayOf("Days 3–4: Competing demands", 2)).toBe(3);
    expect(dayOf("The review", 3)).toBe(4);
  });

  it("moves the clock on through scenes and follow-ups, within the working day", () => {
    const a = clockFor("Day 1: The brief", 0, 1, "MAIN");
    const b = clockFor("Day 1: The brief", 0, 1, "TWIST");
    const c = clockFor("Day 1: The brief", 0, 3, "MAIN");
    expect(a).toEqual({ day: 1, minutes: 9 * 60 + 10 });
    expect(b.minutes).toBeGreaterThan(a.minutes);
    expect(c.minutes).toBeGreaterThan(b.minutes);
    expect(clockFor("Day 1", 0, 20, "TWIST").minutes).toBeLessThanOrEqual(17 * 60 + 40);
  });

  it("sends a neutral note from someone the previous scene involved", () => {
    const n = noteFor({ title: "The afternoon queue", scenario: "Leila Haddad wants your recommendation." }, cast, "en", 600)!;
    expect(n.from.name).toBe("Leila Haddad");
    expect(n.text).toContain("“The afternoon queue”");
    expect(n.minutes).toBeLessThan(600);
    expect(noteFor(null, cast, "en", 600)).toBeNull();
  });

  it("never evaluates, in either language", () => {
    for (let i = 0; i < 40; i++) {
      for (const locale of ["en", "ar"] as const) {
        const n = noteFor({ title: `Scene ${i}`, scenario: "" }, cast, locale, 700)!;
        expect(n.text).not.toMatch(/great|good|excellent|well done|wrong|mistake|ممتاز|رائع|جيد|خطأ/i);
      }
    }
  });
});
