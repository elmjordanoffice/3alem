import { describe, expect, it } from "vitest";
import type { ItemType } from "@/lib/assessment/item-schema";
import {
  buildRoleProfile,
  chapterFor,
  createModel,
  estimateDomain,
  estimateSkill,
  recordItem,
  reviewHypotheses,
  roleFit,
  selectNextTarget,
  shouldStop,
  updateModel,
  workStylePositions,
  recordWorkStyle,
  SINGLE_ITEM_CONFIDENCE_CAP,
} from "@/lib/engine";
import { DEFAULT_ROLE } from "../engine/personas";

const role = buildRoleProfile(DEFAULT_ROLE);
const item = (id: string, type: ItemType = "CASE_ANALYSIS", difficulty = 3) => ({ itemId: id, type, difficulty, timed: false });
const score = (key: string, level: number, confidence = 0.8) => ({ competencyKey: key, level, confidence, evidenceQuote: "quote" });

describe("candidate model", () => {
  it("starts every sub-skill at the prior with zero confidence", () => {
    const m = createModel(role);
    const e = estimateSkill(m, "judgment.risk-calibration");
    expect(e.mean).toBeCloseTo(3);
    expect(e.confidence).toBe(0);
  });

  it("moves towards evidence and gains confidence", () => {
    let m = createModel(role);
    m = updateModel(m, { item: item("a"), stage: "MAIN", scores: [score("judgment.risk-calibration", 4)] });
    const one = estimateSkill(m, "judgment.risk-calibration");
    expect(one.mean).toBeGreaterThan(3.3);
    m = updateModel(m, { item: item("b", "TRADE_OFF_DILEMMA"), stage: "MAIN", scores: [score("judgment.risk-calibration", 4)] });
    const two = estimateSkill(m, "judgment.risk-calibration");
    expect(two.confidence).toBeGreaterThan(one.confidence);
  });

  it("never trusts one item: caps confidence until a second item agrees", () => {
    let m = createModel(role);
    for (const stage of ["MAIN", "PROBE", "TWIST"] as const) {
      m = updateModel(m, { item: item("a"), stage, scores: [score("communication.listening", 4, 1)] });
    }
    expect(estimateSkill(m, "communication.listening").confidence).toBeLessThanOrEqual(SINGLE_ITEM_CONFIDENCE_CAP);
  });

  it("informs untested siblings through the domain", () => {
    let m = createModel(role);
    m = updateModel(m, { item: item("a"), stage: "MAIN", scores: [score("leadership.ownership", 5), score("leadership.courage", 5)] });
    expect(estimateSkill(m, "leadership.developing-others").mean).toBeGreaterThan(3.3);
    expect(estimateSkill(m, "leadership.developing-others").confidence).toBeLessThan(estimateSkill(m, "leadership.ownership").confidence);
  });

  it("flags contradictions across items and lowers confidence", () => {
    let m = createModel(role);
    m = updateModel(m, { item: item("a"), stage: "MAIN", scores: [score("communication.persuasion", 5, 1)] });
    m = updateModel(m, { item: item("b", "WRITTEN_WORK_SAMPLE"), stage: "MAIN", scores: [score("communication.persuasion", 5, 1)] });
    m = updateModel(m, { item: item("c", "ROLE_PLAY"), stage: "MAIN", scores: [score("communication.persuasion", 1, 1)] });
    expect(m.skills["communication.persuasion"]!.flags).toContain("inconsistent");
  });

  it("is pure: updateModel does not mutate its input", () => {
    const m = createModel(role);
    const before = JSON.stringify(m);
    updateModel(m, { item: item("a"), stage: "MAIN", scores: [score("judgment.risk-calibration", 5)] });
    expect(JSON.stringify(m)).toBe(before);
  });

  it("ignores scores for skills outside the session's map", () => {
    const m = updateModel(createModel(role), { item: item("a"), stage: "MAIN", scores: [score("made-up.skill", 5)] });
    expect(m.skills["made-up.skill"]).toBeUndefined();
  });

  it("pools a domain estimate", () => {
    let m = createModel(role);
    m = updateModel(m, { item: item("a"), stage: "MAIN", scores: [score("management.delegation", 2), score("management.follow-through", 2)] });
    expect(estimateDomain(m, "management").mean).toBeLessThan(3);
  });
});

describe("selection and stopping", () => {
  it("starts by calibrating with a role work sample", () => {
    const t = selectNextTarget(createModel(role), role, { totalMinutes: 50, elapsedMinutes: 0 })!;
    expect(t.purpose).toBe("calibrate");
    expect(t.itemType).toBe("TECHNICAL_TASK");
    expect(t.difficulty).toBe(3);
  });

  it("never schedules an item longer than the time left", () => {
    let m = createModel(role);
    for (let i = 0; i < 4; i++) {
      const t = selectNextTarget(m, role, { totalMinutes: 50, elapsedMinutes: 44 })!;
      if (!t) break;
      expect(t.estMinutes).toBeLessThanOrEqual(6);
      m = recordItem(m, { itemId: `x${i}`, type: t.itemType, difficulty: t.difficulty, targets: t.skills, minutes: t.estMinutes, chapter: 4, purpose: t.purpose, timed: t.timed });
    }
  });

  it("stops when the budget is spent", () => {
    expect(shouldStop(createModel(role), role, { totalMinutes: 50, elapsedMinutes: 48 })).toBe(true);
    expect(shouldStop(createModel(role), role, { totalMinutes: 50, elapsedMinutes: 0 })).toBe(false);
  });

  it("maps elapsed time to four chapters", () => {
    expect(chapterFor({ totalMinutes: 40, elapsedMinutes: 0 })).toBe(1);
    expect(chapterFor({ totalMinutes: 40, elapsedMinutes: 15 })).toBe(2);
    expect(chapterFor({ totalMinutes: 40, elapsedMinutes: 39 })).toBe(4);
  });
});

describe("hypotheses", () => {
  it("opens a strength hypothesis on a surprising answer and never validates with the same item", () => {
    let m = createModel(role);
    m = updateModel(m, { item: item("a"), stage: "MAIN", scores: [score("critical-thinking.evaluating-evidence", 3), score("judgment.trade-off-reasoning", 3)] });
    m = updateModel(m, { item: item("b", "RANKING_ALLOCATION"), stage: "MAIN", scores: [score("management.planning-prioritisation", 5)] });
    m = reviewHypotheses(m, role);
    const h = m.hypotheses.find((x) => x.skill === "management.planning-prioritisation");
    expect(h?.direction).toBe("STRENGTH");
    expect(h?.status).toBe("OPEN");
    m = updateModel(m, { item: item("b", "RANKING_ALLOCATION"), stage: "PROBE", scores: [score("management.planning-prioritisation", 5)] });
    m = reviewHypotheses(m, role);
    expect(m.hypotheses.find((x) => x.skill === "management.planning-prioritisation")?.status).toBe("OPEN");
  });
});

describe("role fit and work style", () => {
  it("caps fit at Partial when a must-have has a large gap", () => {
    let m = createModel(role);
    for (const id of ["a", "b", "c"]) {
      m = updateModel(m, { item: item(id), stage: "MAIN", scores: [score("technical.problem-diagnosis", 1), score("technical.role-knowledge", 1), score("judgment.trade-off-reasoning", 5), score("communication.persuasion", 5)] });
    }
    expect(["PARTIAL", "WEAK"]).toContain(roleFit(m, role).fit);
  });

  it("reports styles as positions, not scores", () => {
    const m = recordWorkStyle(createModel(role), [
      { style: "workstyle.pace", pole: "b" },
      { style: "workstyle.pace", pole: "b" },
      { style: "workstyle.pace", pole: "a" },
    ]);
    expect(workStylePositions(m)["workstyle.pace"]!.position).toBeCloseTo(1 / 3);
  });
});
