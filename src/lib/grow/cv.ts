import { ROLE_FAMILIES } from "@/lib/framework/role-families";
import { normalize } from "@/lib/ai/offline/text";
import { domainSignals } from "@/lib/hire/jd-signals";

/**
 * Reading a CV without a model, for Grow only (a person's own development;
 * never used in hiring). It finds what makes practice feel like *their*
 * work: recent job titles, roughly how many years, the industry, whether
 * they have managed people, and which skills the CV already shows or barely
 * mentions. Everything is a best guess the person can see and correct.
 * Pure, so it can be tested and reused.
 */
export interface Career {
  /** Most recent first, at most three. */
  titles: string[];
  years: number | null;
  /** The curated world whose industry the CV matches best (scenes are set there), if any matched. */
  worldId: string | null;
  /** The role family of the recent titles. */
  family: string | null;
  managesPeople: boolean;
  teamSize: number | null;
  /** Skill domains the CV gives clear evidence of (top three). */
  shows: string[];
}

const TITLE_WORDS =
  /\b(manager|lead|leader|head|director|coordinator|supervisor|engineer|developer|analyst|specialist|officer|consultant|associate|executive|designer|planner|administrator|representative|advisor|owner|scientist|accountant|recruiter)\b|(مدير|مديرة|مشرف|مشرفة|منسق|منسقة|مهندس|مهندسة|محلل|محللة|أخصائي|أخصائية|رئيس|رئيسة|قائد|مستشار|مستشارة|مطور|مطورة|مصمم|مصممة|محاسب|محاسبة|ممثل)/i;

const PRESENT = "present|now|current|today|حتى الآن|الآن|حاليا|حاليًا";

/** Years of experience: from date ranges (overlaps merged), or "N years" if that says more. */
export function yearsFrom(text: string, now = new Date()): number | null {
  const thisYear = now.getUTCFullYear();
  const spans: [number, number][] = [];
  const re = new RegExp(`((?:19|20)\\d{2})\\s*(?:-|–|—|to|إلى|حتى)\\s*((?:19|20)\\d{2}|${PRESENT})`, "gi");
  for (const m of text.matchAll(re)) {
    const a = Number(m[1]);
    const b = /\d/.test(m[2]!) ? Number(m[2]) : thisYear;
    if (b >= a && a > 1950 && b <= thisYear + 1) spans.push([a, b]);
  }
  spans.sort((x, y) => x[0] - y[0]);
  let total = 0;
  let cur: [number, number] | null = null;
  for (const s of spans) {
    if (!cur || s[0] > cur[1]) {
      if (cur) total += cur[1] - cur[0];
      cur = [s[0], s[1]];
    } else cur[1] = Math.max(cur[1], s[1]);
  }
  if (cur) total += cur[1] - cur[0];
  const stated = [...text.matchAll(/(\d{1,2})\+?\s*(?:years|yrs|سنوات|سنة|عامًا|عاما|أعوام)/gi)].map((m) => Number(m[1])).filter((n) => n <= 50);
  const best = Math.max(total, ...stated, 0);
  return best > 0 ? Math.min(45, best) : null;
}

/** Job titles: short lines with a title word, in the order they appear (CVs list the latest first). */
export function titlesFrom(text: string): string[] {
  const out: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^[\s•\-–*·]+/, "").trim();
    if (line.length < 4 || line.length > 80 || !TITLE_WORDS.test(line)) continue;
    // Keep the title part: before " at ", "," or "|", and drop dates.
    const title = line
      .split(/\s+(?:at|@|في|لدى)\s+|\s*[|,–—]\s*/)[0]!
      .replace(/((?:19|20)\d{2}).*$/, "")
      .trim();
    if (title.length >= 4 && !out.some((t) => normalize(t) === normalize(title))) out.push(title);
    if (out.length === 3) break;
  }
  return out;
}

export function familyOf(text: string): string | null {
  const t = normalize(text);
  let best: { key: string; hits: number } | null = null;
  for (const f of ROLE_FAMILIES) {
    const hits = f.keywords.reduce((n, k) => n + (t.includes(normalize(k)) ? 1 : 0), 0);
    if (hits > 0 && (!best || hits > best.hits)) best = { key: f.key, hits };
  }
  return best?.key ?? null;
}

export function teamFrom(text: string): { managesPeople: boolean; teamSize: number | null } {
  const sizes = [
    ...text.matchAll(/(?:managed|managing|led|leading|supervised|supervising|team of|direct reports?:?)\s+(?:a\s+)?(?:team\s+of\s+)?(\d{1,3})/gi),
    ...text.matchAll(/(?:فريق(?:ًا|ا)?\s+(?:من|مكون من)|أدرت|قدت|أشرفت على)\s+(\d{1,3})/g),
  ].map((m) => Number(m[1]));
  const words = /\b(managed|line[- ]managed|led a team|team lead|people manager|direct reports|supervised)\b|(أدرت فريق|قيادة فريق|إدارة فريق|أشرفت على فريق)/i.test(text);
  return { managesPeople: words || sizes.length > 0, teamSize: sizes.length ? Math.max(...sizes) : null };
}

export function readCv(text: string, worlds: { id: string; industryKeywords: string[] }[], now = new Date()): Career {
  const clean = text.slice(0, 40_000);
  const titles = titlesFrom(clean);
  const t = normalize(clean);
  let world: { id: string; hits: number } | null = null;
  for (const w of worlds) {
    const hits = w.industryKeywords.filter((k) => t.includes(normalize(k))).length;
    if (hits > 0 && (!world || hits > world.hits)) world = { id: w.id, hits };
  }
  const signals = domainSignals(clean);
  const shows = Object.entries(signals)
    .filter(([, s]) => s.score >= 0.5)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 3)
    .map(([d]) => d);
  return {
    titles,
    years: yearsFrom(clean, now),
    worldId: world?.id ?? null,
    family: familyOf(titles.join(" ")) ?? familyOf(clean),
    ...teamFrom(clean),
    shows,
  };
}

/** The role someone is aiming for, from their goal ("Become a team lead within a year" → "Team lead"). */
export function targetTitle(goal: string, fallback: string): string {
  // The role named last is the one aimed for ("from engineer to team lead"); drop the verbs around it.
  const matches = [...goal.matchAll(/\b((?:[a-z]+\s+){0,2}(?:manager|lead|leader|head(?:\s+of\s+[a-z]+)?|director|engineer|analyst|designer|consultant|specialist|coordinator|supervisor|owner))\b/gi)];
  const last = matches.at(-1)?.[1];
  if (last) {
    const STOP = /^(?:a|an|the|be|become|becoming|to|into|as|move|moving|from|get|promoted|step|up|my|our|role|of)$/i;
    const words = last.trim().split(/\s+/);
    while (words.length > 1 && STOP.test(words[0]!)) words.shift();
    const s = words.join(" ");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  const ar = goal.match(/((?:مدير|مديرة|قائد|قائدة|رئيس|رئيسة|مشرف|مشرفة)(?:\s+[؀-ۿ]+){0,2})/);
  if (!ar) return fallback;
  // Drop trailing time words ("خلال سنتين", "بحلول 2028").
  const words = ar[1]!.trim().split(/\s+/);
  while (words.length > 1 && /^(خلال|في|بحلول|قبل|بعد|عند|مع|من)$/.test(words.at(-1)!)) words.pop();
  return words.join(" ");
}
