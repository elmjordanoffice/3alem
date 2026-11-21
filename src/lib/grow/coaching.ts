import { DOMAINS } from "@/lib/framework/data";
import type { Level } from "@/lib/framework/types";
import { DOMAIN_HABITS, habitsIn, type Habit } from "@/lib/ai/offline/signals";

/**
 * Coaching added to every practice answer, with or without a model:
 *
 * - tips: up to two habits the answer's skills reward but the answer didn't
 *   show (giving reasons, naming costs, owners and dates, the other side),
 *   each as one concrete thing to try next time;
 * - next: for each skill scored, what the next level up looks like, from the
 *   framework's general descriptions (never the item's own answer key).
 */
export interface Coaching {
  habitsShown: Habit[];
  tips: string[];
  next: { competencyKey: string; name: string; level: number; nextLevel: number | null; looksLike: string | null }[];
}

const TIPS: Record<Habit, { en: string; ar: string }> = {
  reasons: { en: "Say why. One “because” turns a choice into a judgement others can check.", ar: "اذكر السبب. كلمة «لأن» واحدة تحوّل الاختيار إلى حكم يستطيع الآخرون فهمه ومراجعته." },
  tradeoffs: { en: "Name what your choice costs, and why it is still worth it.", ar: "سمِّ ما يكلّفه خيارك، ولماذا يستحق ذلك رغم الكلفة." },
  specifics: { en: "Make it concrete: who does what, by when (“I’ll send the summary by 4pm”).", ar: "اجعلها ملموسة: من يفعل ماذا ومتى («سأرسل الملخص قبل الساعة الرابعة»)." },
  perspective: { en: "Show you see their side: name what matters to the other person before your plan.", ar: "أظهر أنك ترى موقف الطرف الآخر: اذكر ما يهمّه قبل أن تعرض خطتك." },
  checking: { en: "Say what you would check before acting, and what would change your mind.", ar: "اذكر ما ستتحقق منه قبل أن تتصرف، وما الذي قد يغيّر رأيك." },
  ownership: { en: "Own it in the first person: “I’ll…”, “my call”, “that’s on me”.", ar: "تحمّل المسؤولية بصيغة المتكلم: «سأتولى…»، «القرار قراري»، «هذا خطئي»." },
  contingency: { en: "Add a trigger: “If X hasn’t happened by Thursday, I’ll…”.", ar: "أضف نقطة تحوّل: «إذا لم يحدث كذا قبل الخميس، فسأ…»." },
  options: { en: "Offer a choice: give the other person two workable options and ask them to pick.", ar: "قدّم خيارين عمليين واطلب من الطرف الآخر أن يختار بينهما." },
  calibration: { en: "Say how sure you are, and what would make you surer.", ar: "قل إلى أي حد أنت واثق، وما الذي سيزيد ثقتك." },
  learning: { en: "Turn it into a habit: what will you do differently next time, and how will you know it worked?", ar: "حوّلها إلى عادة: ماذا ستفعل بشكل مختلف في المرة القادمة، وكيف ستعرف أن ذلك نجح؟" },
  people: { en: "Bring in the people affected: who feels this first, and what do they need?", ar: "أشرك المتأثرين: من سيشعر بهذا أولًا، وماذا يحتاج؟" },
};

const SUB_SKILLS = new Map(DOMAINS.flatMap((d) => d.subSkills.map((s) => [s.key, s] as const)));

export function coachingFor(words: string, scores: { competencyKey: string; level: number }[], targets: string[], locale: "en" | "ar"): Coaching {
  const shown = habitsIn(words);
  const wanted: Habit[] = [];
  for (const key of targets) for (const h of DOMAIN_HABITS[key.split(".")[0]!] ?? []) if (!wanted.includes(h)) wanted.push(h);
  const missing = wanted.filter((h) => !shown.has(h));
  return {
    habitsShown: [...shown],
    tips: missing.slice(0, 2).map((h) => TIPS[h][locale]),
    next: scores.map((s) => {
      const def = SUB_SKILLS.get(s.competencyKey);
      const level = Math.round(s.level);
      const nextLevel = level < 5 ? ((level + 1) as Level) : null;
      return { competencyKey: s.competencyKey, name: def?.name[locale] ?? s.competencyKey, level, nextLevel, looksLike: def && nextLevel ? def.anchors[nextLevel][locale] : null };
    }),
  };
}
