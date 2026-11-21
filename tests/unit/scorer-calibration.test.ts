import { describe, expect, it } from "vitest";
import { offlineScore } from "@/lib/ai/offline/scorer";
import { affirms, containsAny } from "@/lib/ai/offline/text";
import { habitsIn } from "@/lib/ai/offline/signals";
import { BANK } from "@/lib/itembank";
import { CALIBRATION } from "../fixtures/calibration-answers";

function meanLevel(itemId: string, text: string) {
  const item = BANK.find((i) => i.id === itemId)!;
  const out = offlineScore({ hidden: item.hidden.en, rubricKeys: item.targets, stage: "MAIN", response: text });
  expect(out.scores.length).toBe(item.targets.length);
  return out.scores.reduce((a, s) => a + s.level, 0) / out.scores.length;
}

describe("offline scorer calibration", () => {
  const groups = new Map<string, Record<string, number>>();
  for (const c of CALIBRATION) {
    const k = `${c.itemId} (${c.lang})`;
    groups.set(k, { ...groups.get(k), [c.quality]: meanLevel(c.itemId, c.text) });
  }

  for (const [k, g] of groups) {
    it(`ranks strong > average > weak for ${k}`, () => {
      expect(g.strong!).toBeGreaterThan(g.average!);
      expect(g.average!).toBeGreaterThan(g.weak!);
    });
    it(`spreads ${k} across the scale`, () => {
      expect(g.strong!).toBeGreaterThanOrEqual(4);
      expect(g.weak!).toBeLessThanOrEqual(2.2);
      expect(g.average!).toBeGreaterThanOrEqual(1.9);
      expect(g.average!).toBeLessThanOrEqual(3.5);
    });
  }

  it("never lets a generic answer reach level 4", () => {
    const generic = "I would talk to everyone involved, think carefully about the options, and make a sensible decision that works for the team and the client.";
    for (const item of BANK.filter((i) => i.type !== "FORCED_CHOICE_WORK_STYLE").slice(0, 20)) {
      const out = offlineScore({ hidden: item.hidden.en, rubricKeys: item.targets, stage: "MAIN", response: generic });
      for (const s of out.scores) expect(s.level, `${item.id} ${s.competencyKey}`).toBeLessThanOrEqual(3);
    }
  });

  it("keeps confidence honest", () => {
    for (const c of CALIBRATION) {
      const item = BANK.find((i) => i.id === c.itemId)!;
      for (const s of offlineScore({ hidden: item.hidden.en, rubricKeys: item.targets, stage: "MAIN", response: c.text }).scores) {
        expect(s.confidence).toBeLessThanOrEqual(0.75);
        expect(c.text).toContain(s.evidenceQuote);
      }
    }
  });
});

describe("keyword matching", () => {
  it("matches at the start of words, not inside them", () => {
    expect(containsAny("the latest figures", ["test"])).toBeNull();
    expect(containsAny("we will test it", ["test"])).toBe("test");
    expect(containsAny("معاملة واحدة من كل 2,000", ["حد"])).toBeNull();
    expect(containsAny("نضع حدًا واضحًا", ["حد"])).toBe("حد");
  });

  it("allows Arabic attached prefixes and normalised letters", () => {
    expect(containsAny("سأرسل الخطة للعميل اليوم", ["العميل"])).toBe("العميل");
    expect(containsAny("وبالتالي فالمسؤولية علينا", ["المسؤولية"])).toBe("المسؤولية");
    expect(containsAny("سنتحمّل مسؤوليتنا كاملة", ["مسؤوليتنا"])).toBe("مسؤوليتنا");
  });

  it("ignores a keyword the writer negates", () => {
    expect(affirms("I won't blame the supplier for this.", ["blame the supplier"])).toBeNull();
    expect(affirms("Don't cut prices for all 20,000 customers.", ["cut prices"])).toBeNull();
    expect(affirms("We should cut prices now.", ["cut prices"])).toBe("cut prices");
    expect(affirms("لن نلوم المورد على ما حدث", ["نلوم المورد"])).toBeNull();
  });

  it("finds the habits of good answers in both languages", () => {
    expect([...habitsIn("I'll send the plan by 4pm because the client needs it, but the risk is the date.")]).toEqual(expect.arrayContaining(["ownership", "specifics", "reasons", "tradeoffs"]));
    expect([...habitsIn("سأرسل الخطة قبل الساعة 4 لأن العميل يحتاجها، لكن المخاطرة في الموعد.")]).toEqual(expect.arrayContaining(["ownership", "specifics", "reasons", "tradeoffs"]));
    expect(habitsIn("ok").size).toBe(0);
  });
});
