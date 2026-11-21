/** Text helpers shared by the offline (no-model) components. */

/** Lower-case, strip Arabic diacritics and tatweel, normalise alef/yeh/teh forms. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "")
    .replace(/[إأآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[’‘]/g, "'");
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

const ARABIC = /[؀-ۿ]/;
/** Arabic clitics that attach to the front of a word: و ف, then ب ك ل س, then ال (or the ل of لل). */
const AR_PREFIX = "(?:[وف])?(?:[بكلس])?(?:ال|ل)?";
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const patterns = new Map<string, RegExp>();

/**
 * A keyword matches at the start of a word (so "test" does not match
 * "latest", and the Arabic "حد" does not match "واحدة"), with any suffix, and
 * in Arabic after the usual attached prefixes ("للعميل" matches "العميل").
 */
function patternFor(keyword: string): RegExp | null {
  const k = normalize(keyword).trim();
  if (k.length < 2) return null;
  let re = patterns.get(k);
  if (!re) {
    const ws = (s: string) => escape(s).replace(/\s+/g, "\\s+");
    // "العميل" also appears as "للعميل", "بالعميل", "والعميل".
    const head = !ARABIC.test(k[0]!) ? ws(k) : k.startsWith("ال") ? `(?:[وف])?(?:[بك]?ال|لل)${ws(k.slice(2))}` : `${AR_PREFIX}${ws(k)}`;
    re = new RegExp(`(?:^|[^\\p{L}\\p{N}])${head}`, "u");
    patterns.set(k, re);
  }
  return re;
}

const NEGATORS_EN = /\b(not|no|never|don't|dont|won't|wont|wouldn't|shouldn't|isn't|can't|cannot|without|avoid|rather than|instead of|neither|nor)\s*$/;
const NEGATORS_AR = /(^|\s)(لا|لن|لم|ليس|ليست|لست|دون|بدون|بدلا من|عدم|ولا|ولن|ولم)\s*$/;

/** True when the words just before position `at` negate what follows ("I won't blame…", "لن ألوم…"). */
function negatedAt(h: string, at: number): boolean {
  const before = h.slice(Math.max(0, at - 40), at);
  const tail = before.split(/\s+/).slice(-4).join(" ");
  return NEGATORS_EN.test(tail) || NEGATORS_AR.test(tail);
}

/** Position of the first match of `keyword` in normalised text, or -1. */
function findIn(h: string, keyword: string, opts: { allowNegated: boolean }): number {
  const re = patternFor(keyword);
  if (!re) return -1;
  const g = new RegExp(re.source, "gu");
  for (const m of h.matchAll(g)) {
    const at = /^[^\p{L}\p{N}]/u.test(m[0]) ? m.index! + 1 : m.index!;
    if (opts.allowNegated || !negatedAt(h, at)) return at;
  }
  return -1;
}

/** The first keyword found in `haystack` (word-start match), or null. */
export function containsAny(haystack: string, needles: string[]): string | null {
  const h = normalize(haystack);
  for (const n of needles) if (findIn(h, n, { allowNegated: true }) >= 0) return n;
  return null;
}

/**
 * Like containsAny, but ignores a keyword the writer negates: "I won't blame
 * the supplier" is not a hit for "blame the supplier".
 */
export function affirms(haystack: string, needles: string[]): string | null {
  const h = normalize(haystack);
  for (const n of needles) if (findIn(h, n, { allowNegated: false }) >= 0) return n;
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
