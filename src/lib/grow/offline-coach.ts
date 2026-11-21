import { containsAny } from "@/lib/ai/offline/text";
import { DOMAIN_HABITS } from "@/lib/ai/offline/signals";
import { DOMAINS } from "@/lib/framework/data";
import type { ReportContent } from "@/lib/hire/report-types";
import type { CoachReply } from "@/lib/ai/prompts/coach";
import { TIPS } from "./coaching";
import { nextStep, type PracticeRecord } from "./next-step";

/**
 * The coach without a language model. It answers from what it actually knows
 * about the person: their latest report (strengths, areas, plan, quotes),
 * their practice history (what moved, what's due), and how they rated
 * themselves at the start. It recognises a handful of questions (the week,
 * progress, blind spots, interviews, a specific situation, what's next, why
 * an area is low) and says so plainly when it can't be specific.
 */
export interface CoachContext {
  text: string;
  report: ReportContent | null;
  locale: "en" | "ar";
  hours: number;
  selfView: Record<string, number>;
  practice: PracticeRecord[];
  now?: Date;
}

const TOPICS: { domain: string; words: string[] }[] = [
  { domain: "collaboration", words: ["conflict", "disagree", "stakeholder", "colleague", "relationship", "difficult person", "خلاف", "صراع", "زميل", "زملاء", "اصحاب المصلحه", "علاقه"] },
  { domain: "communication", words: ["present", "presentation", "speak", "email", "explain", "write", "pitch", "عرض", "تقديم", "كتابه", "شرح", "رساله", "تواصل"] },
  { domain: "leadership", words: ["lead", "delegate", "motivate", "give feedback", "my team", "manage people", "قياده", "تفويض", "تحفيز", "فريقي", "ملاحظات"] },
  { domain: "management", words: ["priorit", "deadline", "overwhelm", "too much", "busy", "organis", "organiz", "اولويات", "مواعيد", "ضغط العمل", "تنظيم", "مشغول"] },
  { domain: "judgment", words: ["decide", "decision", "risk", "choose", "dilemma", "قرار", "اقرر", "مخاطر", "اختار", "معضله"] },
  { domain: "critical-thinking", words: ["data", "analys", "analyz", "numbers", "root cause", "problem", "بيانات", "تحليل", "ارقام", "مشكله"] },
  { domain: "adaptability", words: ["change", "new role", "ambigu", "uncertain", "تغيير", "دور جديد", "غموض"] },
  { domain: "product-thinking", words: ["product", "user", "customer", "feature", "منتج", "مستخدم", "عميل", "ميزه"] },
];

const domainOf = (key: string) => key.split(".")[0] ?? key;

function domainName(key: string, locale: "en" | "ar"): string {
  return DOMAINS.find((d) => d.key === key)?.name[locale] ?? key;
}

function skillName(key: string, locale: "en" | "ar"): string {
  for (const d of DOMAINS) {
    const s = d.subSkills.find((x) => x.key === key);
    if (s) return s.name[locale];
  }
  return domainName(key, locale);
}

const low = (s: string, locale: "en" | "ar") => (locale === "en" ? s.charAt(0).toLowerCase() + s.slice(1) : s);
const list = (items: string[], locale: "en" | "ar") => new Intl.ListFormat(locale, { type: "conjunction" }).format(items);

function quote(report: ReportContent, ids: string[]): string | null {
  const ev = ids.map((id) => report.evidence[id]).find((e) => e?.quote?.trim());
  if (!ev) return null;
  const q = ev.quote.trim().replace(/\s+/g, " ").replace(/[.。]$/, "");
  return q.length > 160 ? `${q.slice(0, 157).trimEnd()}…` : q;
}

/** Practice results per skill, oldest first. */
function practiceBySkill(practice: PracticeRecord[]) {
  const by = new Map<string, { at: Date; level: number }[]>();
  for (const p of practice) {
    if (!p.completedAt) continue;
    for (const s of p.scores) by.set(s.competencyKey, [...(by.get(s.competencyKey) ?? []), { at: p.completedAt, level: s.level }]);
  }
  for (const v of by.values()) v.sort((a, b) => a.at.getTime() - b.at.getTime());
  return by;
}

/** Where the person's own rating and the evidence differ by a level or more. */
export function selfViewGaps(selfView: Record<string, number>, report: ReportContent) {
  const rows = report.domains
    .filter((d) => typeof selfView[d.key] === "number")
    .map((d) => ({ key: d.key, self: selfView[d.key]!, estimate: d.estimate, diff: selfView[d.key]! - d.estimate }));
  const blind = rows.filter((r) => r.diff >= 1).sort((a, b) => b.diff - a.diff)[0] ?? null;
  const hidden = rows.filter((r) => r.diff <= -1).sort((a, b) => a.diff - b.diff)[0] ?? null;
  return { blind, hidden };
}

export function offlineCoach(c: CoachContext): CoachReply {
  const { text, report, locale, hours } = c;
  const ar = locale === "ar";
  const now = c.now ?? new Date();
  if (!report) {
    return {
      reply: ar
        ? "لا أملك تقييمًا لك بعد، لذلك لا أستطيع أن أكون دقيقًا. ابدأ بالتقييم المرجعي (30 دقيقة)، ثم نبني خطتك على أدلة حقيقية من إجاباتك."
        : "I don't have an assessment for you yet, so I can't be specific. Start with the 30-minute baseline; then we'll build your plan on real evidence from your own answers.",
      suggestedSkills: [],
    };
  }
  const plan = report.narrative.plan ?? [];
  const focus = plan.map((p) => p.skillKey);
  const next = nextStep(focus, c.practice, now);
  const by = practiceBySkill(c.practice);

  // Interviews and promotions: lead with strengths, in their own words.
  if (containsAny(text, ["interview", "cv", "resume", "promotion", "appraisal", "مقابله", "سيره", "ترقيه", "تقييم الاداء"])) {
    const strengths = report.narrative.strengths.slice(0, 2);
    const area = report.narrative.developmentAreas[0];
    if (!strengths.length) {
      return { reply: ar ? "لا تظهر في تقييمك نقاط قوة واضحة بأدلة كافية بعد. التدريب على مهارة واحدة من خطتك سيعطيك قصة تحكيها." : "Your assessment doesn't show a clear strength with enough evidence yet. Practising one skill from your plan will give you a story to tell.", suggestedSkills: focus.slice(0, 1) };
    }
    const lines = strengths.map((s) => {
      const q = quote(report, s.evidenceIds);
      return ar ? `${s.headline}${q ? `، كما في قولك: «${q}»` : ""}` : `${low(s.headline, "en")}${q ? `, as when you wrote: “${q}”` : ""}`;
    });
    return {
      reply: ar
        ? `ابدأ بما تُظهره الأدلة: ${lines.join("؛ و")}. حوّل كل واحدة إلى قصة قصيرة: الموقف، ما فعلته أنت، والنتيجة. وجهّز إجابة صادقة عن ${area ? skillName(area.skillKey, "ar") : "ما تعمل على تحسينه"}، مع ما تفعله لتحسينه.`
        : `Lead with what the evidence shows: ${lines.join("; and ")}. Turn each into a short story: the situation, what you did, the result. And prepare an honest answer about ${area ? low(skillName(area.skillKey, "en"), "en") : "what you're working on"}, with what you're doing about it.`,
      suggestedSkills: strengths.map((s) => s.skillKey).slice(0, 2),
    };
  }

  // Progress: what moved, from practice results.
  if (containsAny(text, ["progress", "improv", "better", "how am i doing", "getting anywhere", "تقدم", "تحسن", "افضل", "كيف حالي"])) {
    const moved = [...by.entries()].filter(([, v]) => v.length >= 2).map(([k, v]) => ({ k, from: v[0]!.level, to: v.at(-1)!.level })).sort((a, b) => b.to - b.from - (a.to - a.from));
    const recent = c.practice.filter((p) => p.completedAt && now.getTime() - p.completedAt.getTime() < 14 * 86_400_000).length;
    if (!by.size) {
      return {
        reply: ar
          ? "لم تُكمل أي جلسة تدريب بعد، فلا أستطيع قياس التقدم. جلسة واحدة اليوم تكفي لنبدأ، وسأقارن بها ما يأتي بعدها."
          : "You haven't finished a practice session yet, so there's nothing to measure. One session today is enough to start; I'll compare what comes after against it.",
        suggestedSkills: next ? [next.skillKey] : focus.slice(0, 1),
      };
    }
    const best = moved[0];
    const line =
      best && best.to > best.from
        ? ar
          ? `أوضح تحسّن: ${skillName(best.k, "ar")}، من المستوى ${best.from} إلى ${best.to} في التدريب.`
          : `Clearest movement: ${low(skillName(best.k, "en"), "en")}, from level ${best.from} to ${best.to} in practice.`
        : ar
          ? "لم يتغيّر مستوى أي مهارة بعد بين محاولة وأخرى، وهذا طبيعي في البداية: التغيير يظهر بعد ثلاث أو أربع جلسات على المهارة نفسها."
          : "No skill has moved between attempts yet, which is normal early on: change tends to show after three or four sessions on the same skill.";
    return {
      reply: ar
        ? `أكملت ${recent} ${recent === 1 ? "جلسة" : "جلسات"} في آخر أسبوعين. ${line} تذكّر أن مستويات تقريرك لا تتغيّر إلا بإعادة التقييم؛ التدريب هو ما يحرّكها.`
        : `You've finished ${recent} ${recent === 1 ? "session" : "sessions"} in the last two weeks. ${line} Your report's levels only change when you re-assess; practice is what moves them.`,
      suggestedSkills: best ? [best.k] : focus.slice(0, 1),
    };
  }

  // Blind spots: their own rating against the evidence.
  if (containsAny(text, ["blind spot", "self", "rated myself", "surpris", "see me", "perceive", "نقاط عمياء", "نفسي", "فاجا", "يرونني"])) {
    const { blind, hidden } = selfViewGaps(c.selfView, report);
    const parts: string[] = [];
    if (blind) parts.push(ar ? `قيّمت نفسك في ${domainName(blind.key, "ar")} أعلى مما وجدته الأدلة (${blind.self} مقابل نحو ${blind.estimate.toFixed(1)}). هذا ما يستحق أن تختبره: اطلب من زميل أن يراقبك في موقف حقيقي.` : `You rated yourself higher in ${low(domainName(blind.key, "en"), "en")} than the evidence found (${blind.self} against about ${blind.estimate.toFixed(1)}). That's the one to test: ask a colleague to watch for it in a real situation.`);
    if (hidden) parts.push(ar ? `وفي ${domainName(hidden.key, "ar")} أنت أقوى مما تظن (${hidden.self} مقابل نحو ${hidden.estimate.toFixed(1)}). استخدمها عمدًا.` : `And in ${low(domainName(hidden.key, "en"), "en")} you're stronger than you think (${hidden.self} against about ${hidden.estimate.toFixed(1)}). Use it on purpose.`);
    return {
      reply: parts.length
        ? parts.join(" ")
        : ar
          ? "تقييمك لنفسك قريب مما وجدته الأدلة في كل المجالات، ضمن مستوى واحد. هذه معرفة ذاتية جيدة."
          : "Your own rating is close to what the evidence found everywhere, within a level. That's good self-knowledge.",
      suggestedSkills: blind ? focus.filter((k) => domainOf(k) === blind.key).slice(0, 1) : [],
    };
  }

  // The week: sessions that fit the hours, in today's order.
  if (containsAny(text, ["this week", "my week", "per week", "plan my", "my plan", "schedule", "hours", "هذا الاسبوع", "اسبوعي", "خطه", "جدول", "ساعات"])) {
    const per = Math.max(1, Math.floor((hours * 60) / 25));
    const first = next?.skillKey ?? focus[0] ?? "";
    const second = focus.find((k) => k !== first) ?? first;
    return {
      reply: ar
        ? `لديك نحو ${hours} ساعة هذا الأسبوع، أي ما يقارب ${per} جلسات تدريب قصيرة من 25 دقيقة. اقتراحي: ابدأ بـ${skillName(first, "ar")}، ثم جلسة على ${skillName(second, "ar")}، وفي آخر الأسبوع أعد المحاولة في أصعب ما واجهته. اكتب سطرًا بعد كل جلسة: ما الذي ستفعله بشكل مختلف؟`
        : `You have about ${hours} hours this week: roughly ${per} short 25-minute sessions. My suggestion: start with ${low(skillName(first, "en"), "en")}, then a session on ${low(skillName(second, "en"), "en")}, and end the week by retrying the hardest one. After each, write one line: what would you do differently?`,
      suggestedSkills: [...new Set([first, second])].filter(Boolean).slice(0, 2),
    };
  }

  // Why is an area low.
  if (containsAny(text, ["why", "low", "weak", "لماذا", "ضعيف", "منخفض"])) {
    const area = report.narrative.developmentAreas[0];
    return {
      reply: area
        ? (ar ? `أوضح مجال للبناء هو ${skillName(area.skillKey, "ar")}. ${area.explanation} ` : `The clearest area to build is ${low(skillName(area.skillKey, "en"), "en")}. ${area.explanation} `) + (ar ? "لن تتغير المستويات إلا بإعادة التقييم، لكن التدريب المركّز يجعل ذلك ممكنًا." : "Levels only change through re-assessment, but focused practice is what moves them.")
        : ar
          ? "لم يظهر في تقييمك مجال ضعف واضح بأدلة كافية."
          : "Your assessment didn't show a clear weak area with enough evidence.",
      suggestedSkills: area ? [area.skillKey] : [],
    };
  }

  // A specific situation: two habits that skill rewards, and practice for it.
  const topic = TOPICS.find((t) => containsAny(text, t.words));
  if (topic) {
    const habits = DOMAIN_HABITS[topic.domain] ?? [];
    const tips = habits.slice(0, 2).map((h) => TIPS[h][locale]);
    const skill = focus.find((k) => domainOf(k) === topic.domain) ?? DOMAINS.find((d) => d.key === topic.domain)?.subSkills[0]?.key;
    const level = report.domains.find((d) => d.key === topic.domain)?.estimate;
    return {
      reply: ar
        ? `هذا موقف في ${domainName(topic.domain, "ar")}${level ? ` (تقييمك هنا نحو ${level.toFixed(1)})` : ""}. جرّب شيئين: ${tips.join(" ثم: ")} وإن أردت، تدرّب على موقف مشابه الآن.`
        : `That's a ${low(domainName(topic.domain, "en"), "en")} situation${level ? ` (your assessment puts you around ${level.toFixed(1)} here)` : ""}. Try two things: ${tips.join(" Then: ")} If you like, practise a similar situation now.`,
      suggestedSkills: skill ? [skill] : [],
    };
  }

  // What next / today.
  if (next && containsAny(text, ["next", "today", "what should", "start", "focus", "التالي", "اليوم", "ماذا افعل", "ابدا", "اركز", "اولا"])) {
    const r = next.reason;
    const why =
      r.key === "rested"
        ? ar ? `لم تتدرّب عليها منذ ${r.days} أيام، وهذا توقيت جيد للعودة إليها.` : `You last practised it ${r.days} days ago: a good time to come back to it.`
        : r.key === "retry"
          ? ar ? `آخر محاولة كانت في المستوى ${r.level}، والذاكرة ما زالت حاضرة.` : `Your last attempt was level ${r.level}, and it's still fresh.`
          : r.key === "consolidate"
            ? ar ? "المهارة السابقة ثابتة، فحان دور هذه." : "The last skill is holding, so this one gets the turn."
            : ar ? "إنها أكبر فجوة نحو هدفك." : "It's the biggest gap toward your goal.";
    return { reply: ar ? `اليوم: ${skillName(next.skillKey, "ar")}. ${why}` : `Today: ${low(skillName(next.skillKey, "en"), "en")}. ${why}`, suggestedSkills: [next.skillKey] };
  }

  const strength = report.narrative.strengths[0];
  const { blind } = selfViewGaps(c.selfView, report);
  return {
    reply: ar
      ? `${strength ? `أقوى ما ظهر لديك: ${strength.headline}. ` : ""}تركيزك الحالي: ${list(focus.map((k) => skillName(k, "ar")), "ar") || "لم يُحدَّد بعد"}.${blind ? ` وهناك مجال قيّمت نفسك فيه أعلى من الأدلة: ${domainName(blind.key, "ar")}.` : ""} اسألني عن أسبوعك، أو عن تقدّمك، أو عن موقف تمرّ به في العمل.`
      : `${strength ? `Your clearest strength: ${low(strength.headline, "en")}. ` : ""}Your current focus: ${list(focus.map((k) => low(skillName(k, "en"), "en")), "en") || "not set yet"}.${blind ? ` There's also one area you rated higher than the evidence: ${low(domainName(blind.key, "en"), "en")}.` : ""} Ask me about your week, your progress, or a situation you're facing at work.`,
    suggestedSkills: next ? [next.skillKey] : focus.slice(0, 1),
  };
}
