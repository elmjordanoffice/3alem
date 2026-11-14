import { describe, expect, it } from "vitest";
import { estimateSkill } from "@/lib/engine";
import { PERSONAS, recovery, simulate } from "../engine/personas";

/**
 * Acceptance: 30 simulated candidates with known profiles run through the
 * engine. Profiles must be recovered within one level on at least 80% of
 * sub-skills. Run on every engine or prompt change.
 */
describe("persona recovery (30 simulated candidates)", () => {
  const sims = PERSONAS.map((p) => ({ p, sim: simulate(p) }));

  it("recovers ≥ 80% of measured sub-skills within one level", () => {
    let within = 0;
    let total = 0;
    const lines: string[] = [];
    for (const { p, sim } of sims) {
      const r = recovery(sim);
      within += r.measured.within;
      total += r.measured.total;
      lines.push(`${p.id} ${p.description.padEnd(48)} measured ${r.measured.within}/${r.measured.total}  all ${r.all.within}/${r.all.total}  domains ${r.domains.within}/${r.domains.total}  items ${sim.targets.length}  ${sim.elapsed}m`);
    }
    console.info(lines.join("\n"));
    console.info(`measured sub-skills within one level: ${within}/${total} = ${((100 * within) / total).toFixed(1)}%`);
    expect(within / total).toBeGreaterThanOrEqual(0.8);
  });

  it("recovers ≥ 80% of all sub-skills within one level (including inferred ones)", () => {
    const totals = sims.map(({ sim }) => recovery(sim).all).reduce((a, b) => ({ within: a.within + b.within, total: a.total + b.total }));
    console.info(`all sub-skills within one level: ${totals.within}/${totals.total} = ${((100 * totals.within) / totals.total).toFixed(1)}%`);
    expect(totals.within / totals.total).toBeGreaterThanOrEqual(0.8);
  });

  it("recovers ≥ 90% of domains within one level", () => {
    const totals = sims.map(({ sim }) => recovery(sim).domains).reduce((a, b) => ({ within: a.within + b.within, total: a.total + b.total }));
    expect(totals.within / totals.total).toBeGreaterThanOrEqual(0.9);
  });

  it("never runs over the time budget", () => {
    for (const { sim } of sims) expect(sim.elapsed).toBeLessThanOrEqual(50);
  });

  it("keeps at least 60% production tasks", () => {
    for (const { p, sim } of sims) {
      const types = sim.targets.map((t) => t.itemType).filter((t) => t !== "FORCED_CHOICE_WORK_STYLE");
      const production = types.filter((t) => !["TRADE_OFF_DILEMMA", "CONSEQUENCE_CHAIN"].includes(t)).length;
      expect(production / types.length, p.id).toBeGreaterThanOrEqual(0.6);
    }
  });

  it("gives every domain a baseline", () => {
    for (const { p, sim } of sims) {
      const domains = new Set(Object.values(sim.model.skills).filter((s) => s.observations.length).map((s) => s.domain));
      expect(domains.size, p.id).toBe(9);
    }
  });

  it("finds the hidden management talent (p12) and confirms it", () => {
    const { sim } = sims.find((s) => s.p.id === "p12")!;
    const confirmed = sim.model.hypotheses.filter((h) => h.status === "CONFIRMED" && h.direction === "STRENGTH").map((h) => h.skill);
    expect(confirmed.some((k) => k.startsWith("management.") || k.startsWith("judgment."))).toBe(true);
  });

  it("stress-tests confirmed strengths up to a ceiling", () => {
    const { sim } = sims.find((s) => s.p.id === "p09")!;
    const stressed = sim.targets.filter((t) => t.purpose === "stress");
    expect(stressed.length).toBeGreaterThan(0);
    expect(Math.max(...stressed.map((t) => t.difficulty))).toBeGreaterThanOrEqual(4);
  });

  it("opens and validates weaknesses for the struggling candidate (p10)", () => {
    const { sim } = sims.find((s) => s.p.id === "p10")!;
    expect(sim.model.hypotheses.some((h) => h.direction === "WEAKNESS" && h.status === "CONFIRMED")).toBe(true);
  });

  it("reports higher confidence for must-have domains than for low-weight ones on average", () => {
    let must = 0;
    let low = 0;
    for (const { sim } of sims) {
      must += estimateSkill(sim.model, "critical-thinking.evaluating-evidence").confidence;
      low += estimateSkill(sim.model, "product-thinking.idea-generation").confidence;
    }
    expect(must).toBeGreaterThan(low);
  });
});
