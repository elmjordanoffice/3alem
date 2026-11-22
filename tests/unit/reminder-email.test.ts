import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { brandedEmail } from "@/lib/mail/templates";

describe("the daily rep reminder email", () => {
  for (const lang of ["en", "ar"] as const) {
    it(`is friendly and says how to turn it off (${lang})`, () => {
      const m = brandedEmail("rep", lang, { name: "Sara", skill: "trade-off reasoning", streak: lang === "en" ? "Keep your 4-day streak going." : "حافظ على سلسلتك." }, { url: "https://example.test/app/grow" });
      expect(m.subject.length).toBeGreaterThan(5);
      expect(m.text).toContain("Sara");
      expect(m.text).toMatch(lang === "en" ? /Turn it off any time/ : /يمكنك إيقافه/);
      expect(m.text).not.toMatch(/don't lose|losing|last chance|hurry|urgent|تخسر|عاجل/i);
    });
  }
});
