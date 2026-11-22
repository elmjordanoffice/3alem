import { castIn, hash } from "@/lib/brand/scene-art";

/**
 * The week, alive: every scene happens at a moment (a day of the week and a
 * time that moves on as you work), and between scenes a colleague sends a
 * short note about what you just decided.
 *
 * Fairness: a note never evaluates. Every template says the same thing
 * whatever was chosen (noted, passed on, on to the next thing), and names
 * only the scene, never the choice, so it can't hint that an answer was good
 * or bad. Pure functions; candidate-state.ts feeds them.
 */

export interface StoryClock {
  /** 1-based day of the in-story week (Day 1 is the first working day). */
  day: number;
  /** Minutes after midnight. */
  minutes: number;
}

export interface StoryNote {
  from: { name: string; role: string };
  text: string;
  minutes: number;
}

const START = 9 * 60 + 10;
const STEP = 95;
const STAGE_OFFSET = { MAIN: 0, PROBE: 15, TWIST: 35 } as const;

/** "Day 2: …" → 2, "Days 3–4: …" → 3; otherwise the chapter's place in the week. */
export function dayOf(chapterTitle: string, chapterIndex: number): number {
  const m = chapterTitle.match(/(\d+)/);
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n >= 1 && n <= 7 ? n : chapterIndex + 1;
}

export function clockFor(chapterTitle: string, chapterIndex: number, sceneInChapter: number, stage: "MAIN" | "PROBE" | "TWIST"): StoryClock {
  const minutes = Math.min(17 * 60 + 40, START + (Math.max(1, sceneInChapter) - 1) * STEP + STAGE_OFFSET[stage]);
  return { day: dayOf(chapterTitle, chapterIndex), minutes };
}

const NOTES: Record<"en" | "ar", ((title: string) => string)[]> = {
  en: [
    (t) => `Thanks for the update on “${t}”. Noted, and we'll take it from here.`,
    (t) => `Saw your call on “${t}”. I'll pass it on to the team.`,
    (t) => `Got it on “${t}”. Let's see how it plays out.`,
    (t) => `Logged your decision on “${t}”. On to the next thing.`,
  ],
  ar: [
    (t) => `شكرًا على التحديث بشأن «${t}». سجّلنا ذلك، وسنكمل من هنا.`,
    (t) => `اطّلعت على قرارك بشأن «${t}». سأبلغ الفريق.`,
    (t) => `وصلني قرارك بشأن «${t}». لنرَ كيف ستسير الأمور.`,
    (t) => `سجّلت قرارك بشأن «${t}». ننتقل إلى ما بعده.`,
  ],
};

/**
 * A note from a colleague about the previous scene: from someone that scene
 * involved (or, failing that, someone from the cast), a few minutes before
 * this scene begins.
 */
export function noteFor(
  previous: { title: string; scenario: string } | null,
  cast: { name: string; role: string }[],
  locale: "en" | "ar",
  at: number,
): StoryNote | null {
  if (!previous || !cast.length) return null;
  const seed = hash(previous.title);
  const from = castIn(previous.scenario, cast, 1)[0] ?? cast[seed % cast.length]!;
  const templates = NOTES[locale];
  return { from: { name: from.name, role: from.role }, text: templates[seed % templates.length]!(previous.title), minutes: Math.max(START - 20, at - 6 - (seed % 9)) };
}
