import { describe, expect, it } from "vitest";
import { differences } from "@/lib/hire/compare";
import type { ReportContent } from "@/lib/hire/report-types";

function report(levels: Record<string, [number, number, number]>, quotes: Record<string, string> = {}): ReportContent {
  const evidence: ReportContent["evidence"] = {};
  const domains = Object.entries(levels).map(([key, [estimate, lo, hi]]) => {
    const id = `e-${key}-${estimate}`;
    if (quotes[key]) evidence[id] = { id, scoreId: id, skillKey: key, level: estimate, confidence: 0.6, quote: quotes[key]!, rationale: "", itemTitle: "", chapter: 0, stage: "MAIN" };
    return { key, name: key, estimate, confidence: 0.6, range: [lo, hi] as [number, number], observations: 3, evidenceIds: quotes[key] ? [id] : [], flags: [], importance: key === "judgment" ? ("MUST_HAVE" as const) : null, subSkills: [] };
  });
  return { domains, evidence } as unknown as ReportContent;
}

describe("compare: where candidates really differ", () => {
  it("counts a difference only when ranges don't overlap", () => {
    const a = { sessionId: "a", name: "Ana", content: report({ judgment: [4.2, 3.8, 4.6], communication: [3.4, 2.9, 3.9] }, { judgment: "I would pause the launch and tell the client today." }) };
    const b = { sessionId: "b", name: "Ben", content: report({ judgment: [2.6, 2.2, 3.0], communication: [3.1, 2.6, 3.6] }, { judgment: "Ship it and see." }) };
    const { clear, within } = differences([a, b]);
    expect(clear.map((d) => d.key)).toEqual(["judgment"]);
    expect(clear[0]).toMatchObject({ mustHave: true, gap: 1.6, leader: { name: "Ana" }, trailer: { name: "Ben", quote: "Ship it and see." } });
    expect(within.map((w) => w.key)).toEqual(["communication"]);
  });

  it("puts must-haves first, then the biggest gaps", () => {
    const a = { sessionId: "a", name: "A", content: report({ adaptability: [4.6, 4.3, 4.9], judgment: [3.6, 3.3, 3.9] }) };
    const b = { sessionId: "b", name: "B", content: report({ adaptability: [2.0, 1.7, 2.3], judgment: [2.8, 2.5, 3.1] }) };
    expect(differences([a, b]).clear.map((d) => d.key)).toEqual(["judgment", "adaptability"]);
  });
});

describe("compare: three or more", () => {
  it("sets the leader against the closest person still clearly behind", () => {
    const a = { sessionId: "a", name: "A", content: report({ judgment: [4.4, 4.1, 4.7] }) };
    const b = { sessionId: "b", name: "B", content: report({ judgment: [4.0, 3.6, 4.4] }) };
    const c = { sessionId: "c", name: "C", content: report({ judgment: [3.2, 2.9, 3.5] }) };
    const d = { sessionId: "d", name: "D", content: report({ judgment: [2.0, 1.7, 2.3] }) };
    const [diff] = differences([a, b, c, d]).clear;
    expect(diff).toMatchObject({ leader: { name: "A" }, trailer: { name: "C" }, gap: 1.2 });
  });
});
