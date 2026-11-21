import { candidateWords, type ResponseContent } from "@/lib/assessment/response-schema";
import { habitsIn, type Habit } from "@/lib/ai/offline/signals";
import { wordCount } from "@/lib/ai/offline/text";

/**
 * What a candidate gets back the moment they finish: what they got through,
 * and the working habits that showed up in their own words. Descriptive,
 * never a score: the report and any decision stay with the organisation and
 * a person. A habit is named only when it appeared in at least two answers.
 */
export interface Recap {
  scenes: number;
  followUps: number;
  words: number;
  minutes: number;
  habits: Habit[];
}

/** Habits worth naming to a candidate, in the order they read best when several tie. */
const NAMEABLE: Habit[] = ["reasons", "ownership", "checking", "tradeoffs", "perspective", "specifics", "contingency", "options", "calibration", "learning", "people"];

export function recapFrom(responses: { stage: string; content: unknown; durationMs: number | null }[]): Recap {
  let words = 0;
  let ms = 0;
  const counts = new Map<Habit, number>();
  for (const r of responses) {
    const text = candidateWords(r.content as ResponseContent) ?? "";
    words += text.trim() ? wordCount(text) : 0;
    ms += r.durationMs ?? 0;
    for (const h of habitsIn(text)) counts.set(h, (counts.get(h) ?? 0) + 1);
  }
  const habits = NAMEABLE.filter((h) => (counts.get(h) ?? 0) >= 2)
    .sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || NAMEABLE.indexOf(a) - NAMEABLE.indexOf(b))
    .slice(0, 3);
  return {
    scenes: responses.filter((r) => r.stage === "MAIN").length,
    followUps: responses.filter((r) => r.stage !== "MAIN").length,
    words,
    minutes: Math.max(1, Math.round(ms / 60_000)),
    habits,
  };
}
