/** Text helpers shared by the offline (no-model) components. */

/** Lower-case, strip Arabic diacritics and tatweel, normalise alef/yeh/teh forms. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه");
}

/** Split into sentences, keeping the original text so quotes stay verbatim. */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?؟。\n])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function containsAny(haystack: string, needles: string[]): string | null {
  const h = normalize(haystack);
  for (const n of needles) {
    const k = normalize(n).trim();
    if (k.length >= 2 && h.includes(k)) return n;
  }
  return null;
}

/** First sentence of `text` that contains any keyword, verbatim. */
export function sentenceWith(text: string, keywords: string[]): string | null {
  for (const s of sentences(text)) if (containsAny(s, keywords)) return s.length > 280 ? s.slice(0, 280) : s;
  return null;
}

export function isArabic(text: string): boolean {
  const ar = (text.match(/[؀-ۿ]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  return ar > latin;
}
