"use client";
import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Award, Check, CalendarCheck, Flame, Footprints, Mountain, NotebookPen, Orbit, Undo2, type LucideIcon } from "lucide-react";
import type { MilestoneKey } from "@/lib/grow/momentum";
import { useLocaleSettings, useNumbers } from "@/components/providers";
import { cn } from "@/lib/utils";

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
          <span className={cn("size-3 rounded-full", d ? "bg-text" : i === today ? "ring-[1.5px] ring-text ring-inset" : "bg-level-empty")} />
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
        <span key={i} className={cn("h-[5px] rounded-full", 2 - i < weeks ? "bg-text" : "bg-level-empty")} style={{ width: `${w * 22}px` }} />
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
                done ? "bg-text text-background" : next ? "border border-dashed border-text bg-surface" : "border border-border bg-surface/60 text-tertiary",
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

/** A little burst of vermilion dots, once. */
export function Burst({ count = 10, distance = 38, delay = 200 }: { count?: number; distance?: number; delay?: number }) {
  return (
    <span className="joy-burst" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} style={{ "--a": `${(360 / count) * i}deg`, "--d": `${distance + (i % 3) * 8}px`, "--delay": `${delay + (i % 2) * 60}ms` } as React.CSSProperties} />
      ))}
    </span>
  );
}

/** Right after a practice result: a level gained, milestones unlocked, the week moving. */
export function PracticeCelebration({ c }: { c: CelebrationView }) {
  const t = useTranslations("grow.momentum");
  const weekText = useWeekText();
  const tl = useTranslations("levels");
  const goalJustMet = c.week.done === c.week.target;
  const big = Boolean(c.improved || c.unlocked.length || goalJustMet);
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
            {c.improved ? t("celebrate.levelUp") : goalJustMet ? t("goalMet") : t("celebrate.unlocked")}
          </h2>
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
      </div>
    </section>
  );
}
