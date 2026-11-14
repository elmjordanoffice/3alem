import { describe, expect, it } from "vitest";
import { directionOf, negotiateLocale } from "@/i18n/config";
import { formatDuration, formatLevel, formatNumber, formatRange } from "@/lib/i18n/format";
import { localized } from "@/lib/i18n/localized";
import en from "../../messages/en.json";
import ar from "../../messages/ar.json";

function paths(obj: unknown, prefix = ""): string[] {
  if (typeof obj !== "object" || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
}

describe("i18n", () => {
  it("negotiates locale from Accept-Language", () => {
    expect(negotiateLocale("ar-SA,ar;q=0.9,en;q=0.8")).toBe("ar");
    expect(negotiateLocale("fr-FR,en;q=0.5")).toBe("en");
    expect(negotiateLocale("fr-FR")).toBe("en");
    expect(negotiateLocale(null)).toBe("en");
  });

  it("sets direction", () => {
    expect(directionOf("ar")).toBe("rtl");
    expect(directionOf("en")).toBe("ltr");
  });

  it("formats numbers with the chosen numeral system", () => {
    expect(formatNumber(2026, "ar", "latn", { useGrouping: false })).toBe("2026");
    expect(formatNumber(2026, "ar", "arab", { useGrouping: false })).toBe("٢٠٢٦");
    expect(formatLevel(3.8, "en", "latn")).toBe("3.8");
    expect(formatRange(3.8, 4.3, "en", "latn")).toBe("3.8–4.3");
    expect(formatDuration(95, "en", "latn")).toBe("01:35");
    expect(formatDuration(95, "ar", "arab")).toBe("٠١:٣٥");
  });

  it("reads localized JSON with an English fallback", () => {
    expect(localized({ en: "Hello", ar: "مرحبا" }, "ar")).toBe("مرحبا");
    expect(localized({ en: "Hello" }, "ar")).toBe("Hello");
    expect(localized(null, "en")).toBe("");
  });

  it("has the same message keys in English and Arabic", () => {
    expect(paths(ar).sort()).toEqual(paths(en).sort());
  });
});
