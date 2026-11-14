import type { AppLocale } from "@/i18n/config";

/** Read a { en, ar } JSON value in the current locale, falling back to English. */
export function localized(value: unknown, locale: AppLocale): string {
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>;
    const text = v[locale] ?? v.en;
    if (typeof text === "string") return text;
  }
  return typeof value === "string" ? value : "";
}
