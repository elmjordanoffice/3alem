import "server-only";
import { DOMAINS } from "@/lib/framework/data";
import { ROLE_FAMILIES, type RoleFamilyDef } from "@/lib/framework/role-families";
import { WORLDS } from "@/lib/itembank";
import { jdAnalyst, type JdAnalysis } from "@/lib/ai/prompts/jd-analyst";
import { runAgent, getProvider, type AgentContext } from "@/lib/ai/run";
import { isArabic, normalize } from "@/lib/ai/offline/text";

export interface TechnicalSkillDef {
  key: string;
  name: string;
  description: string;
  anchors: string[];
  importance: "MUST_HAVE" | "NICE_TO_HAVE" | "BASELINE";
}

export interface TemplateAnalysis {
  roleTitle: string;
  summary: string;
  seniority: JdAnalysis["seniority"];
  roleFamily: string;
  industry: string;
  industryKeywords: string[];
  domainWeights: { domain: string; weight: number; importance: "MUST_HAVE" | "NICE_TO_HAVE" | "BASELINE"; rationale: string }[];
  flags: JdAnalysis["flags"];
  language: "en" | "ar";
  /** How it was produced. */
  source: "anthropic" | "offline";
  promptVersion: string;
}

/** Discriminatory or irrelevant requirement patterns. Always applied, even after the model. */
const FLAG_RULES: { category: JdAnalysis["flags"][number]["category"]; pattern: RegExp; en: string; ar: string; suggestion: { en: string; ar: string } }[] = [
  {
    category: "age",
    pattern: /\b(under|below|over|above|aged?)\s*\d{2}\b|\byoung\b|\byouthful\b|\brecent graduates? only\b|\b(age|ages)\s*\d{2}\s*[-–]\s*\d{2}\b|لا يتجاوز عمره|لا يزيد عمره|عمر\s*\d{2}|(^|\s)(شاب|شابة)(\s|$)/i,
    en: "Age limits or age-coded words exclude candidates for reasons unrelated to the work.",
    ar: "حدود العمر أو الكلمات التي تلمح إلى العمر تستبعد مرشحين لأسباب لا علاقة لها بالعمل.",
    suggestion: { en: "Describe the experience or skills needed instead.", ar: "صف الخبرة أو المهارات المطلوبة بدلاً من ذلك." },
  },
  {
    category: "gender",
    pattern: /\b(male|female|men|women)\s+(only|preferred|candidates only)\b|\b(only|preferably)\s+(male|female|men|women)\b|ذكور فقط|إناث فقط|يفضل (ذكر|أنثى)|للذكور فقط|للإناث فقط/i,
    en: "Specifying gender is discriminatory unless it is a genuine occupational requirement.",
    ar: "تحديد الجنس تمييزي ما لم يكن متطلباً مهنياً حقيقياً.",
    suggestion: { en: "Use gender-neutral wording.", ar: "استخدم صياغة محايدة من حيث الجنس." },
  },
  {
    category: "nationality",
    pattern: /\b(nationals? only|citizens? only|nationality|native[- ]born|locals? only)\b|من الجنسية|مواطنين فقط|الجنسية/i,
    en: "Nationality requirements are usually discriminatory; right-to-work is the job-relevant question.",
    ar: "اشتراط الجنسية تمييزي في الغالب؛ السؤال المرتبط بالعمل هو أهلية العمل القانونية.",
    suggestion: { en: "Ask for the legal right to work in the location, if needed.", ar: "اطلب أهلية العمل القانونية في الموقع إن لزم." },
  },
  {
    category: "irrelevant_requirement",
    pattern: /\bnative (english|arabic|french|speaker)\b|\bmother tongue\b|لغته الأم|متحدث أصلي/i,
    en: "\"Native speaker\" excludes fluent candidates; fluency is what the work needs.",
    ar: "عبارة \"متحدث أصلي\" تستبعد المرشحين المتمكنين من اللغة؛ ما يحتاجه العمل هو الإتقان.",
    suggestion: { en: "Ask for the level of fluency the role needs, e.g. \"professional fluency in English\".", ar: "اطلب مستوى الإتقان الذي يحتاجه الدور، مثل \"إتقان مهني للغة الإنجليزية\"." },
  },
  {
    category: "appearance",
    pattern: /\b(attractive|good[- ]looking|pleasant appearance|photo required|height requirement)\b|حسن المظهر|إرفاق صورة شخصية/i,
    en: "Appearance requirements are not job-relevant and invite bias.",
    ar: "اشتراطات المظهر لا علاقة لها بالعمل وتفتح الباب للتحيز.",
    suggestion: { en: "Remove it, or name a genuine safety or dress-code requirement.", ar: "احذفه، أو اذكر متطلباً حقيقياً للسلامة أو للزي." },
  },
  {
    category: "marital_or_family_status",
    pattern: /\b(must be|should be|preferably)\s+(single|married|unmarried)\b|\b(no|without) children\b|يشترط أن يكون (أعزب|متزوج)|بدون أطفال/i,
    en: "Marital or family status is not job-relevant.",
    ar: "الحالة الاجتماعية أو العائلية لا علاقة لها بالعمل.",
    suggestion: { en: "Describe availability or travel needs directly, if real.", ar: "صف متطلبات التفرغ أو السفر مباشرة إن كانت حقيقية." },
  },
  {
    category: "religion",
    pattern: /\b(must be|only|preferably)\s+(a\s+)?(christian|muslim|jewish|hindu|religious)\b|يشترط أن يكون (مسلم|مسيحي)|(مسلمين|مسيحيين) فقط/i,
    en: "Religion is not job-relevant.",
    ar: "الدين لا علاقة له بالعمل.",
    suggestion: { en: "Remove it.", ar: "احذفه." },
  },
  {
    category: "disability_or_health",
    pattern: /\b(healthy|physically fit|no disabilit(y|ies)|perfect health)\b|سليم البنية|خالٍ من الإعاقة|لائق صحياً/i,
    en: "Health or disability requirements must relate to essential duties and allow reasonable adjustments.",
    ar: "يجب أن ترتبط المتطلبات الصحية بمهام أساسية وأن تسمح بالتسهيلات المعقولة.",
    suggestion: { en: "Describe the essential physical tasks, if any.", ar: "صف المهام البدنية الأساسية إن وجدت." },
  },
];

export function ruleFlags(jd: string, lang: "en" | "ar"): JdAnalysis["flags"] {
  const out: JdAnalysis["flags"] = [];
  for (const rule of FLAG_RULES) {
    const m = jd.match(rule.pattern);
    if (!m) continue;
    const at = m.index ?? 0;
    const start = Math.max(0, jd.lastIndexOf("\n", at) + 1);
    const endNl = jd.indexOf("\n", at);
    const quote = jd.slice(start, endNl === -1 ? undefined : endNl).trim().slice(0, 200);
    out.push({ quote, category: rule.category, explanation: rule[lang], suggestion: rule.suggestion[lang] });
  }
  return out;
}

function detectFamily(text: string): RoleFamilyDef {
  const t = normalize(text);
  let best: { f: RoleFamilyDef; hits: number } | null = null;
  for (const f of ROLE_FAMILIES) {
    const hits = f.keywords.reduce((n, k) => n + (t.includes(normalize(k)) ? 1 : 0), 0);
    if (!best || hits > best.hits) best = { f, hits };
  }
  return best && best.hits > 0 ? best.f : (ROLE_FAMILIES.find((f) => f.key === "general-management") ?? ROLE_FAMILIES[0]!);
}

function detectSeniority(text: string): JdAnalysis["seniority"] {
  const t = text.toLowerCase();
  if (/\b(chief|vp|vice president|head of|director)\b|رئيس تنفيذي|نائب الرئيس|مدير عام/.test(t)) return "executive";
  if (/\b(lead|principal|staff|manager)\b|قائد|رئيس فريق/.test(t)) return "lead";
  if (/\b(senior|sr\.?)\b|أول|خبرة لا تقل عن [5-9]/.test(t)) return "senior";
  if (/\b(junior|graduate|entry|intern|trainee)\b|مبتدئ|حديث التخرج|متدرب/.test(t)) return "entry";
  const years = /(\d{1,2})\s*\+?\s*(years|yrs|سنوات|سنة)/i.exec(text);
  if (years) {
    const y = Number(years[1]);
    if (y >= 8) return "senior";
    if (y <= 1) return "entry";
  }
  return "mid";
}

function detectIndustry(text: string): { industry: string; keywords: string[] } {
  const t = normalize(text);
  let best: { name: string; hits: number; keywords: string[] } | null = null;
  for (const w of WORLDS) {
    const hits = w.industryKeywords.filter((k) => t.includes(normalize(k)));
    if (!best || hits.length > best.hits) best = { name: w.en.industry, hits: hits.length, keywords: hits };
  }
  return best && best.hits > 0 ? { industry: best.name, keywords: best.keywords } : { industry: "General business", keywords: [] };
}

/** Deterministic analysis, used without a model and as a guard with one. */
export function offlineAnalysis(jd: string): { analysis: TemplateAnalysis; technicalSkills: TechnicalSkillDef[] } {
  const lang = isArabic(jd) ? "ar" : "en";
  const family = detectFamily(jd);
  const seniority = detectSeniority(jd);
  const { industry, keywords } = detectIndustry(jd);
  const firstLine = jd.split("\n").map((l) => l.trim()).find((l) => l.length > 2 && l.length < 90) ?? family.name[lang];
  const ranked = Object.entries(family.domainWeights).sort((a, b) => b[1] - a[1]);
  const mustHave = new Set(ranked.filter(([, w]) => w >= 0.7).slice(0, 3).map(([d]) => d));
  const domainWeights = DOMAINS.map((d) => {
    const weight = family.domainWeights[d.key] ?? 0.3;
    const importance = mustHave.has(d.key) ? "MUST_HAVE" : weight >= 0.45 ? "NICE_TO_HAVE" : "BASELINE";
    return {
      domain: d.key,
      weight,
      importance: importance as "MUST_HAVE" | "NICE_TO_HAVE" | "BASELINE",
      rationale: lang === "ar" ? `وزن معتاد لأدوار ${family.name.ar}.` : `Typical weight for ${family.name.en} roles.`,
    };
  });
  const technicalSkills: TechnicalSkillDef[] = family.technicalSkills.map((s, i) => ({
    key: s.key,
    name: s.name[lang],
    description: s.description[lang],
    anchors: [1, 2, 3, 4, 5].map((l) => s.anchors[l as 1][lang]),
    importance: i < 2 ? "MUST_HAVE" : "NICE_TO_HAVE",
  }));
  const seniorityWord = { entry: { en: "an entry-level", ar: "مبتدئ" }, mid: { en: "a mid-level", ar: "متوسط الخبرة" }, senior: { en: "a senior", ar: "أول" }, lead: { en: "a lead", ar: "قيادي" }, executive: { en: "an executive", ar: "تنفيذي" } }[seniority];
  return {
    analysis: {
      roleTitle: firstLine.replace(/^#+\s*/, ""),
      summary:
        lang === "ar"
          ? `دور ${seniorityWord.ar} في مجال ${family.name.ar}. حُدّدت المهارات التقنية من قالب هذه العائلة الوظيفية؛ راجعها وعدّلها قبل النشر.`
          : `${seniorityWord.en[0]!.toUpperCase()}${seniorityWord.en.slice(1)} ${family.name.en} role. Technical sub-skills come from this role family's template; review and edit them before publishing.`,
      seniority,
      roleFamily: family.key,
      industry,
      industryKeywords: keywords,
      domainWeights,
      flags: ruleFlags(jd, lang),
      language: lang,
      source: "offline",
      promptVersion: "jd-offline.v1",
    },
    technicalSkills,
  };
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "skill";
}

/** Analyse a job description with Claude, falling back to the offline analysis. */
export async function analyzeJobDescription(jd: string, ctx: AgentContext): Promise<{ analysis: TemplateAnalysis; technicalSkills: TechnicalSkillDef[] }> {
  const offline = offlineAnalysis(jd);
  if (!getProvider()) return offline;
  try {
    const { output } = await runAgent(
      jdAnalyst,
      { jobDescription: jd, roleFamilies: ROLE_FAMILIES.map((f) => ({ key: f.key, name: f.name.en })) },
      ctx,
    );
    const family = ROLE_FAMILIES.find((f) => f.key === output.roleFamily)?.key ?? offline.analysis.roleFamily;
    const short = family.split("-")[0];
    // Rule-based flags are merged in: a model miss must not hide a discriminatory requirement.
    const flags = [...output.flags];
    for (const f of offline.analysis.flags) if (!flags.some((x) => x.category === f.category)) flags.push(f);
    return {
      analysis: {
        roleTitle: output.roleTitle,
        summary: output.summary,
        seniority: output.seniority,
        roleFamily: family,
        industry: output.industry,
        industryKeywords: output.industryKeywords,
        domainWeights: DOMAINS.map((d) => output.domainWeights.find((w) => w.domain === d.key) ?? offline.analysis.domainWeights.find((w) => w.domain === d.key)!),
        flags,
        language: output.jobDescriptionLanguage,
        source: "anthropic",
        promptVersion: jdAnalyst.version,
      },
      technicalSkills: output.technicalSkills.map((s) => ({
        key: `technical.${short}.${slug(s.slug || s.name)}`,
        name: s.name,
        description: s.description,
        anchors: s.anchors,
        importance: s.importance,
      })),
    };
  } catch (e) {
    console.warn("[jd] model analysis failed, using offline analysis", e);
    return offline;
  }
}
