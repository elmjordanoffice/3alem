import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";
import { brandedEmail } from "@/lib/mail/templates";

const KINDS = ["invite", "renew", "team", "reset", "report"] as const;
const VARS = { org: "Qamar Logistics", role: "Operations Planner", minutes: 50, days: 14, manager: "Layla", team: "Operations", name: "Hana", date: "1 December 2026" };

describe("branded email (Range)", () => {
  it("renders every kind in both languages, with a plain-text twin", () => {
    for (const kind of KINDS) {
      for (const lang of ["en", "ar"] as const) {
        const mail = brandedEmail(kind, lang, VARS, { url: "https://aalim.test/a/token", org: "Qamar Logistics" });
        expect(mail.subject.length).toBeGreaterThan(0);
        expect(mail.html).toContain("/brand/logo-email.png");
        expect(mail.html).toContain('href="https://aalim.test/a/token"');
        expect(mail.text).toContain("https://aalim.test/a/token");
        expect(mail.html).not.toMatch(/\{\w+\}/); // every placeholder filled
      }
    }
  });

  it("is right-to-left and right-aligned in Arabic", () => {
    const { html } = brandedEmail("invite", "ar", VARS, { url: "https://aalim.test/a/token" });
    expect(html).toContain('<html lang="ar" dir="rtl">');
    expect(html).toContain('align="right"');
    expect(html).not.toContain('align="left"');
    // The link itself stays left-to-right.
    expect(html).toMatch(/dir="ltr"[^>]*>https:\/\/aalim\.test/);
  });

  it("uses the Range palette: bone ground, ink text, a vermilion button with ink text", () => {
    const { html } = brandedEmail("reset", "en", VARS, { url: "https://aalim.test/r" });
    expect(html).toContain("background:#f2f0eb");
    expect(html).toMatch(/bgcolor="#f04a23"[^>]*>\s*<a [^>]*color:#141414/);
    // Old brand colours are gone.
    for (const old of ["#17184a", "#3b3fd8", "#f2b532", "Alexandria"]) expect(html).not.toContain(old);
    expect(contrastRatio("#141414", "#f04a23")).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#67635b", "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });
});
