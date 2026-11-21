import { normalize } from "./text";

/**
 * Habits of good work that show in how an answer is written, whatever the
 * scenario: giving reasons, weighing costs, naming who does what by when,
 * seeing the other person's side, checking before concluding. The offline
 * scorer credits the habits that matter for each domain. They are a small
 * nudge next to the item's own indicators, never a substitute for them.
 *
 * Patterns run on normalised text (lower case; Arabic alef, yeh and teh
 * marbuta folded; diacritics removed), so they are written in that form.
 */
export type Habit =
  | "reasons"
  | "tradeoffs"
  | "specifics"
  | "perspective"
  | "checking"
  | "ownership"
  | "contingency"
  | "options"
  | "calibration"
  | "learning"
  | "people";

const W = "(?:^|[^\\p{L}\\p{N}])";
const AR = "(?:[وف])?(?:[بكلس])?(?:ال|ل)?";
const en = (words: string) => new RegExp(`${W}(?:${words})`, "u");
const ar = (words: string) => new RegExp(`${W}${AR}(?:${words})`, "u");

const HABITS: Record<Habit, RegExp[]> = {
  reasons: [en("because|so that|which means|this means|that means|therefore|since the|as a result|the reason"), ar("لان|حتي|مما يعني|وهذا يعني|اي ان|لذلك|لذا|بسبب|اذ ان|فهذا")],
  tradeoffs: [en("but |however|the cost|costs us|at the cost|risk|instead of|rather than|on the other hand|trade-off|tradeoff|downside|in exchange|worth it"), ar("لكن|غير ان|علي حساب|مخاطر|المخاطره|بدلا من|في المقابل|ثمن|كلفه|تكلفه|يستحق")],
  specifics: [
    en("by (?:\\d{1,2}(?::\\d{2}| ?(?:am|pm)|st|nd|rd|th)|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|the end|end of|noon)|today|tomorrow|this (?:afternoon|morning|week)|within \\d+ (?:hours|days|minutes)|\\d{1,2}:\\d{2}|\\d{1,2} ?(?:am|pm)"),
    ar("اليوم|غدا|قبل الساعه|بحلول|خلال \\d|الاحد|الاثنين|الثلاثاء|الاربعاء|الخميس|الجمعه|السبت|بعد ظهر|صباح|\\d{1,2}:\\d{2}"),
  ],
  perspective: [en("you're right|you are right|i understand|i know (?:that|how|the)|i hear|their concern|from their|for them|matters (?:most|to)|i'm sorry|i am sorry|i appreciate|thank you for"), ar("اتفهم|افهم|اعلم ان|محق|قلق|يهمكم|بالنسبه اليكم|بالنسبه لهم|يؤسفني|اعتذر|اقدر|شكرا")],
  checking: [en("check|verify|confirm|test|the data|evidence|measure|assum|compare|look at the|the figures|the numbers|segment"), ar("اتحقق|التحقق|نتحقق|البيانات|الارقام|دليل|نختبر|اختبار|نقيس|افتراض|نقارن|اراجع|مراجعه")],
  ownership: [
    en("i'll|i will|my decision|my responsibility|my call|on us|on me|i should have|i own|i take|i didn't|i failed"),
    // First-person future verbs (سأتولى، سأبلغ…) are listed, since "سا" also starts ساعة and سابق.
    new RegExp(`${W}(?:[وف])?سا(?:تولي|تحمل|بلغ|تصل|كتب|رسل|تابع|عمل|جتمع|تحدث|راجع|ضع|شرح|قوم|طلب|عتذر|تاكد|خبر|شكر|حدد|تفق|عود)`, "u"),
    ar("قراري|مسؤوليتي|المسؤوليه|علينا|اتحمل|كان علي|اخطات|لم اقم"),
  ],
  contingency: [en("if (?:we|it|they|the|more|less|this|that|there)|stop rule|threshold|fallback|plan b|otherwise|in case|unless"), ar("اذا|ان لم|والا|في حال|خطه بديله|ما لم")],
  options: [en("would you prefer|which option|either|option a|option b|or one|choose between|two options"), ar("تفضلون|تفضل|خيار|الخيارين|اما |ام ")],
  calibration: [en("confiden|likely|probably|i'd want to|not sure yet|i'm not certain|medium|uncertain"), ar("واثق|ثقتي|مرجح|علي الارجح|ربما|ارجح|غير متاكد")],
  learning: [en("lesson|next time|going forward|in future|habit|carry (?:this|it|beyond)|apply (?:this|it)|would change"), ar("درس|المره القادمه|مستقبلا|عاده|سأطبق|ساطبق|ساغير")],
  people: [en("user|customer|client|staff|people who|employees|the team"), ar("المستخدم|العميل|العملاء|الموظفين|الفريق")],
};

/** The habits each domain's anchors reward; a domain earns credit only for its own. */
export const DOMAIN_HABITS: Record<string, Habit[]> = {
  judgment: ["tradeoffs", "contingency", "reasons", "calibration"],
  "critical-thinking": ["checking", "reasons", "calibration", "tradeoffs"],
  communication: ["specifics", "options", "perspective", "reasons"],
  collaboration: ["perspective", "options", "reasons", "specifics"],
  leadership: ["ownership", "reasons", "specifics", "perspective"],
  management: ["specifics", "ownership", "contingency", "checking"],
  adaptability: ["contingency", "learning", "reasons", "specifics"],
  "product-thinking": ["people", "checking", "tradeoffs", "reasons"],
  technical: ["checking", "reasons", "contingency", "tradeoffs"],
};

/** Which habits appear in an answer. */
export function habitsIn(text: string): Set<Habit> {
  const h = normalize(text);
  const out = new Set<Habit>();
  for (const [habit, res] of Object.entries(HABITS) as [Habit, RegExp[]][]) if (res.some((re) => re.test(h))) out.add(habit);
  return out;
}
