import { describe, expect, it } from "vitest";
import { confidenceBand, levelBand, levelRange } from "@/lib/levels";

describe("levels", () => {
  it("bands continuous estimates", () => {
    expect(levelBand(0.2)).toBe(1);
    expect(levelBand(2.49)).toBe(2);
    expect(levelBand(2.5)).toBe(3);
    expect(levelBand(4.6)).toBe(5);
    expect(levelBand(9)).toBe(5);
  });

  it("widens the range as confidence falls", () => {
    const [hiLo, hiHi] = levelRange(3, 0.9);
    const [loLo, loHi] = levelRange(3, 0.3);
    expect(hiHi - hiLo).toBeLessThan(loHi - loLo);
  });

  it("keeps ranges within 1–5 and around the estimate", () => {
    for (const e of [1, 1.4, 3.2, 4.8, 5]) {
      for (const c of [0, 0.5, 1]) {
        const [lo, hi] = levelRange(e, c);
        expect(lo).toBeGreaterThanOrEqual(1);
        expect(hi).toBeLessThanOrEqual(5);
        expect(lo).toBeLessThanOrEqual(e + 1e-9);
        expect(hi).toBeGreaterThanOrEqual(e - 1e-9);
      }
    }
  });

  it("labels confidence in three steps, never as a number", () => {
    expect(confidenceBand(0.2)).toBe("low");
    expect(confidenceBand(0.6)).toBe("moderate");
    expect(confidenceBand(0.8)).toBe("high");
  });
});

import { initials } from "@/lib/utils";
describe("initials", () => {
  it("takes first and last initials", () => {
    expect(initials("Lina Haddad")).toBe("LH");
    expect(initials("Yuki")).toBe("Y");
    expect(initials("  ")).toBe("?");
  });
  it("keeps Arabic initials as separate letters", () => {
    expect(initials("لينا حداد")).toBe("ل‌ح");
  });
});
