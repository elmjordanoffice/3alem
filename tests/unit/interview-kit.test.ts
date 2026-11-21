import { describe, expect, it } from "vitest";
import { buildFocus, disagrees, focusAreas } from "@/lib/hire/interview";
import type { ReportContent, ReportDomain, ReportSkill } from "@/lib/hire/report-types";

const skill = (key: string, name: string, estimate: number, confidence: number, importance: ReportSkill["importance"] = null, observations = 2): ReportSkill => ({
  key,
  name,
  estimate,
  confidence,
  range: [estimate - 0.4, estimate + 0.4],
  observations,
  evidenceIds: [],
  flags: [],
  importance,
});

function report(over: Partial<ReportContent> = {}): ReportContent {
  const judgment: ReportDomain = {
    ...skill("judgment", "Decision-making and judgment", 2.9, 0.7, "MUST_HAVE"),
    subSkills: [skill("judgment.trade-off-reasoning", "Trade-off reasoning", 2.6, 0.6, "MUST_HAVE"), skill("judgment.risk-calibration", "Risk calibration", 3.2, 0.7)],
  };
  const comms: ReportDomain = { ...skill("communication", "Communication", 3.6, 0.4, "NICE_TO_HAVE"), subSkills: [skill("communication.listening", "Listening", 3.6, 0.35, "NICE_TO_HAVE")] };
  const tech: ReportDomain = { ...skill("technical", "Technical / domain expertise", 4.2, 0.8, "MUST_HAVE"), subSkills: [] };
  return {
    version: "report.v1",
    kind: "HIRE",
    language: "en",
    generatedAt: "2026-11-21T00:00:00Z",
    earlyVersion: true,
    candidate: { name: "Test" },
    role: { title: "Team lead", seniority: "senior", family: null },
    fit: { level: "PARTIAL", confidence: 0.6, margin: -0.4, gaps: [{ key: "judgment", name: "Decision-making and judgment", gap: 1.1 }] },
    domains: [judgment, comms, tech],
    narrative: {
      portrait: [],
      strengths: [],
      hiddenPotential: [],
      developmentAreas: [],
      decisionPattern: { headline: "", explanation: "", evidenceIds: [] },
      interviewQuestions: [{ question: "Tell me about a hard choice.", followUp: "What did you give up?", skillKey: "judgment.trade-off-reasoning", why: "" }],
    },
    evidence: {},
    hypotheses: [],
    workStyle: [],
    integrity: { minutesUsed: 0, budgetMinutes: 0, itemsCompleted: 0, pasteEvents: 0, tabHidden: 0, styleShifts: 0, inconsistentSkills: [], notes: [] },
    method: { scoring: "offline", scorerVersions: [], writer: "", engineVersion: "", doubleScoredItems: 0 },
    ...over,
  } as ReportContent;
}

describe("interview kit", () => {
  it("starts with must-have gaps (at their sharpest sub-skill), then the least certain areas", () => {
    const areas = focusAreas(report());
    expect(areas[0]).toMatchObject({ reason: "gap" });
    expect(areas[0]!.skill.key).toBe("judgment.trade-off-reasoning");
    expect(areas.map((a) => a.skill.key)).toContain("communication.listening");
    expect(areas.length).toBeGreaterThanOrEqual(3);
    expect(areas.length).toBeLessThanOrEqual(5);
  });

  it("uses the report's own question in its language, without repeating follow-ups", () => {
    const [first] = buildFocus(report(), "en");
    expect(first!.question).toBe("Tell me about a hard choice.");
    expect(new Set(first!.followUps.map((f) => f.toLowerCase())).size).toBe(first!.followUps.length);
    expect(first!.listenFor.length).toBe(3);
    expect(first!.anchors.map((a) => a.level)).toEqual([2, 4]);
  });

  it("speaks the reader's language when the report was written in another", () => {
    for (const f of buildFocus(report(), "ar")) {
      expect(f.question).toMatch(/[؀-ۿ]/);
      expect(f.name).toMatch(/[؀-ۿ]/);
      for (const x of [...f.followUps, ...f.listenFor, ...f.watchFor]) expect(x).toMatch(/[؀-ۿ]/);
    }
  });

  it("flags ratings a full level outside the assessment's range", () => {
    expect(disagrees(5, [3, 3.8])).toBe(true);
    expect(disagrees(4, [3, 3.8])).toBe(false);
    expect(disagrees(2, [3, 3.8])).toBe(true);
    expect(disagrees(null, [3, 3.8])).toBe(false);
  });
});
