import { ROLE_FAMILIES, type RoleFamilyDef } from "@/lib/framework/role-families";
import { normalize } from "@/lib/ai/offline/text";

/**
 * Reading a job description without a model. Two parts:
 *
 * 1. The role family: keyword hits, with the title weighted three times and
 *    longer phrases worth more than single words ("customer success" beats
 *    "operations"), ties broken by the title.
 * 2. What this description actually asks for: phrases that signal each skill
 *    domain, in English and Arabic. Domain weights blend the family's typical
 *    profile with these signals, and each weight can say which words moved it.
 */

/** Phrases that signal each domain. Lower case; matched on normalised text. */
export const DOMAIN_SIGNALS: Record<string, string[]> = {
  communication: ["communicat", "writing", "written", "write clearly", "clear writing", "present", "listening", "listen", "persuad", "negotiat", "storytell", "explain", "تواصل", "كتابة", "عرض", "إقناع", "تفاوض", "إصغاء", "الاستماع"],
  collaboration: ["stakeholder", "relationship", "cross-functional", "collaborat", "partner with", "work with", "team player", "empathy", "client", "customer", "أصحاب المصلحة", "علاقات", "تعاون", "شراكة", "العملاء", "العميل"],
  leadership: ["lead a team", "leading a team", "mentor", "coach", "inspire", "ownership", "own the", "owning", "set direction", "vision", "courage", "قيادة", "توجيه", "إرشاد", "تدريب الفريق", "مسؤولية"],
  management: ["plan", "prioriti", "budget", "deadline", "deliver", "resource", "schedule", "follow through", "follow-through", "kpi", "service level", "تخطيط", "أولويات", "ميزانية", "مواعيد", "متابعة", "موارد"],
  "critical-thinking": ["data", "analy", "root cause", "problem solving", "problem-solving", "evidence", "dashboard", "metric", "insight", "anomal", "بيانات", "تحليل", "السبب الجذري", "حل المشكلات", "مؤشرات"],
  judgment: ["judgment", "judgement", "decision", "decide", "risk", "under pressure", "trade-off", "tradeoff", "ethic", "integrity", "escalat", "حكم", "قرار", "مخاطر", "تحت الضغط", "نزاهة", "تصعيد"],
  adaptability: ["fast-paced", "fast paced", "ambigu", "change", "learn quickly", "adapt", "agile", "new information", "flexib", "متغيرة", "غموض", "تكيف", "التعلم بسرعة", "مرونة"],
  "product-thinking": ["product", "user", "customer needs", "roadmap", "feature", "experiment", "discovery", "prototype", "المنتج", "المستخدم", "خارطة الطريق", "تجربة المستخدم"],
  technical: ["technical", "tools", "systems", "sql", "python", "excel", "certif", "years in", "experience in", "تقني", "أنظمة", "أدوات", "شهادة"],
};

function count(text: string, phrase: string): number {
  const p = normalize(phrase);
  if (!p) return 0;
  let n = 0;
  let i = text.indexOf(p);
  while (i !== -1) {
    n++;
    i = text.indexOf(p, i + p.length);
  }
  return n;
}

export function titleOf(jd: string): string {
  return jd.split("\n").map((l) => l.trim()).find((l) => l.length > 2 && l.length < 90) ?? "";
}

/** The role family a description most resembles. */
export function detectFamily(jd: string): RoleFamilyDef {
  const title = normalize(titleOf(jd));
  const body = normalize(jd);
  let best: { f: RoleFamilyDef; score: number; titleHits: number } | null = null;
  for (const f of ROLE_FAMILIES) {
    let score = 0;
    let titleHits = 0;
    for (const k of f.keywords) {
      const words = k.trim().split(/\s+/).length;
      const inBody = count(body, k);
      const inTitle = count(title, k);
      titleHits += inTitle;
      // Longer phrases are more specific; the title says what the job is.
      score += (inBody + inTitle * 2) * (1 + (words - 1) * 0.75);
    }
    if (!best || score > best.score || (score === best.score && titleHits > best.titleHits)) best = { f, score, titleHits };
  }
  return best && best.score > 0 ? best.f : (ROLE_FAMILIES.find((f) => f.key === "general-management") ?? ROLE_FAMILIES[0]!);
}

/** Signal strength per domain (0–1) and the phrases found, from the description itself. */
export function domainSignals(jd: string): Record<string, { score: number; found: string[] }> {
  const body = normalize(jd);
  const raw: Record<string, { hits: number; found: string[] }> = {};
  for (const [domain, phrases] of Object.entries(DOMAIN_SIGNALS)) {
    let hits = 0;
    const found: string[] = [];
    for (const p of phrases) {
      const c = count(body, p);
      if (c) {
        hits += c;
        if (found.length < 3) found.push(p.replace(/[^\p{L}\p{N}\s-]/gu, ""));
      }
    }
    raw[domain] = { hits, found };
  }
  const max = Math.max(1, ...Object.values(raw).map((r) => r.hits));
  return Object.fromEntries(Object.entries(raw).map(([d, r]) => [d, { score: r.hits / max, found: r.found }]));
}

/**
 * Domain weights for a description: the family's typical profile, moved by
 * what the text asks for. Must-haves are the three strongest that clear 0.7.
 */
export function blendedWeights(jd: string, family: RoleFamilyDef) {
  const signals = domainSignals(jd);
  const out = Object.keys(family.domainWeights).map((domain) => {
    const base = family.domainWeights[domain] ?? 0.3;
    const s = signals[domain] ?? { score: 0, found: [] };
    const weight = Math.round(Math.min(1, base * 0.55 + s.score * 0.55 + (s.score > 0 ? 0.05 : 0)) * 100) / 100;
    return { domain, weight, base, found: s.found };
  });
  const must = new Set(
    [...out]
      .filter((d) => d.weight >= 0.7)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
      .map((d) => d.domain),
  );
  return out.map((d) => ({ ...d, mustHave: must.has(d.domain) }));
}
