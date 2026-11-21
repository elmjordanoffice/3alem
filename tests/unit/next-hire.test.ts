import { describe, expect, it } from "vitest";
import { hireSkills, nextHire } from "@/lib/team/next-hire";
import { blendedWeights, detectFamily } from "@/lib/hire/jd-signals";

describe("next hire from team gaps", () => {
  it("orders skills by urgency and keeps at most three", () => {
    const skills = hireSkills([
      { key: "communication", name: "Communication", reason: "low_team_level" },
      { key: "judgment", name: "Judgment", reason: "no_one_strong" },
      { key: "leadership", name: "Leadership", reason: "single_point" },
      { key: "adaptability", name: "Adaptability", reason: "low_team_level" },
    ]);
    expect(skills.map((s) => s.key)).toEqual(["judgment", "leadership", "communication"]);
  });

  it("returns nothing when the team has no gaps", () => {
    expect(nextHire({ name: "Ops", gaps: [] }, "en")).toBeNull();
  });

  for (const locale of ["en", "ar"] as const) {
    it(`drafts a description the reader turns into a role weighted on the gaps (${locale})`, () => {
      const hire = nextHire(
        {
          name: locale === "en" ? "Customer Operations" : "عمليات العملاء",
          gaps: [
            { key: "judgment", name: locale === "en" ? "Judgment" : "الحكم", reason: "no_one_strong" },
            { key: "critical-thinking", name: locale === "en" ? "Critical thinking" : "التفكير النقدي", reason: "low_team_level" },
          ],
        },
        locale,
      )!;
      expect(hire.jobDescription.length).toBeGreaterThan(200);
      const weights = blendedWeights(hire.jobDescription, detectFamily(hire.jobDescription));
      const must = weights.filter((w) => w.mustHave).map((w) => w.domain);
      expect(must).toContain("judgment");
      expect(must).toContain("critical-thinking");
      const top = [...weights].sort((a, b) => b.weight - a.weight).slice(0, 2).map((w) => w.domain);
      expect(top.sort()).toEqual(["critical-thinking", "judgment"]);
    });
  }
});
