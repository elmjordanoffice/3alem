import type { PracticeEvent } from "./momentum";

/**
 * The daily habit: a rep streak that's kind. A day counts when you finish
 * any practice. One missed day in each calendar week is forgiven on its own
 * (a "rest day"), so the streak survives a busy day without guilt; a second
 * missed day in the same week ends it. Today doesn't break anything until
 * it's over.
 *
 * Healthy by design (D-059): no penalties, no countdowns, no nagging.
 */
export interface HabitDay {
  /** UTC midnight of the day. */
  date: number;
  state: "done" | "rest" | "missed" | "today" | "future";
}

export interface Habit {
  streak: number;
  doneToday: boolean;
  /** This week, from the first day of the week to the last. */
  week: HabitDay[];
  /** Best streak ever. */
  best: number;
}

const DAY = 86_400_000;
const dayOf = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
const weekOf = (t: number, firstDay: 0 | 1) => t - ((new Date(t).getUTCDay() - firstDay + 7) % 7) * DAY;

/** Walk days from the first practice to `until`, marking done, rest (one forgiven per week) and missed. */
function walk(done: Set<number>, from: number, until: number, firstDay: 0 | 1) {
  const states = new Map<number, HabitDay["state"]>();
  const restUsed = new Set<number>();
  let run = 0;
  let best = 0;
  for (let t = from; t <= until; t += DAY) {
    if (done.has(t)) {
      states.set(t, "done");
      run++;
    } else {
      const w = weekOf(t, firstDay);
      if (run > 0 && !restUsed.has(w)) {
        restUsed.add(w);
        states.set(t, "rest");
      } else {
        states.set(t, "missed");
        run = 0;
      }
    }
    best = Math.max(best, run);
  }
  return { states, run, best };
}

export function habit(events: PracticeEvent[], opts: { locale: "en" | "ar"; now?: Date }): Habit {
  const now = opts.now ?? new Date();
  const firstDay: 0 | 1 = opts.locale === "ar" ? 0 : 1;
  const today = dayOf(now);
  const done = new Set(events.map((e) => dayOf(e.completedAt)));
  const doneToday = done.has(today);
  const first = done.size ? Math.min(...done) : today;
  // Until yesterday, then add today only if it's done (an unfinished today never breaks the streak).
  const past = walk(done, first, today - DAY, firstDay);
  const streak = past.run + (doneToday ? 1 : 0);
  const states = past.states;
  const start = weekOf(today, firstDay);
  const week: HabitDay[] = Array.from({ length: 7 }, (_, i) => {
    const t = start + i * DAY;
    if (t > today) return { date: t, state: "future" };
    if (t === today) return { date: t, state: doneToday ? "done" : "today" };
    return { date: t, state: states.get(t) ?? "missed" };
  });
  return { streak, doneToday, week, best: Math.max(past.best, streak) };
}
