import { describe, expect, it } from "vitest";
import { DOMAINS, LEVEL_NAMES, WORK_STYLES } from "@/lib/framework/data";

describe("competency framework", () => {
  it("has the nine domains in order", () => {
    expect(DOMAINS.map((d) => d.key)).toEqual([
      "technical",
      "critical-thinking",
      "judgment",
      "leadership",
      "management",
      "communication",
      "product-thinking",
      "collaboration",
      "adaptability",
    ]);
    expect(DOMAINS.map((d) => d.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("marks only the technical domain as generated from the job description", () => {
    expect(DOMAINS.filter((d) => d.generatedFromJobDescription).map((d) => d.key)).toEqual(["technical"]);
  });

  it("uses unique, domain-prefixed sub-skill keys", () => {
    const keys = DOMAINS.flatMap((d) => d.subSkills.map((s) => s.key));
    expect(new Set(keys).size).toBe(keys.length);
    for (const d of DOMAINS) for (const s of d.subSkills) expect(s.key.startsWith(`${d.key}.`)).toBe(true);
  });

  it("writes five anchors per sub-skill in both languages", () => {
    for (const d of DOMAINS) {
      expect(d.subSkills.length).toBeGreaterThanOrEqual(4);
      for (const s of d.subSkills) {
        for (const l of [1, 2, 3, 4, 5] as const) {
          expect(s.anchors[l].en.length, `${s.key} L${l} en`).toBeGreaterThan(10);
          expect(s.anchors[l].ar.length, `${s.key} L${l} ar`).toBeGreaterThan(10);
        }
        expect(new Set(Object.values(s.anchors).map((a) => a.en)).size, `${s.key} anchors distinct`).toBe(5);
      }
    }
  });

  it("names five levels and four work styles", () => {
    expect(LEVEL_NAMES.map((l) => l.name.en)).toEqual(["Emerging", "Developing", "Proficient", "Advanced", "Expert"]);
    expect(WORK_STYLES).toHaveLength(4);
  });
});
