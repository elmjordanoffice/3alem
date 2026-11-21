import { describe, expect, it } from "vitest";
import { firstDays } from "@/lib/hire/first-days";
import type { ReportContent } from "@/lib/hire/report-types";

const d = (key: string, estimate: number, importance: "MUST_HAVE" | "NICE_TO_HAVE" | null = null) => ({ key, name: key, estimate, confidence: 0.6, range: [estimate - 0.4, estimate + 0.4], importance });

describe("first 90 days", () => {
  it("leans on strengths (must-haves first) and supports the role's gaps with a track and a habit", () => {
    const plan = firstDays({
      kind: "HIRE",
      domains: [d("communication", 4.4), d("management", 3.8, "MUST_HAVE"), d("judgment", 2.9, "MUST_HAVE")],
      fit: { gaps: [{ key: "judgment", name: "Judgment", gap: 0.6 }] },
    } as unknown as ReportContent)!;
    expect(plan.useEarly.map((u) => u.key)).toEqual(["management", "communication"]);
    expect(plan.support).toEqual([{ key: "judgment", name: "Judgment", track: "decisions-under-pressure", habit: "tradeoffs" }]);
  });

  it("is only for Hire reports", () => {
    expect(firstDays({ kind: "GROW", domains: [], fit: { gaps: [] } } as unknown as ReportContent)).toBeNull();
  });
});
