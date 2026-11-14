import type { ItemType } from "@/lib/assessment/item-schema";
import type { LocalizedText } from "@/lib/framework/types";

export interface TrackSessionDef {
  title: LocalizedText;
  skills: string[];
  /** Preferred format; the engine falls back if none is available. */
  itemType: ItemType;
  /** Difficulty relative to the person's current level (+1 stretches). */
  stretch: 0 | 1;
}

export interface TrackDef {
  key: string;
  name: LocalizedText;
  description: LocalizedText;
  sessions: TrackSessionDef[];
}

const s = (en: string, ar: string, skills: string[], itemType: ItemType, stretch: 0 | 1 = 0): TrackSessionDef => ({ title: { en, ar }, skills, itemType, stretch });

/** Guided paths of 8–12 practice sessions. */
export const TRACKS: TrackDef[] = [
  {
    key: "first-time-manager",
    name: { en: "First-time manager", ar: "مدير لأول مرة" },
    description: { en: "From doing the work to getting it done through others: delegation, feedback, hard conversations and priorities.", ar: "من أداء العمل بنفسك إلى إنجازه عبر الآخرين: التفويض والملاحظات والمحادثات الصعبة والأولويات." },
    sessions: [
      s("Your first week of priorities", "أولويات أسبوعك الأول", ["management.planning-prioritisation", "judgment.trade-off-reasoning"], "RANKING_ALLOCATION"),
      s("Delegating the right work", "تفويض العمل المناسب", ["management.delegation", "leadership.developing-others"], "RANKING_ALLOCATION"),
      s("Feedback that lands", "ملاحظات تصل إلى هدفها", ["communication.difficult-conversations", "leadership.developing-others"], "WRITTEN_WORK_SAMPLE"),
      s("The underperformer", "عضو الفريق المتعثر", ["management.performance-management", "collaboration.empathy"], "ROLE_PLAY"),
      s("Conflict on the team", "خلاف داخل الفريق", ["leadership.handling-conflict", "communication.listening"], "ROLE_PLAY"),
      s("Saying no upwards", "قول لا لمن هم أعلى منك", ["leadership.courage", "communication.persuasion"], "WRITTEN_WORK_SAMPLE", 1),
      s("Following through", "المتابعة حتى النهاية", ["management.follow-through", "leadership.ownership"], "CONSEQUENCE_CHAIN"),
      s("Setting direction", "تحديد الاتجاه", ["leadership.setting-direction", "communication.clarity-structure"], "WRITTEN_WORK_SAMPLE", 1),
      s("A week under pressure", "أسبوع تحت الضغط", ["management.planning-prioritisation", "adaptability.composure-under-pressure"], "INBOX", 1),
      s("Looking back", "نظرة إلى الوراء", ["collaboration.self-awareness", "adaptability.learning-speed"], "REFLECTION"),
    ],
  },
  {
    key: "strategic-thinking",
    name: { en: "Strategic thinking", ar: "التفكير الاستراتيجي" },
    description: { en: "See the whole board: question the premise, weigh second-order effects and make proportionate calls.", ar: "انظر إلى الصورة كاملة: شكّك في الفرضية، وزن الآثار غير المباشرة، واتخذ قرارات متناسبة." },
    sessions: [
      s("Question the premise", "شكّك في الفرضية", ["critical-thinking.spotting-assumptions", "product-thinking.problem-framing"], "CASE_ANALYSIS"),
      s("Signal or noise", "إشارة أم ضجيج", ["critical-thinking.evaluating-evidence", "critical-thinking.quantitative-reasoning"], "CASE_ANALYSIS"),
      s("Every option costs something", "لكل خيار ثمن", ["judgment.trade-off-reasoning", "judgment.risk-calibration"], "TRADE_OFF_DILEMMA"),
      s("What happens next", "ماذا سيحدث بعد ذلك", ["judgment.second-order-thinking", "adaptability.handling-new-information"], "CONSEQUENCE_CHAIN"),
      s("Deciding without all the facts", "القرار دون كل الحقائق", ["judgment.deciding-under-ambiguity", "adaptability.comfort-with-ambiguity"], "TRADE_OFF_DILEMMA", 1),
      s("Where the money goes", "أين تذهب الموارد", ["management.resource-allocation", "judgment.trade-off-reasoning"], "RANKING_ALLOCATION"),
      s("Root causes", "الأسباب الجذرية", ["critical-thinking.root-cause-analysis", "critical-thinking.logical-reasoning"], "CASE_ANALYSIS", 1),
      s("Making the case", "عرض الحجة", ["communication.persuasion", "leadership.setting-direction"], "WRITTEN_WORK_SAMPLE", 1),
    ],
  },
  {
    key: "executive-communication",
    name: { en: "Executive communication", ar: "التواصل مع القيادة العليا" },
    description: { en: "Say more with less: structure, audience, persuasion and calm in difficult conversations.", ar: "قل أكثر بكلمات أقل: البنية والجمهور والإقناع والهدوء في المحادثات الصعبة." },
    sessions: [
      s("The one-page summary", "الملخص في صفحة واحدة", ["communication.clarity-structure", "communication.written-communication"], "WRITTEN_WORK_SAMPLE"),
      s("Same news, three audiences", "خبر واحد لثلاثة جماهير", ["communication.adapting-to-audience", "collaboration.stakeholder-management"], "WRITTEN_WORK_SAMPLE"),
      s("The sceptical executive", "المسؤول التنفيذي المتشكك", ["communication.persuasion", "adaptability.composure-under-pressure"], "ROLE_PLAY", 1),
      s("Bad news, early", "الخبر السيئ مبكراً", ["communication.difficult-conversations", "leadership.courage"], "WRITTEN_WORK_SAMPLE"),
      s("Listening first", "الإصغاء أولاً", ["communication.listening", "collaboration.empathy"], "ROLE_PLAY"),
      s("Influence without authority", "التأثير دون سلطة", ["leadership.influence-without-authority", "communication.persuasion"], "ROLE_PLAY", 1),
      s("The angry client", "العميل الغاضب", ["communication.difficult-conversations", "collaboration.stakeholder-management"], "ROLE_PLAY"),
      s("An announcement people won't like", "إعلان لن يعجب الجميع", ["communication.clarity-structure", "leadership.setting-direction"], "WRITTEN_WORK_SAMPLE", 1),
      s("Morning inbox", "بريد الصباح", ["communication.written-communication", "management.planning-prioritisation"], "INBOX"),
    ],
  },
  {
    key: "product-thinking",
    name: { en: "Product thinking for non-designers", ar: "التفكير في المنتج لغير المصممين" },
    description: { en: "Frame problems from the user's side, generate options and prioritise what matters.", ar: "صُغ المشكلات من جهة المستخدم، وولّد خيارات، ورتّب ما يهم." },
    sessions: [
      s("What problem are we solving?", "ما المشكلة التي نحلها؟", ["product-thinking.problem-framing", "critical-thinking.spotting-assumptions"], "DESIGN_CHALLENGE"),
      s("Through the user's eyes", "بعين المستخدم", ["product-thinking.user-empathy", "collaboration.empathy"], "DESIGN_CHALLENGE"),
      s("More than one idea", "أكثر من فكرة واحدة", ["product-thinking.idea-generation", "adaptability.comfort-with-ambiguity"], "DESIGN_CHALLENGE"),
      s("Design the fix", "صمّم الحل", ["product-thinking.solution-design", "product-thinking.user-empathy"], "DESIGN_CHALLENGE", 1),
      s("What goes in first", "ما الذي يأتي أولاً", ["product-thinking.feature-prioritisation", "judgment.trade-off-reasoning"], "RANKING_ALLOCATION"),
      s("Reading the funnel", "قراءة مسار التحويل", ["critical-thinking.quantitative-reasoning", "product-thinking.problem-framing"], "CASE_ANALYSIS"),
      s("Selling the idea", "إقناع الآخرين بالفكرة", ["communication.persuasion", "collaboration.stakeholder-management"], "WRITTEN_WORK_SAMPLE"),
      s("Learning from launch", "التعلم من الإطلاق", ["adaptability.learning-speed", "collaboration.self-awareness"], "REFLECTION"),
    ],
  },
  {
    key: "decisions-under-pressure",
    name: { en: "Decisions under pressure", ar: "القرارات تحت الضغط" },
    description: { en: "Stay proportionate when time is short and stakes are high: risk, escalation, ethics and composure.", ar: "حافظ على التناسب حين يضيق الوقت وترتفع المخاطر: المخاطرة والتصعيد والأخلاقيات والهدوء." },
    sessions: [
      s("How bad is it, really?", "ما مدى سوء الأمر فعلاً؟", ["judgment.risk-calibration", "critical-thinking.quantitative-reasoning"], "TRADE_OFF_DILEMMA"),
      s("When to escalate", "متى تصعّد", ["judgment.knowing-when-to-escalate", "leadership.ownership"], "TRADE_OFF_DILEMMA"),
      s("The shortcut", "الطريق المختصر", ["judgment.ethical-judgment", "leadership.courage"], "ROLE_PLAY", 1),
      s("Everything at once", "كل شيء في وقت واحد", ["adaptability.composure-under-pressure", "management.planning-prioritisation"], "INBOX"),
      s("New facts mid-way", "حقائق جديدة في منتصف الطريق", ["adaptability.handling-new-information", "judgment.deciding-under-ambiguity"], "CONSEQUENCE_CHAIN"),
      s("Choices that echo", "خيارات يتردد صداها", ["judgment.second-order-thinking", "judgment.trade-off-reasoning"], "CONSEQUENCE_CHAIN", 1),
      s("Owning the outcome", "تحمّل النتيجة", ["leadership.ownership", "communication.difficult-conversations"], "WRITTEN_WORK_SAMPLE"),
      s("What you'd do differently", "ما الذي ستفعله بشكل مختلف", ["collaboration.self-awareness", "adaptability.learning-speed"], "REFLECTION"),
    ],
  },
];

export function trackByKey(key: string) {
  return TRACKS.find((t) => t.key === key) ?? null;
}
