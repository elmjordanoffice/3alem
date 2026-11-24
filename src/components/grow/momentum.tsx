"use client";
import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Award, Bell, Check, Moon, CalendarCheck, Flame, Footprints, Mountain, NotebookPen, Orbit, Undo2, type LucideIcon } from "lucide-react";
import type { MilestoneKey } from "@/lib/grow/momentum";
import { useLocaleSettings, useNumbers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { Burst } from "@/components/brand/burst";
import { SceneArt } from "@/components/candidate/deck-cards";
import { DOMAINS } from "@/lib/framework/data";
import { PracticeLauncher } from "./practice-launcher";
import { setReminderAction } from "@/app/actions/grow";

/** Momentum as it crosses to the browser (dates as ISO strings). */
export interface MomentumView {
  week: { done: number; target: number; days: boolean[] };
  streakWeeks: number;
  total: number;
  milestones: { key: MilestoneKey; unlockedAt: string | null }[];
  next: MilestoneKey | null;
}

export interface CelebrationView {
  improved: { from: number; to: number } | null;
  unlocked: MilestoneKey[];
  week: { done: number; target: number; days: boolean[] };
  streakWeeks: number;
  repStreak?: number;
  firstToday?: boolean;
  newCard?: SceneCardView | null;
  collected?: number;
}

export interface SceneCardView {
  id: string;
  title: string;
  industry: string | null;
  skillKey: string;
  best: number;
  attempts: number;
  firstAt: string;
  difficulty: number;
}

export const MILESTONE_ICON: Record<MilestoneKey, LucideIcon> = {
  first: Footprints,
  reflective: NotebookPen,
  comeback: Undo2,
  weekGoal: CalendarCheck,
  advanced: Mountain,
  streak3: Flame,
  fullCircle: Orbit,
  ten: Award,
};

function useMounted() {
  const [m, setM] = React.useState(false);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setM(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return m;
}

/** The weekly ring: ink arc on a stone track, the vermilion dot at its tip (the brand's estimate dot). */
export function WeekRing({ done, target, size = 128, from = 0, label, tone = "paper" }: { done: number; target: number; size?: number; from?: number; label: string; tone?: "paper" | "ink" }) {
  const ink = tone === "ink";
  const n = useNumbers();
  const mounted = useMounted();
  const stroke = Math.max(8, size / 13);
  const r = (size - stroke) / 2 - 4;
  const c = 2 * Math.PI * r;
  const frac = Math.min(1, done / Math.max(1, target));
  const shown = mounted ? frac : Math.min(1, from / Math.max(1, target));
  const angle = shown * 2 * Math.PI - Math.PI / 2;
  const met = done >= target;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ink ? "rgb(242 240 235 / 0.16)" : "var(--level-empty)"} strokeWidth={stroke} />
        <circle
          className="ring-arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ink ? "var(--hero-foreground)" : "var(--text)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {done > 0 ? (
          <circle
            className="ring-arc"
            cx={size / 2 + r * Math.cos(angle)}
            cy={size / 2 + r * Math.sin(angle)}
            r={stroke / 2 + 1.5}
            fill="var(--signal)"
            style={{ transition: "cx 1100ms var(--ease-enter), cy 1100ms var(--ease-enter)" }}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
        <span className={cn("font-display text-[1.75rem] font-extrabold leading-none tabular [font-stretch:112%]", ink ? "text-hero-foreground" : "text-text")}>
          {n.number(done)}
          {done < target ? <span className={cn("text-[0.55em] font-semibold", ink ? "text-hero-secondary" : "text-tertiary")}>/{n.number(target)}</span> : null}
        </span>
        {met ? <Check className={cn("mt-1 size-4", ink ? "text-hero-foreground" : "text-text")} strokeWidth={2.5} aria-hidden /> : null}
      </div>
    </div>
  );
}

function DayDots({ days }: { days: boolean[] }) {
  const { locale } = useLocaleSettings();
  // Weeks start on Sunday in Arabic and Monday in English (see momentum.ts).
  const start = locale === "ar" ? new Date(Date.UTC(2026, 10, 15)) : new Date(Date.UTC(2026, 10, 16));
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" });
  const today = (new Date().getUTCDay() - (locale === "ar" ? 0 : 1) + 7) % 7;
  return (
    <ol className="flex gap-1.5" aria-hidden>
      {days.map((d, i) => (
        <li key={i} className="flex flex-col items-center gap-1">
          <span className={cn("size-3 rounded-full", d ? "bg-accent" : i === today ? "ring-[1.5px] ring-accent ring-inset" : "bg-level-empty")} />
          <span className="text-[10px] text-tertiary">{fmt.format(new Date(start.getTime() + i * 86_400_000))}</span>
        </li>
      ))}
    </ol>
  );
}

/** Three small bands, filled one per week of streak (the brand mark as a counter). */
function StreakBands({ weeks }: { weeks: number }) {
  return (
    <span className="flex flex-col items-center gap-[3px]" aria-hidden>
      {[0.45, 0.7, 1].map((w, i) => (
        <span key={i} className={cn("h-[5px] rounded-full", 2 - i < weeks ? "bg-accent" : "bg-level-empty")} style={{ width: `${w * 22}px` }} />
      ))}
    </span>
  );
}

/** "2 of 4 sessions this week", or past the goal "6 this week, 2 over your goal". */
function useWeekText() {
  const t = useTranslations("grow.momentum");
  return (w: { done: number; target: number }) => (w.done > w.target ? t("weekOver", { done: w.done, extra: w.done - w.target }) : t("week", { done: w.done, target: w.target }));
}

/** The overview card: this week, the streak, and the next milestone. */
export function MomentumCard({ m }: { m: MomentumView }) {
  const t = useTranslations("grow.momentum");
  const weekText = useWeekText();
  const unlocked = m.milestones.filter((x) => x.unlockedAt).length;
  const NextIcon = m.next ? MILESTONE_ICON[m.next] : null;
  return (
    <section aria-labelledby="momentum-h" className="rounded-card bg-surface p-5 shadow-card">
      <h2 id="momentum-h" className="text-lg font-semibold text-text">{t("title")}</h2>
      <div className="mt-4 flex items-center gap-5">
        <WeekRing done={m.week.done} target={m.week.target} label={weekText(m.week)} />
        <div className="flex min-w-0 flex-col gap-3">
          <p className="text-sm text-secondary">{m.week.done >= m.week.target ? <span className="font-semibold text-text">{t("goalMet")}</span> : t("weekLabel")}</p>
          <DayDots days={m.week.days} />
          <p className="flex items-center gap-2 text-sm text-text">
            <StreakBands weeks={m.streakWeeks} />
            <span className="font-semibold">{t("streak", { n: m.streakWeeks })}</span>
          </p>
        </div>
      </div>
      {m.next && NextIcon ? (
        <Link href="/app/grow/progress#milestones" className="mt-5 flex items-center gap-3 rounded-[12px] border border-dashed border-border-strong p-3 text-sm transition-colors hover:bg-surface-subtle">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-sunken text-tertiary"><NextIcon className="size-4" aria-hidden /></span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs text-tertiary">{t("nextUp", { unlocked, total: m.milestones.length })}</span>
            <span className="block font-medium text-text">{t(`milestones.${m.next}.title`)}</span>
            <span className="block text-xs text-secondary">{t(`milestones.${m.next}.how`, { target: m.week.target })}</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-tertiary flip-rtl" aria-hidden />
        </Link>
      ) : null}
    </section>
  );
}

/** Every milestone: the unlocked ones filled, the next one outlined, the rest quiet. */
export function MilestoneShelf({ m }: { m: MomentumView }) {
  const t = useTranslations("grow.momentum");
  const { locale } = useLocaleSettings();
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  return (
    <section id="milestones" aria-labelledby="milestones-h" className="scroll-mt-24">
      <h2 id="milestones-h" className="text-xl font-semibold text-text">{t("milestonesTitle")}</h2>
      <p className="mt-1 text-sm text-secondary">{t("milestonesBody")}</p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {m.milestones.map((x, i) => {
          const Icon = MILESTONE_ICON[x.key];
          const done = Boolean(x.unlockedAt);
          const next = x.key === m.next;
          return (
            <li
              key={x.key}
              style={{ "--i": i } as React.CSSProperties}
              className={cn(
                "joy-rise relative flex flex-col gap-2 rounded-card p-4",
                done ? "bg-accent text-accent-foreground" : next ? "border border-dashed border-accent bg-surface" : "border border-border bg-surface/60 text-tertiary",
              )}
            >
              <span className={cn("grid size-10 place-items-center rounded-full", done ? "bg-background/10" : "bg-surface-sunken")}>
                <Icon className={cn("size-5", done ? "text-background" : next ? "text-text" : "text-tertiary")} aria-hidden />
              </span>
              {done ? <span className="absolute end-4 top-4 size-2 rounded-full bg-saffron" aria-hidden /> : null}
              <span className={cn("font-semibold", done ? "text-background" : next ? "text-text" : "text-secondary")}>{t(`milestones.${x.key}.title`)}</span>
              <span className={cn("text-xs leading-snug", done ? "text-background/70" : "text-tertiary")}>
                {done ? t("unlockedOn", { date: date.format(new Date(x.unlockedAt!)) }) : t(`milestones.${x.key}.how`, { target: m.week.target })}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Right after a practice result: a level gained, milestones unlocked, the week moving. */
export function PracticeCelebration({ c }: { c: CelebrationView }) {
  const t = useTranslations("grow.momentum");
  const weekText = useWeekText();
  const tl = useTranslations("levels");
  const goalJustMet = c.week.done === c.week.target;
  const big = Boolean(c.improved || c.unlocked.length || goalJustMet || c.newCard);
  // An ordinary session still closes part of the ring: a light moment on paper.
  if (!big) {
    return (
      <section aria-labelledby="celebrate-h" className="joy-rise flex items-center gap-5 rounded-card bg-surface p-5 shadow-card">
        <WeekRing done={c.week.done} target={c.week.target} from={c.week.done - 1} size={84} label={weekText(c.week)} />
        <div className="min-w-0">
          <h2 id="celebrate-h" className="text-lg font-semibold text-text">{t("celebrate.done")}</h2>
          <p className="text-sm text-secondary">{weekText(c.week)}</p>
          {c.streakWeeks > 1 ? <p className="mt-1 text-sm font-medium text-text">{t("streak", { n: c.streakWeeks })}</p> : null}
        </div>
      </section>
    );
  }
  return (
    <section aria-labelledby="celebrate-h" className="hero-card joy-pop relative overflow-hidden rounded-[20px] p-6 sm:p-7">
      <div className="flex flex-wrap items-center gap-6">
        <div className="relative">
          <WeekRing tone="ink" done={c.week.done} target={c.week.target} from={c.week.done - 1} size={112} label={weekText(c.week)} />
          <Burst />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 id="celebrate-h" className="font-display text-[1.75rem] font-extrabold leading-tight [font-stretch:112%]">
            {c.improved ? t("celebrate.levelUp") : goalJustMet ? t("goalMet") : c.unlocked.length ? t("celebrate.unlocked") : t("celebrate.newCard")}
          </h2>
          {c.repStreak && c.firstToday ? <p className="text-sm font-semibold text-hero-foreground">{t("celebrate.repStreak", { n: c.repStreak })}</p> : null}
          {c.improved ? (
            <p className="flex flex-wrap items-center gap-2 text-sm text-hero-secondary">
              <span className="rounded-full px-2.5 py-0.5 shadow-[inset_0_0_0_1px_rgb(242_240_235/0.3)]">{tl(String(c.improved.from))}</span>
              <ArrowRight className="size-4 flip-rtl" aria-hidden />
              <span className="joy-pop rounded-full bg-saffron px-2.5 py-0.5 font-semibold text-[#141414]" style={{ "--i": 3 } as React.CSSProperties}>{tl(String(c.improved.to))}</span>
            </p>
          ) : null}
          <p className="text-sm text-hero-secondary">{goalJustMet ? t("celebrate.goalBody") : weekText(c.week)}</p>
          {c.unlocked.length ? (
            <ul className="mt-1 flex flex-wrap gap-2">
              {c.unlocked.map((k, i) => {
                const Icon = MILESTONE_ICON[k];
                return (
                  <li key={k} style={{ "--i": i + 2 } as React.CSSProperties} className="joy-pop hero-tile flex items-center gap-2 rounded-full py-1.5 ps-1.5 pe-3 text-sm font-medium">
                    <span className="grid size-7 place-items-center rounded-full bg-hero-foreground text-[#141414]"><Icon className="size-3.5" aria-hidden /></span>
                    {t(`milestones.${k}.title`)}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
        {c.newCard ? (
          <div className="flex flex-col items-center gap-2">
            <div className="card-reveal">
              <SceneCardFace card={c.newCard} size="sm" />
            </div>
            <p className="text-xs text-hero-secondary">{t("celebrate.collected", { n: c.collected ?? 1 })}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** This week's challenge: one varied goal, dots for progress, a small moment when it's done. */
export function ChallengeCard({ c }: { c: { key: string; target: number; done: number; complete: boolean } }) {
  const t = useTranslations("grow.challenge");
  return (
    <section aria-labelledby="challenge-h" className="relative overflow-hidden rounded-card bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="challenge-h" className="eyebrow text-tertiary">{t("title")}</h2>
          <p className="mt-1.5 text-lg font-semibold text-text">{c.complete ? t("done") : t(`items.${c.key}.title`)}</p>
          <p className="mt-0.5 text-sm text-secondary">{c.complete ? t("doneBody") : t(`items.${c.key}.how`)}</p>
        </div>
        <div className="relative shrink-0">
          <ol className="flex gap-1.5" aria-label={t("progress", { done: c.done, target: c.target })}>
            {Array.from({ length: c.target }, (_, i) => (
              <li key={i} style={{ "--i": i } as React.CSSProperties} className={cn("size-3.5 rounded-full", i < c.done ? "joy-pop bg-accent" : "ring-[1.5px] ring-inset ring-border-strong")} />
            ))}
          </ol>
          {c.complete ? <Burst count={8} distance={26} delay={300} /> : null}
        </div>
      </div>
    </section>
  );
}

/** One collected scenario: its scene art, title, skill and best level. */
export function SceneCardFace({ card, size = "md" }: { card: SceneCardView; size?: "sm" | "md" }) {
  const tl = useTranslations("levels");
  const { locale } = useLocaleSettings();
  const skill = DOMAINS.flatMap((d) => d.subSkills).find((x) => x.key === card.skillKey)?.name[locale] ?? "";
  return (
    <article className={cn("hero-card flex flex-col overflow-hidden rounded-[14px] ring-1 ring-white/10", size === "sm" ? "w-36" : "w-full")}>
      <div className={cn("relative", size === "sm" ? "h-20" : "h-28")}>
        <SceneArt seed={card.title} className="absolute inset-0 size-full" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className={cn("font-semibold leading-snug text-hero-foreground", size === "sm" ? "line-clamp-2 text-xs" : "line-clamp-2 text-sm")} dir="auto">{card.title}</p>
        <p className="line-clamp-1 text-[11px] text-hero-secondary">{skill}</p>
        {card.best ? (
          <p className="mt-auto flex items-center justify-between pt-1 text-[11px] text-hero-secondary">
            <span className="rounded-full bg-hero-foreground/10 px-1.5 py-0.5 text-hero-foreground">{tl(String(Math.round(card.best)))}</span>
            {card.attempts > 1 ? <span>×{card.attempts}</span> : null}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** Today's 2-minute rep, the streak, and this week as a strip (rest days forgiven). */
export function RepCard({ habit, skillKey, skillName, reminderHour = null }: { habit: { streak: number; doneToday: boolean; best: number; week: { date: string; state: "done" | "rest" | "missed" | "today" | "future" }[] }; skillKey: string; skillName: string; reminderHour?: number | null }) {
  const t = useTranslations("grow.rep");
  const { locale } = useLocaleSettings();
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" });
  return (
    <section aria-labelledby="rep-h" className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
          <span className="font-display text-xl font-extrabold tabular [font-stretch:112%]">{habit.streak}</span>
          {habit.doneToday ? <span className="absolute -end-0.5 -top-0.5 size-3 rounded-full bg-saffron ring-2 ring-surface" aria-hidden /> : null}
        </span>
        <div className="min-w-0">
          <h2 id="rep-h" className="text-base font-semibold text-text">{habit.streak ? t("streak", { n: habit.streak }) : t("start")}</h2>
          <ol className="mt-2 flex gap-1.5" aria-label={t("weekLabel")}>
            {habit.week.map((d) => (
              <li key={d.date} className="flex flex-col items-center gap-1" title={t(`state.${d.state}`)}>
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full",
                    d.state === "done" ? "bg-accent text-accent-foreground" : d.state === "rest" ? "bg-surface-sunken text-secondary" : d.state === "today" ? "ring-[1.5px] ring-inset ring-saffron" : d.state === "missed" ? "bg-level-empty" : "ring-1 ring-inset ring-border",
                  )}
                >
                  {d.state === "done" ? <Check className="size-3" strokeWidth={3} aria-hidden /> : d.state === "rest" ? <Moon className="size-3" aria-hidden /> : null}
                </span>
                <span className="text-[10px] text-tertiary">{fmt.format(new Date(d.date))}</span>
                <span className="sr-only">{t(`state.${d.state}`)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="flex flex-col items-start gap-1 sm:items-end">
        {habit.doneToday ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-text"><Check className="size-4" aria-hidden />{t("doneToday")}</p>
        ) : (
          <PracticeLauncher quick skillKey={skillKey} label={t("cta")} variant="primary" />
        )}
        <p className="text-xs text-tertiary">{habit.doneToday ? t("doneHint") : t("hint", { skill: skillName })}</p>
        <ReminderPicker hourUtc={reminderHour} />
      </div>
    </section>
  );
}

const LOCAL_HOURS = [7, 8, 9, 12, 17, 18, 20, 21];

/** The opt-in reminder, in the person's own time; stored as an hour in UTC. */
export function ReminderPicker({ hourUtc }: { hourUtc: number | null }) {
  const t = useTranslations("grow.rep.reminder");
  const n = useNumbers();
  const [value, setValue] = React.useState<number | null>(hourUtc);
  const [saved, setSaved] = React.useState(false);
  // Whole-hour offset of this browser (half-hour zones round to the nearest hour); UTC while rendering on the server.
  const offset = React.useSyncExternalStore(
    () => () => {},
    () => Math.round(-new Date().getTimezoneOffset() / 60),
    () => 0,
  );
  const toLocal = (u: number) => (((u + offset) % 24) + 24) % 24;
  const toUtc = (l: number) => (((l - offset) % 24) + 24) % 24;
  const local = value === null ? "off" : String(toLocal(value));
  return (
    <label className="mt-1 flex items-center gap-2 text-xs text-secondary">
      <Bell className="size-3.5" aria-hidden />
      {t("label")}
      <select
        value={local}
        onChange={async (e) => {
          const next = e.target.value === "off" ? null : toUtc(Number(e.target.value));
          setValue(next);
          setSaved(false);
          const r = await setReminderAction(next);
          if (r.ok) setSaved(true);
        }}
        className="h-7 rounded-control border border-border-strong bg-surface px-1.5 text-xs text-text"
      >
        <option value="off">{t("off")}</option>
        {[...new Set([...LOCAL_HOURS, ...(value === null ? [] : [toLocal(value)])])].sort((a, b) => a - b).map((h) => (
          <option key={h} value={String(h)}>{`${n.number(h, { minimumIntegerDigits: 2 })}:00`}</option>
        ))}
      </select>
      {saved ? <span className="text-tertiary" role="status">{t("saved")}</span> : null}
    </label>
  );
}

/** Every scenario you've practised, as cards; the rest of the library waits face down. */
export function CollectionShelf({ cards, total }: { cards: SceneCardView[]; total: number }) {
  const t = useTranslations("grow.collection");
  const shown = cards.slice(0, 15);
  const hidden = Math.max(0, Math.min(5, total - cards.length));
  return (
    <section aria-labelledby="collection-h">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="collection-h" className="text-xl font-semibold text-text">{t("title")}</h2>
        <p className="text-sm text-secondary tabular">{t("count", { n: cards.length, total })}</p>
      </div>
      <p className="mt-1 text-sm text-secondary">{t("body")}</p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {shown.map((c, i) => (
          <li key={c.id} className="joy-rise" style={{ "--i": i } as React.CSSProperties}>
            <SceneCardFace card={c} />
          </li>
        ))}
        {Array.from({ length: hidden }, (_, i) => (
          <li key={`h${i}`} className="grid min-h-48 place-items-center rounded-[14px] border border-dashed border-border-strong text-tertiary" aria-hidden>
            <span className="font-display text-2xl font-extrabold [font-stretch:112%]">?</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
