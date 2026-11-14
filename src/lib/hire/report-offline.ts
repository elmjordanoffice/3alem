import type { CandidateModel, RoleProfile, roleFit } from "@/lib/engine";
import type { ReportNarrative } from "@/lib/ai/prompts/report-writer";
import type { ReportContent, ReportDomain, ReportEvidence, ReportSkill } from "./report-types";

/**
 * Narrative without a language model: careful templates over the computed
 * profile. Plainer than the AI writer, but held to the same rule: every claim
 * cites evidence that exists.
 */

const LEVEL = {
  en: ["", "emerging", "developing", "proficient", "advanced", "expert"],
  ar: ["", "ناشئ", "في طور النمو", "متمكّن", "متقدّم", "خبير"],
};

const QUESTIONS: Record<string, { en: [string, string]; ar: [string, string] }> = {
  technical: {
    en: ["Tell us about a technical problem you diagnosed that others had missed. How did you find the cause?", "What would you have checked first if the obvious fix had failed?"],
    ar: ["حدّثنا عن مشكلة تقنية شخّصتها وفاتت غيرك. كيف وصلت إلى السبب؟", "ما الذي كنت ستتحقق منه أولاً لو فشل الحل الواضح؟"],
  },
  "critical-thinking": {
    en: ["Describe a time the data pointed one way and you suspected it was wrong. What did you do?", "What evidence would have changed your conclusion?"],
    ar: ["صف موقفاً أشارت فيه البيانات إلى اتجاه وشككت في صحتها. ماذا فعلت؟", "ما الدليل الذي كان سيغير استنتاجك؟"],
  },
  judgment: {
    en: ["Walk us through a decision where every option had a real cost. How did you weigh them?", "Looking back, what would you weigh differently?"],
    ar: ["خذنا خطوة بخطوة في قرار كان لكل خيار فيه ثمن حقيقي. كيف وازنت بينها؟", "عند النظر إلى الوراء، ما الذي كنت ستزنه بطريقة مختلفة؟"],
  },
  leadership: {
    en: ["Tell us about a time you had to bring people along on something they didn't agree with.", "What did you do when someone kept resisting?"],
    ar: ["حدّثنا عن مرة احتجت فيها إلى إقناع أشخاص بأمر لم يوافقوا عليه.", "ماذا فعلت عندما استمر أحدهم في المقاومة؟"],
  },
  management: {
    en: ["Describe a week when everything was urgent. How did you decide what to do first and what to delegate?", "What slipped, and how did you handle it?"],
    ar: ["صف أسبوعاً كان كل شيء فيه عاجلاً. كيف قررت ما تبدأ به وما تفوّضه؟", "ما الذي تأخر، وكيف تعاملت معه؟"],
  },
  communication: {
    en: ["Tell us about a difficult message you had to deliver. How did you prepare it for that audience?", "How did they react, and what did you adjust?"],
    ar: ["حدّثنا عن رسالة صعبة اضطررت إلى إيصالها. كيف أعددتها لذلك الجمهور؟", "كيف كان رد فعلهم، وما الذي عدّلته؟"],
  },
  "product-thinking": {
    en: ["Describe a time you reframed a problem before solving it. What changed?", "How did you check it worked for the people using it?"],
    ar: ["صف مرة أعدت فيها صياغة مشكلة قبل حلها. ما الذي تغير؟", "كيف تحققت من أنه نجح لمن يستخدمونه؟"],
  },
  collaboration: {
    en: ["Tell us about feedback that was hard to hear. What did you do with it?", "How would that colleague describe working with you?"],
    ar: ["حدّثنا عن ملاحظات كان سماعها صعباً. ماذا فعلت بها؟", "كيف سيصف ذلك الزميل العمل معك؟"],
  },
  adaptability: {
    en: ["Describe a time new information arrived halfway through and changed the plan. What did you do?", "What did you learn that you used later?"],
    ar: ["صف مرة وصلت فيها معلومات جديدة في منتصف العمل وغيّرت الخطة. ماذا فعلت؟", "ما الذي تعلمته واستخدمته لاحقاً؟"],
  },
};

const PRACTICE: Record<string, { en: string; ar: string }> = {
  technical: { en: "Diagnose unfamiliar problems from first principles and state what you don't know", ar: "شخّص مشكلات غير مألوفة من المبادئ الأولى واذكر ما لا تعرفه" },
  "critical-thinking": { en: "Case analyses with a hidden flaw in the data", ar: "تحليل حالات فيها خلل خفي في البيانات" },
  judgment: { en: "Trade-off dilemmas where every option has a cost", ar: "معضلات موازنة لكل خيار فيها ثمن" },
  leadership: { en: "Role-plays: bringing a sceptical colleague along", ar: "لعب أدوار: إقناع زميل متشكك" },
  management: { en: "Prioritisation and delegation under a fixed budget", ar: "ترتيب الأولويات والتفويض ضمن ميزانية محددة" },
  communication: { en: "Written work samples for different audiences", ar: "نماذج كتابية لجماهير مختلفة" },
  "product-thinking": { en: "Design challenges: reframe, then design for real users", ar: "تحديات تصميم: أعد الصياغة ثم صمّم لمستخدمين حقيقيين" },
  collaboration: { en: "Reflection after role-plays: how did they experience you?", ar: "التأمل بعد لعب الأدوار: كيف اختبروا تعاملك؟" },
  adaptability: { en: "Consequence chains where the situation changes mid-way", ar: "سلاسل عواقب يتغير فيها الموقف في منتصف الطريق" },
};

function band(x: number) {
  return Math.min(5, Math.max(1, Math.round(x)));
}

export function offlineNarrative(x: {
  locale: "en" | "ar";
  kind: "HIRE" | "GROW" | "TEAM_MEMBER";
  domains: ReportDomain[];
  evidence: Record<string, ReportEvidence>;
  fit: ReturnType<typeof roleFit>;
  hypotheses: ReportContent["hypotheses"];
  workStyle: ReportContent["workStyle"];
  role: RoleProfile;
  catalog: Record<string, { name: string }>;
  model: CandidateModel;
}): ReportNarrative {
  const ar = x.locale === "ar";
  const you = x.kind === "GROW";
  const measured = x.domains.flatMap((d) => d.subSkills.map((s) => ({ ...s, domain: d.key, domainName: d.name }))).filter((s) => s.observations > 0 && s.evidenceIds.length > 0);
  const byHigh = [...measured].sort((a, b) => b.estimate - a.estimate || b.confidence - a.confidence);
  const byLow = [...measured].sort((a, b) => a.estimate - b.estimate || b.confidence - a.confidence);
  const quote = (s: ReportSkill) => x.evidence[s.evidenceIds[0]!];

  const describe = (s: ReportSkill & { domainName: string }, positive: boolean) => {
    const e = quote(s)!;
    const lvl = LEVEL[x.locale][band(s.estimate)];
    if (ar) {
      return positive
        ? `أظهر مستوى ${lvl} في ${s.name} في «${e.itemTitle}» (الفصل ${e.chapter}).`
        : `${s.name} عند مستوى ${lvl} حالياً؛ ظهر ذلك في «${e.itemTitle}» (الفصل ${e.chapter}).${s.flags.includes("conditional") ? " يظهر هذا النمط تحت ضغط الوقت تحديداً." : ""}`;
    }
    const subject = you ? "You showed" : "Showed";
    return positive
      ? `${subject} ${lvl} ${s.name.toLowerCase()} in "${e.itemTitle}" (chapter ${e.chapter}).`
      : `${s.name} is at a ${lvl} level for now; it showed in "${e.itemTitle}" (chapter ${e.chapter}).${s.flags.includes("conditional") ? " The pattern appeared mainly under time pressure." : ""}`;
  };

  const strong = byHigh.filter((s) => s.estimate >= Math.max(3.4, x.role.expectedLevel)).slice(0, 3);
  const strengths = strong.map((s) => ({ skillKey: s.key, headline: s.name, explanation: describe(s, true), evidenceIds: s.evidenceIds.slice(0, 2) }));
  const hidden = byHigh
    .filter((s) => s.estimate >= Math.max(4, x.role.expectedLevel + 0.75) && (x.role.domainWeights[s.domain] ?? 0) < 0.5 && !strong.some((t) => t.key === s.key))
    .slice(0, 2)
    .map((s) => ({
      skillKey: s.key,
      headline: ar ? `${s.name} يتجاوز متطلبات الدور` : `${s.name} beyond what the role asks`,
      explanation: describe(s, true),
      evidenceIds: s.evidenceIds.slice(0, 2),
    }));
  const weak = byLow.filter((s) => s.estimate <= x.role.expectedLevel - 0.4 && !strong.some((t) => t.key === s.key)).slice(0, 3);
  const developmentAreas = weak.map((s) => ({
    skillKey: s.key,
    headline: ar ? `بناء ${s.name}` : `Build ${s.name.toLowerCase()}`,
    explanation: describe(s, false),
    evidenceIds: s.evidenceIds.slice(0, 2),
  }));

  const pace = x.workStyle.find((w) => w.key === "workstyle.pace");
  const adapt = x.domains.find((d) => d.key === "adaptability");
  const fast = pace ? pace.position > 0.2 : false;
  const revises = adapt ? adapt.estimate >= 3.5 : false;
  const decisionPattern = {
    headline: ar
      ? `${fast ? "يقرر بسرعة" : "يقرر بتأنٍ"}${revises ? " ويراجع قراره جيداً عند ظهور معلومات جديدة" : " ويميل إلى التمسك بقراره الأول"}`
      : `${fast ? "Decides fast" : "Decides deliberately"}${revises ? " and revises well when new information arrives" : " and tends to hold to a first decision"}`,
    explanation: ar
      ? "مستخلص من اختيارات أسلوب العمل ومن الردود بعد تغيّر أحد القيود في كل موقف."
      : "Drawn from the work-style choices and from answers after one constraint changed in each scenario.",
    evidenceIds: adapt?.evidenceIds.slice(0, 2) ?? [],
  };

  const lowConf = x.domains
    .filter((d) => x.role.critical.includes(d.key) || d.observations > 0)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 4);
  const interviewQuestions = lowConf.map((d) => {
    const q = QUESTIONS[d.key] ?? QUESTIONS.judgment!;
    return {
      question: q[x.locale][0],
      followUp: q[x.locale][1],
      skillKey: d.key,
      why: ar ? `الثقة في ${d.name} أقل من غيرها في هذا التقييم.` : `Confidence in ${d.name.toLowerCase()} is lower than in other areas of this assessment.`,
    };
  });
  while (interviewQuestions.length < 3) {
    const d = x.domains[interviewQuestions.length]!;
    const q = QUESTIONS[d.key] ?? QUESTIONS.judgment!;
    interviewQuestions.push({ question: q[x.locale][0], followUp: q[x.locale][1], skillKey: d.key, why: ar ? "لاستكمال الصورة." : "To round out the picture." });
  }

  const top = strong[0]?.name ?? byHigh[0]?.name;
  const low = weak[0]?.name;
  const fitWord = { STRONG: ar ? "قوية" : "strong", GOOD: ar ? "جيدة" : "good", PARTIAL: ar ? "جزئية" : "partial", WEAK: ar ? "ضعيفة" : "weak" }[x.fit.fit];
  const portrait = ar
    ? [
        top ? `أوضح نقاط القوة في هذا التقييم كانت ${top}.` : "أظهر التقييم صورة متوازنة عبر المجالات.",
        low ? `المجال الذي يستحق البناء أكثر هو ${low}.` : "لم يظهر مجال ضعف واضح.",
        you ? "استخدم الخطة أدناه لتركّز تدريبك." : `الملاءمة العامة للدور ${fitWord}، ويُستحسن التحقق منها في المقابلة.`,
      ].join(" ")
    : [
        top ? `${you ? "Your" : "The"} clearest strength in this assessment was ${top.toLowerCase()}.` : "The assessment showed a balanced picture across domains.",
        low ? `The area most worth building is ${low.toLowerCase()}.` : "No clear development area stood out.",
        you ? "Use the plan below to focus your practice." : `Overall role fit is ${fitWord}; confirm it in the interview.`,
      ].join(" ");

  const plan =
    x.kind === "GROW"
      ? (weak.length ? weak : byLow.slice(0, 3)).slice(0, 3).map((s) => ({
          skillKey: s.key,
          why: ar ? `أقل مستوياتك الحالية (${s.estimate}).` : `One of your lowest current levels (${s.estimate}).`,
          practice: [PRACTICE[s.domain]?.[x.locale] ?? ""],
          days30: ar ? "أكمل ثلاث جلسات تدريب على هذه المهارة واكتب ملاحظة بعد كل واحدة." : "Complete three practice sessions on this skill and write a short note after each.",
          days60: ar ? "طبّق ما تعلمته في موقف حقيقي في عملك واطلب ملاحظات محددة." : "Apply it in one real situation at work and ask for specific feedback.",
          days90: ar ? "أعد التقييم لترى إن تغيّر مستواك." : "Re-assess to see whether your level has moved.",
          resources: [],
        }))
      : undefined;

  return { portrait, strengths, hiddenPotential: hidden, developmentAreas, decisionPattern, interviewQuestions: interviewQuestions.slice(0, 6), ...(plan ? { plan } : {}) };
}
