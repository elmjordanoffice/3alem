"use client";
import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ArrowRight,
  Boxes,
  BrainCircuit,
  Check,
  Code2,
  Compass,
  Handshake,
  Lightbulb,
  Megaphone,
  Moon,
  Play,
  Scale,
  Users,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { startPracticeAction } from "@/app/actions/grow";
import { useLocaleSettings, useNumbers } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MILESTONE_ICON, ReminderPicker, type MomentumView } from "./momentum";
import { PracticeLauncher } from "./practice-launcher";

/** One icon per competency domain, for skill tiles. */
export const DOMAIN_ICON: Record<string, LucideIcon> = {
  technical: Code2,
  "critical-thinking": BrainCircuit,
  judgment: Scale,
  leadership: Compass,
  management: Users,
  communication: Megaphone,
  "product-thinking": Lightbulb,
  collaboration: Handshake,
  adaptability: Waves,
};

/** Glowing orb colours, in the order skill tiles use them. */
const ORBS = [
  "bg-[radial-gradient(circle_at_32%_28%,#7ff0e3,#25c6b6_45%,#0f8f84)] shadow-[0_18px_34px_-12px_#25c6b6]",
  "bg-[radial-gradient(circle_at_32%_28%,#ffb3c2,#ff5c7c_45%,#c22a51)] shadow-[0_18px_34px_-12px_#ff5c7c]",
  "bg-[radial-gradient(circle_at_32%_28%,#9fb4f5,#3a62dc_45%,#1a3291)] shadow-[0_18px_34px_-12px_#3a62dc]",
  "bg-[radial-gradient(circle_at_32%_28%,#d8d1ff,#8b7cff_45%,#5847d6)] shadow-[0_18px_34px_-12px_#8b7cff]",
];

function SectionTitle({ id, children, aside }: { id: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="mb-4 flex min-h-9 items-center justify-between gap-4">
      <h2 id={id} className="text-xl font-bold tracking-[-0.015em] text-text">{children}</h2>
      {aside}
    </div>
  );
}

/** A ring that fills violet to teal, with the coral estimate dot at its tip. */
function GlowRing({ done, target, size = 156, label }: { done: number; target: number; size?: number; label: string }) {
  const id = React.useId().replace(/:/g, "");
  const n = useNumbers();
  const t = useTranslations("grow.overview");
  const [shown, setShown] = React.useState(0);
  const frac = Math.min(1, done / Math.max(1, target));
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(frac));
    return () => cancelAnimationFrame(raf);
  }, [frac]);
  const stroke = 10;
  const r = (size - stroke) / 2 - 6;
  const c = 2 * Math.PI * r;
  const angle = shown * 2 * Math.PI - Math.PI / 2;
  return (
    <div className="relative size-[124px] shrink-0 sm:size-[156px]">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--teal)" />
            <stop offset="100%" stopColor="var(--chart-1)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--level-empty)" strokeWidth={stroke} />
        <circle
          className="ring-arc"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#ring-${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: "drop-shadow(0 0 8px var(--chart-1))" }}
        />
        {done > 0 ? (
          <circle
            className="ring-arc"
            cx={size / 2 + r * Math.cos(angle)}
            cy={size / 2 + r * Math.sin(angle)}
            r={stroke / 2 + 2.5}
            fill="var(--signal)"
            stroke="var(--surface)"
            strokeWidth={2}
            style={{ transition: "cx 1100ms var(--ease-enter), cy 1100ms var(--ease-enter)" }}
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden>
        <span className="text-[1.875rem] font-extrabold leading-none tracking-[-0.03em] text-text tabular sm:text-[2.25rem]">
          {n.number(done)}
          <span className="text-[0.6em] font-bold text-tertiary">/{n.number(target)}</span>
        </span>
        <span className="mt-1.5 text-xs font-medium text-secondary">{done >= target ? <Check className="inline size-3.5" strokeWidth={3} /> : null} {t("sessions")}</span>
      </div>
    </div>
  );
}

/** This week: the ring, the best level reached, the weekly challenge, and the next milestone. */
export function WeekCard({
  m,
  bestThisWeek,
  challenge,
}: {
  m: MomentumView;
  bestThisWeek: number | null;
  challenge: { key: string; target: number; done: number; complete: boolean };
}) {
  const t = useTranslations("grow.overview");
  const tm = useTranslations("grow.momentum");
  const tc = useTranslations("grow.challenge");
  const tl = useTranslations("levels");
  const n = useNumbers();
  const NextIcon = m.next ? MILESTONE_ICON[m.next] : null;
  const weekText = m.week.done > m.week.target ? tm("weekOver", { done: m.week.done, extra: m.week.done - m.week.target }) : tm("week", { done: m.week.done, target: m.week.target });
  return (
    <section aria-labelledby="week-h" className="flex min-w-0 flex-col">
      <SectionTitle id="week-h">{t("thisWeek")}</SectionTitle>
      <div className="flex flex-1 flex-col justify-between gap-6 rounded-card bg-surface p-6 shadow-card">
        <div className="flex items-center gap-5 sm:gap-8">
          <GlowRing done={m.week.done} target={m.week.target} label={weekText} />
          <dl className="grid min-w-0 flex-1 gap-5">
            <div className="flex gap-3">
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-[var(--chart-1)] shadow-[0_0_10px_var(--chart-1)]" aria-hidden />
              <div className="min-w-0">
                <dt className="text-sm text-secondary">{t("bestLevel")}</dt>
                <dd className="mt-0.5 text-xl font-bold tracking-[-0.01em] text-text">{bestThisWeek ? tl(String(Math.round(bestThisWeek))) : t("noneYet")}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-teal shadow-[0_0_10px_var(--teal)]" aria-hidden />
              <div className="min-w-0">
                <dt className="text-sm text-secondary">{tc("title")}</dt>
                <dd className="mt-0.5">
                  <span className="block text-xl font-bold tracking-[-0.01em] text-text tabular">{challenge.complete ? tc("done") : t("ofTarget", { done: n.number(challenge.done), target: n.number(challenge.target) })}</span>
                  <span className="block text-xs text-tertiary">{tc(`items.${challenge.key}.title`)}</span>
                </dd>
              </div>
            </div>
          </dl>
        </div>
        {m.next && NextIcon ? (
          <Link
            href="/app/grow/progress#milestones"
            className="group flex items-center gap-3 rounded-2xl bg-surface-subtle p-3 text-sm transition-colors hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-focus"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-subtle text-accent-text"><NextIcon className="size-4" aria-hidden /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-tertiary">{tm("nextUp", { unlocked: m.milestones.filter((x) => x.unlockedAt).length, total: m.milestones.length })}</span>
              <span className="block font-semibold text-text">{tm(`milestones.${m.next}.title`)}</span>
            </span>
            <span className="text-xs font-medium text-secondary">{tm("streak", { n: m.streakWeeks })}</span>
            <ArrowRight className="size-4 shrink-0 text-tertiary transition-transform group-hover:translate-x-0.5 flip-rtl" aria-hidden />
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export interface RepTile {
  skillKey: string;
  name: string;
  domain: string;
  step: number;
  level: number | null;
}

/** Today's practice and the next roadmap steps, as cards; today's is raised. */
export function RepTiles({ tiles, why }: { tiles: RepTile[]; why?: string | null }) {
  const t = useTranslations("grow.overview");
  const tl = useTranslations("levels");
  const [pending, start] = React.useTransition();
  const [which, setWhich] = React.useState<string | null>(null);
  const go = (skillKey: string) => {
    setWhich(skillKey);
    start(() => startPracticeAction({ skillKey }));
  };
  return (
    <section aria-labelledby="reps-h" className="flex min-w-0 flex-col">
      <SectionTitle id="reps-h" aside={<Link href="/app/grow/practice" className="text-sm font-medium text-accent-text underline-offset-4 hover:underline">{t("allSkills")}</Link>}>
        {t("todaysReps")}
      </SectionTitle>
      <ul className={cn("-mx-4 flex flex-1 snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 pt-10 [scrollbar-width:none] sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0", tiles.length >= 4 ? "xl:grid-cols-4" : tiles.length === 3 ? "xl:grid-cols-3" : "")}>
        {tiles.map((tile, i) => {
          const Icon = DOMAIN_ICON[tile.domain] ?? Boxes;
          const hero = i === 0;
          const busy = pending && which === tile.skillKey;
          const body = (
            <>
              <span className={cn("relative mx-auto -mt-12 mb-1 grid size-[76px] place-items-center rounded-full text-white", hero ? ORBS[3] : ORBS[(i - 1) % 3])}>
                <span className="absolute inset-[18%] rounded-full bg-white/10 blur-[2px]" aria-hidden />
                <Icon className="relative size-8" strokeWidth={1.75} aria-hidden />
              </span>
              <span className={cn("block text-center text-[15px] font-bold leading-snug", hero ? "text-hero-foreground" : "text-teal-text")} dir="auto">{tile.name}</span>
              <span className={cn("block text-center text-xs", hero ? "text-hero-secondary" : "text-tertiary")}>{hero ? t("today") : t("step", { n: tile.step })}</span>
              {hero && why ? <span className="mt-1 line-clamp-3 block text-center text-[11px] leading-snug text-hero-secondary">{why}</span> : null}
              {tile.level ? (
                <span className="mt-auto flex flex-col items-center gap-2 pt-3">
                  <span className="flex items-end gap-1" aria-hidden>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <span
                        key={v}
                        className={cn(
                          "w-2.5 rounded-full",
                          v <= Math.round(tile.level!) ? (hero ? "bg-white" : "bg-teal shadow-[0_0_8px_var(--teal)]") : hero ? "bg-white/20" : "bg-level-empty",
                        )}
                        style={{ height: `${8 + v * 4}px` }}
                      />
                    ))}
                  </span>
                  <span className={cn("block text-center text-sm font-bold", hero ? "text-hero-foreground" : "text-text")}>{tl(String(Math.round(tile.level)))}</span>
                </span>
              ) : null}
            </>
          );
          return (
            <li key={tile.skillKey} className={cn("flex w-[11.5rem] shrink-0 snap-start sm:w-auto", hero && "sm:-mt-3")}>
              {hero ? (
                <div className="hero-card flex w-full flex-col gap-1 rounded-card px-4 pb-5 pt-2" style={{ overflow: "visible" }}>
                  {body}
                  <Button
                    size="sm"
                    onClick={() => go(tile.skillKey)}
                    loading={busy}
                    className="mx-auto mt-3 rounded-full bg-white px-5 text-accent shadow-[0_10px_24px_-10px_rgb(0_0_0/0.5)] hover:bg-white/90"
                  >
                    {!busy ? <Play aria-hidden /> : null}
                    {t("start")}
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => go(tile.skillKey)}
                  disabled={pending}
                  aria-label={t("practise", { skill: tile.name })}
                  className="flex w-full flex-col gap-1 rounded-card bg-surface px-4 pb-5 pt-2 text-start shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-focus disabled:opacity-70"
                >
                  {body}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export interface GrowthWeek {
  week: string;
  sessions: number;
  best: number | null;
}

/** Your growth: sessions per week (teal) and the best level reached (violet area). */
export function GrowthChart({ weeks, daily = false }: { weeks: GrowthWeek[]; daily?: boolean }) {
  const t = useTranslations("grow.overview");
  const tl = useTranslations("levels");
  const n = useNumbers();
  const { dir } = useLocaleSettings();
  const id = React.useId().replace(/:/g, "");
  const maxSessions = Math.max(4, ...weeks.map((w) => w.sessions));
  const levelName = (v: number) => tl(String(v));
  return (
    <section aria-labelledby="growth-h" className="flex min-w-0 flex-col">
      <SectionTitle
        id="growth-h"
        aside={
          <ul className="flex items-center gap-4 text-sm" aria-hidden>
            <li className="flex items-center gap-2 font-medium text-teal-text"><span className="size-2.5 rounded-full bg-teal" />{t("legendSessions")}</li>
            <li className="flex items-center gap-2 font-medium text-accent-text"><span className="size-2.5 rounded-full bg-[var(--chart-1)]" />{t("legendBest")}</li>
          </ul>
        }
      >
        {t("growth")}
      </SectionTitle>
      <div className="flex flex-1 flex-col rounded-card bg-surface p-4 pt-6 shadow-card sm:p-6">
        <div className="min-h-72 flex-1" dir="ltr" role="img" aria-label={t(daily ? "growthLabelDays" : "growthLabel")}>
          <ResponsiveContainer>
            <ComposedChart data={weeks} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`best-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} reversed={dir === "rtl"} interval="preserveStartEnd" minTickGap={18} />
              <YAxis
                yAxisId="level"
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={levelName}
                tick={{ fill: "var(--text-tertiary)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={dir === "rtl" ? 108 : 80}
                orientation={dir === "rtl" ? "right" : "left"}
              />
              <YAxis yAxisId="sessions" domain={[0, maxSessions]} hide />
              <Tooltip
                cursor={{ stroke: "var(--chart-1)", strokeWidth: 2 }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0]?.payload as GrowthWeek | undefined;
                  if (!row) return null;
                  return (
                    <div className="rounded-2xl bg-accent px-3.5 py-2.5 text-accent-foreground shadow-raised">
                      <p className="text-xs opacity-80">{label}</p>
                      <p className="text-base font-bold">{row.best ? tl(String(Math.round(row.best))) : "–"}</p>
                      <p className="text-xs opacity-90">{t("sessionsN", { n: n.number(row.sessions) })}</p>
                    </div>
                  );
                }}
              />
              <Area
                yAxisId="level"
                type="monotone"
                dataKey="best"
                stroke="var(--chart-1)"
                strokeWidth={3}
                fill={`url(#best-${id})`}
                connectNulls
                dot={false}
                activeDot={{ r: 7, fill: "#fff", stroke: "var(--chart-1)", strokeWidth: 3 }}
                style={{ filter: "drop-shadow(0 8px 14px var(--chart-1))" }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="sessions"
                type="monotone"
                dataKey="sessions"
                stroke="var(--teal)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "var(--teal)", stroke: "var(--surface)", strokeWidth: 2 }}
                style={{ filter: "drop-shadow(0 6px 10px var(--teal))" }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="sr-only">
          <table>
            <caption>{t(daily ? "growthLabelDays" : "growthLabel")}</caption>
            <thead>
              <tr><th scope="col">{t("weekCol")}</th><th scope="col">{t("legendSessions")}</th><th scope="col">{t("legendBest")}</th></tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.week}><th scope="row">{w.week}</th><td>{w.sessions}</td><td>{w.best ? tl(String(Math.round(w.best))) : "–"}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

/** Streak and collection: two glowing tiles, the week as discs, and today's 2-minute rep. */
export function StreakCollection({
  habit,
  collected,
  total,
  skillKey,
  skillName,
  reminderHour,
}: {
  habit: { streak: number; doneToday: boolean; week: { date: string; state: "done" | "rest" | "missed" | "today" | "future" }[] };
  collected: number;
  total: number;
  skillKey: string;
  skillName: string;
  reminderHour: number | null;
}) {
  const t = useTranslations("grow.overview");
  const tr = useTranslations("grow.rep");
  const n = useNumbers();
  const { locale } = useLocaleSettings();
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  return (
    <section aria-labelledby="streak-h" className="flex min-w-0 flex-col">
      <SectionTitle id="streak-h">{t("streakCollection")}</SectionTitle>
      <div className="flex flex-1 flex-col gap-6 rounded-card bg-surface p-5 shadow-card sm:p-6">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/app/grow/progress" className="tile-blue flex flex-col items-center justify-center rounded-[20px] px-3 py-5 text-center focus-visible:outline-2 focus-visible:outline-focus">
            <span className="text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] tabular">{n.number(habit.streak)}</span>
            <span className="mt-2 text-sm font-medium">{t("dayStreak")}</span>
          </Link>
          <Link href="/app/grow/progress#collection" className="tile-teal flex flex-col items-center justify-center rounded-[20px] px-3 py-5 text-center focus-visible:outline-2 focus-visible:outline-focus">
            <span className="text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] tabular" dir="ltr">{n.number(collected)}<span className="text-[0.55em] font-bold opacity-80">/{n.number(total)}</span></span>
            <span className="mt-2 text-sm font-medium">{t("cardsCollected")}</span>
          </Link>
        </div>
        <ol className="flex justify-between gap-1" aria-label={tr("weekLabel")}>
          {habit.week.map((d) => (
            <li key={d.date} className="flex flex-col items-center gap-2" title={tr(`state.${d.state}`)}>
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full",
                  d.state === "done" && "bg-accent text-accent-foreground shadow-[0_6px_16px_-6px_var(--accent)]",
                  d.state === "rest" && "bg-surface-sunken text-secondary",
                  d.state === "missed" && "bg-surface-subtle",
                  d.state === "today" && "ring-2 ring-inset ring-signal",
                  d.state === "future" && "bg-transparent",
                )}
              >
                {d.state === "done" ? <Check className="size-4" strokeWidth={3} aria-hidden /> : d.state === "rest" ? <Moon className="size-3.5" aria-hidden /> : d.state === "today" ? <span className="size-2 rounded-full bg-signal" aria-hidden /> : d.state === "future" ? <span className="size-1 rounded-full bg-mark-muted" aria-hidden /> : null}
              </span>
              <span className="text-[11px] text-tertiary">{fmt.format(new Date(d.date))}</span>
              <span className="sr-only">{tr(`state.${d.state}`)}</span>
            </li>
          ))}
        </ol>
        <div className="mt-auto flex flex-col gap-2 rounded-2xl bg-surface-subtle p-4">
          {habit.doneToday ? (
            <p className="flex items-center gap-2 text-sm font-semibold text-text"><Check className="size-4 text-teal" aria-hidden />{tr("doneToday")}</p>
          ) : (
            <PracticeLauncher quick skillKey={skillKey} label={tr("cta")} className="w-full" />
          )}
          <p className="text-xs text-tertiary">{habit.doneToday ? tr("doneHint") : tr("hint", { skill: skillName })}</p>
          <ReminderPicker hourUtc={reminderHour} />
        </div>
      </div>
    </section>
  );
}
