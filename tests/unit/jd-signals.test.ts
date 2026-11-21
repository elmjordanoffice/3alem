import { describe, expect, it } from "vitest";
import { blendedWeights, detectFamily, domainSignals } from "@/lib/hire/jd-signals";

const OPS = `Operations Team Lead

Run a team of six coordinators across our regional warehouse and delivery network. Plan daily and weekly operations, set priorities when demand spikes, keep service levels and costs on track. Coach your team, handle escalations, and fix recurring problems at the root.
- 4+ years in operations, logistics or supply chain
- Comfortable with data and dashboards
- Good judgment under pressure`;

const CS = `Customer Success Lead

Own relationships with our largest retail and pharmaceutical clients. Run quarterly reviews, turn client feedback into improvements with product and operations, and calm difficult conversations. Mentor two account coordinators.
- Excellent listening and clear writing, in English and Arabic
- Comfort building a case with data and persuading senior stakeholders
- A habit of following through and owning the outcome`;

const AR = `مسؤول نجاح العملاء

تبني علاقات قوية مع العملاء، وتتعاون مع أصحاب المصلحة، وتحسن تجربة العملاء. مهارات تواصل وكتابة ممتازة، وقدرة على الإقناع والتفاوض.`;

describe("reading a job description offline", () => {
  it("prefers the specific family named in the title over a generic word in the body", () => {
    expect(detectFamily(CS).key).toBe("customer-success");
    expect(detectFamily(OPS).key).toBe("operations");
    expect(detectFamily(AR).key).toBe("customer-success");
  });

  it("finds what the description asks for, in either language", () => {
    const cs = domainSignals(CS);
    expect(cs.communication!.score).toBeGreaterThan(0.4);
    expect(cs.collaboration!.score).toBeGreaterThan(0.4);
    expect(cs.communication!.found.length).toBeGreaterThan(0);
    const ar = domainSignals(AR);
    expect(ar.communication!.score).toBeGreaterThan(0.3);
    expect(ar.collaboration!.score).toBeGreaterThan(0.3);
  });

  it("gives two different roles two different profiles", () => {
    const must = (jd: string) => blendedWeights(jd, detectFamily(jd)).filter((w) => w.mustHave).map((w) => w.domain).sort();
    const ops = must(OPS);
    const cs = must(CS);
    expect(ops).not.toEqual(cs);
    expect(cs).toEqual(expect.arrayContaining(["collaboration"]));
    expect(ops.some((d) => d === "management" || d === "judgment" || d === "technical")).toBe(true);
    for (const list of [ops, cs]) expect(list.length).toBeLessThanOrEqual(3);
  });
});
