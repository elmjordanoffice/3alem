/**
 * A small ICU MessageFormat subset, enough for the candidate copy:
 * `{name}`, `{count, plural, one {…} other {…}}` (with `=N` and `#`) and
 * `{x, select, a {…} other {…}}`. Messages come from the web app's
 * messages/*.json, which next-intl formats the same way.
 */
export type Params = Record<string, string | number | undefined>;

const pluralCache = new Map<string, Intl.PluralRules | null>();
function pluralCategory(locale: string, n: number): string {
  let rules = pluralCache.get(locale);
  if (rules === undefined) {
    try {
      rules = new Intl.PluralRules(locale);
    } catch {
      rules = null;
    }
    pluralCache.set(locale, rules);
  }
  if (rules) return rules.select(n);
  if (locale.startsWith("ar")) {
    const m = n % 100;
    if (n === 0) return "zero";
    if (n === 1) return "one";
    if (n === 2) return "two";
    if (m >= 3 && m <= 10) return "few";
    if (m >= 11 && m <= 99) return "many";
    return "other";
  }
  return n === 1 ? "one" : "other";
}

/** Index of the brace that closes the one at `open`. */
function closing(s: string, open: number): number {
  let depth = 0;
  for (let i = open; i < s.length; i++) {
    if (s[i] === "{") depth++;
    else if (s[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function parseCases(body: string): Map<string, string> {
  const cases = new Map<string, string>();
  let i = 0;
  while (i < body.length) {
    while (i < body.length && /\s/.test(body[i]!)) i++;
    const keyStart = i;
    while (i < body.length && body[i] !== "{" && !/\s/.test(body[i]!)) i++;
    const key = body.slice(keyStart, i);
    while (i < body.length && body[i] !== "{") i++;
    if (i >= body.length) break;
    const end = closing(body, i);
    if (end < 0) break;
    cases.set(key, body.slice(i + 1, end));
    i = end + 1;
  }
  return cases;
}

export function formatMessage(message: string, params: Params, locale: string, formatNumber: (n: number) => string): string {
  let out = "";
  let i = 0;
  while (i < message.length) {
    const ch = message[i]!;
    if (ch !== "{") {
      out += ch;
      i++;
      continue;
    }
    const end = closing(message, i);
    if (end < 0) {
      out += message.slice(i);
      break;
    }
    const inner = message.slice(i + 1, end);
    const firstComma = inner.indexOf(",");
    if (firstComma < 0) {
      const v = params[inner.trim()];
      out += v === undefined ? "" : typeof v === "number" ? formatNumber(v) : v;
    } else {
      const name = inner.slice(0, firstComma).trim();
      const rest = inner.slice(firstComma + 1);
      const secondComma = rest.indexOf(",");
      const type = rest.slice(0, secondComma).trim();
      const cases = parseCases(rest.slice(secondComma + 1));
      const value = params[name];
      let chosen: string | undefined;
      if (type === "plural") {
        const n = typeof value === "number" ? value : Number(value ?? 0);
        chosen = cases.get(`=${n}`) ?? cases.get(pluralCategory(locale, n)) ?? cases.get("other");
        if (chosen !== undefined) chosen = chosen.replace(/#/g, formatNumber(n));
      } else {
        chosen = cases.get(String(value)) ?? cases.get("other");
      }
      out += chosen === undefined ? "" : formatMessage(chosen, params, locale, formatNumber);
    }
    i = end + 1;
  }
  return out;
}
