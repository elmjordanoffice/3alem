import type { AppLocale, NumeralSystem } from "@/i18n/config";

/**
 * Number formatting with a configurable numeral system. Arabic UI can show
 * Latin digits (0-9, the default) or Arabic-Indic digits (٠-٩). See D-007.
 */
export function intlLocale(locale: AppLocale, numerals: NumeralSystem): string {
  return `${locale}-u-nu-${numerals}`;
}

export function formatNumber(
  value: number,
  locale: AppLocale,
  numerals: NumeralSystem,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(intlLocale(locale, numerals), options).format(value);
}

/** One decimal place, as used for levels: 3.8 */
export function formatLevel(value: number, locale: AppLocale, numerals: NumeralSystem): string {
  return formatNumber(value, locale, numerals, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** "3.8–4.3" — a level range, using an en dash. */
export function formatRange(low: number, high: number, locale: AppLocale, numerals: NumeralSystem): string {
  return `${formatLevel(low, locale, numerals)}–${formatLevel(high, locale, numerals)}`;
}

/** mm:ss for timers. */
export function formatDuration(totalSeconds: number, locale: AppLocale, numerals: NumeralSystem): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = formatNumber(Math.floor(s / 60), locale, numerals, { minimumIntegerDigits: 2 });
  const ss = formatNumber(s % 60, locale, numerals, { minimumIntegerDigits: 2 });
  return `${mm}:${ss}`;
}
