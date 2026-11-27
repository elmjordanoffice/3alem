import type { AppLocale, NumeralSystem } from "@/i18n/config";
import { formatNumber } from "@/lib/i18n/format";

/**
 * US dollars for display: "$149" in English, "149 USD" in Arabic (the "US$"
 * symbol reorders badly in right-to-left text).
 */
export function usdOptions(locale: AppLocale, cents = false): Intl.NumberFormatOptions {
  return { style: "currency", currency: "USD", currencyDisplay: locale === "ar" ? "code" : "symbol", minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 };
}

export function formatUsd(value: number, locale: AppLocale, numerals: NumeralSystem, cents = false): string {
  return formatNumber(value, locale, numerals, usdOptions(locale, cents));
}
