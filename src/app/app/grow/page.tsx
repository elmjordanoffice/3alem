import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, LineChart, Lock, MessagesSquare, Target } from "lucide-react";
import { RangeScale } from "@/components/report/range-scale";
import { requireViewer } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { getGrowProfile, growSessions } from "@/lib/grow/profile";
import { TRACKS } from "@/lib/grow/tracks";
import { DOMAINS } from "@/lib/framework/data";
import { nextStep } from "@/lib/grow/next-step";
import { isLocale } from "@/i18n/config";
import type { ReportContent } from "@/lib/hire/report-types";
import { startBaselineAction } from "@/app/actions/grow";
import { PageContainer } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { SkillRadar } from "@/components/report/charts";
import { PracticeLauncher } from "@/components/grow/practice-launcher";
import { cn } from "@/lib/utils";
import { GrowthChart, RepTiles, StreakCollection, WeekCard, type GrowthWeek, type RepTile } from "@/components/grow/overview";
import { challengeFor, collectionFor, habitFor, momentumView, momentumFor, practiceEvents } from "@/lib/grow/momentum-data";
import { weekStartOf } from "@/lib/grow/momentum";

function daysAgo(d: Date) {
  return Math.floor((Date.now() - d.getTime()) / 86400_000);
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("grow");
  return { title: t("title") };
}

export default async function GrowHome() {
  const viewer = await requireViewer();
  const t = await getTranslations("grow");
  const tr = await getTranslations("report");
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";
  const profile = await getGrowProfile(viewer.user.id);
  if (!profile) redirect("/app/grow/onboarding");
  const sessions = await growSessions(viewer.user.id);
  const momentum = momentumView(await momentumFor(viewer.user.id, locale));
  const challenge = await challengeFor(viewer.user.id, locale);
  const daily = await habitFor(viewer.user.id, locale);
  const shelf = await collectionFor(viewer.user.id);
  const events = await practiceEvents(viewer.user.id);
  const inProgress = sessions.find((s) => ["STARTED", "IN_PROGRESS", "PAUSED"].includes(s.status));
  const latest = sessions.find((s) => s.report?.status === "READY");
  const report = (latest?.report?.content as unknown as ReportContent) ?? null;
  const plan = report?.narrative.plan ?? [];
  const enrollments = await withTenant({ userId: viewer.user.id }, (tx) => tx.trackEnrollment.findMany({ where: { userId: viewer.user.id }, include: { track: true } }));
  const daysSince = latest?.report ? daysAgo(latest.report.createdAt) : null;
  const nameOf = (k: string) => DOMAINS.flatMap((d) => d.subSkills).find((s) => s.key === k)?.name[locale] ?? k;
  // Today's focus is chosen from the plan by spacing and recent results (src/lib/grow/next-step.ts).
  const practice = await withTenant({ userId: viewer.user.id }, (tx) =>
    tx.practiceSession.findMany({ where: { userId: viewer.user.id, completedAt: { not: null } }, orderBy: { completedAt: "desc" }, take: 40, select: { competencyKeys: true, completedAt: true, feedback: true } }),
  );
  const next = nextStep(
    plan.map((p) => p.skillKey),
    practice.map((p) => ({ skillKeys: p.competencyKeys, completedAt: p.completedAt, scores: ((p.feedback as { scores?: { competencyKey: string; level: number }[] } | null)?.scores ?? []) })),
  );
  const today = next?.skillKey ?? plan[0]?.skillKey ?? "judgment.trade-off-reasoning";
  const tl = await getTranslations("levels");
  const tm = await getTranslations("grow.roadmap");

  // Every skill's estimate from the latest report, for the ranges below.
  const skills = new Map((report?.domains ?? []).flatMap((d) => d.subSkills.map((x) => [x.key, x] as const)));
  const todaySkill = skills.get(today);
  const n1 = (v: number) => v.toFixed(1);
  const domainOf = (k: string) => DOMAINS.find((d) => d.subSkills.some((x) => x.key === k))?.key ?? "";

  // Growth over time: sessions and the best level reached so far (carried forward).
  // Early on (first practice in the last three weeks) by day over two weeks; later by week over eight.
  const firstDay: 0 | 1 = locale === "ar" ? 0 : 1;
  const thisWeek = weekStartOf(new Date(), firstDay);
  const DAY = 86_400_000;
  const todayStart = Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate());
  const daily14 = !events.length || events[0]!.completedAt.getTime() > todayStart - 21 * DAY;
  const fmtLocale = locale === "ar" ? "ar-u-nu-latn" : "en";
  const labelFmt = daily14
    ? new Intl.DateTimeFormat(fmtLocale, { weekday: "short", day: "numeric", timeZone: "UTC" })
    : new Intl.DateTimeFormat(fmtLocale, { day: "numeric", month: "short", timeZone: "UTC" });
  const buckets = daily14
    ? Array.from({ length: 14 }, (_, i) => ({ start: todayStart - (13 - i) * DAY, end: todayStart - (12 - i) * DAY }))
    : Array.from({ length: 8 }, (_, i) => ({ start: thisWeek - (7 - i) * 7 * DAY, end: thisWeek - (6 - i) * 7 * DAY }));
  // The line starts where the baseline put the roadmap skills, then rises with the best level reached in practice.
  const planLevels = plan.map((p) => skills.get(p.skillKey)?.estimate).filter((v): v is number => typeof v === "number");
  const baseline = latest?.report && planLevels.length ? { at: latest.report.createdAt.getTime(), level: Math.round((planLevels.reduce((a, b) => a + b, 0) / planLevels.length) * 10) / 10 } : null;
  let runningBest: number | null = null;
  const before = events.filter((e) => e.completedAt.getTime() < buckets[0]!.start).flatMap((e) => e.levels);
  if (before.length) runningBest = Math.max(...before);
  if (baseline && baseline.at < buckets[0]!.start) runningBest = Math.max(runningBest ?? 0, baseline.level);
  const weeks: GrowthWeek[] = buckets.map((b) => {
    if (baseline && baseline.at >= b.start && baseline.at < b.end) runningBest = Math.max(runningBest ?? 0, baseline.level);
    const inside = events.filter((e) => e.completedAt.getTime() >= b.start && e.completedAt.getTime() < b.end);
    const levels = inside.flatMap((e) => e.levels);
    if (levels.length) runningBest = Math.max(runningBest ?? 0, ...levels);
    return { week: labelFmt.format(new Date(b.start)), sessions: inside.length, best: runningBest };
  });
  const thisWeekLevels = events.filter((e) => weekStartOf(e.completedAt, firstDay) === thisWeek).flatMap((e) => e.levels);
  const bestThisWeek = thisWeekLevels.length ? Math.max(...thisWeekLevels) : null;
  const why = report && next
    ? next.reason.key === "rested"
      ? t("today.why.rested", { days: next.reason.days })
      : next.reason.key === "retry" || next.reason.key === "consolidate"
        ? t(`today.why.${next.reason.key}`, { level: tl(String(Math.round(next.reason.level))) })
        : t(`today.why.${next.reason.key}`)
    : null;
  // Today's skill first, then the rest of the roadmap.
  const tiles: RepTile[] = [today, ...plan.map((p) => p.skillKey).filter((k) => k !== today)].slice(0, 4).map((k) => ({
    skillKey: k,
    name: nameOf(k),
    domain: domainOf(k),
    step: plan.findIndex((p) => p.skillKey === k) + 1,
    level: skills.get(k)?.estimate ?? null,
  }));
  const to = await getTranslations("grow.overview");

  return (
    <PageContainer className="max-w-[1180px]">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[2.25rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-text sm:text-[2.75rem]">{to("hi", { name: viewer.user.name.split(" ")[0] ?? "" })}</h1>
          <p className="mt-2 text-[15px] text-secondary" dir="auto">{to("sub", { n: daily.streak, goal: profile.goal })}</p>
        </div>
        <p className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs text-secondary shadow-card">
          <Lock className="size-3.5" aria-hidden />
          {t("private")}
        </p>
      </header>

      {!report ? (
        <section className="mb-10 hero-card rounded-card p-7 sm:p-10">
          <h2 className="text-[2rem] font-extrabold leading-tight tracking-[-0.02em]">{inProgress ? t("baseline.resumeTitle") : t("baseline.title")}</h2>
          <p className="mt-3 max-w-xl text-hero-secondary">{t("baseline.body")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {inProgress ? (
              <Button asChild size="lg" className="rounded-full bg-white text-accent hover:bg-white/90">
                <Link href={`/grow/session/${inProgress.id}`}>{t("baseline.resume")}</Link>
              </Button>
            ) : (
              <form action={startBaselineAction}>
                <Button size="lg" type="submit" className="rounded-full bg-white text-accent hover:bg-white/90">
                  <Target aria-hidden />
                  {t("baseline.start")}
                </Button>
              </form>
            )}
            <PracticeLauncher skillKey={today} label={t("today.start")} variant="ghost" className="rounded-full text-hero-foreground hover:bg-white/10 hover:text-hero-foreground" />
          </div>
        </section>
      ) : (
        <>
          <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <WeekCard m={momentum} bestThisWeek={bestThisWeek} challenge={challenge} />
            <RepTiles tiles={tiles} why={why} />
          </div>
          <div className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <GrowthChart weeks={weeks} daily={daily14} />
            <StreakCollection habit={daily} collected={shelf.cards.length} total={shelf.total} skillKey={today} skillName={nameOf(today)} reminderHour={profile.reminderHour ?? null} />
          </div>
        </>
      )}

      <div className="grid gap-x-6 gap-y-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-12">
          {plan.length ? (
            <section aria-labelledby="focus-h">
              <h2 id="focus-h" className="text-xl font-bold tracking-[-0.015em] text-text" dir="auto">{tm("title", { goal: profile.goal })}</h2>
              <p className="mt-1 text-sm text-secondary">{tm("body")}</p>
              <ol className="relative mt-6 flex flex-col gap-4">
                <span className="absolute inset-y-6 start-[2.15rem] w-px bg-gradient-to-b from-accent via-accent/40 to-transparent" aria-hidden />
                {plan.map((p, i) => {
                  const sk = skills.get(p.skillKey);
                  // How far this step has come in practice.
                  const done = practice.filter((x) => x.competencyKeys.includes(p.skillKey));
                  const best = Math.max(0, ...done.flatMap((x) => ((x.feedback as { scores?: { competencyKey: string; level: number }[] } | null)?.scores ?? []).filter((sc) => sc.competencyKey === p.skillKey).map((sc) => sc.level)));
                  return (
                    <li key={p.skillKey} className="relative grid gap-4 rounded-card bg-surface p-5 shadow-card sm:grid-cols-[2.75rem_minmax(0,1fr)_12rem] sm:items-start">
                      <span className={cn("relative grid size-11 place-items-center rounded-full text-sm font-extrabold tabular", done.length ? "bg-accent text-accent-foreground shadow-[0_8px_20px_-8px_var(--accent)]" : "bg-surface-sunken text-secondary")}>{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-accent-text">{tm("step", { n: i + 1 })}</p>
                        <p className="mt-0.5 text-[17px] font-bold text-text">{nameOf(p.skillKey)}</p>
                        <p className="mt-0.5 text-xs text-secondary">{done.length ? tm("progress", { n: done.length, level: tl(String(Math.round(best || 1))) }) : tm("notStarted")}</p>
                        <p className="mt-2 text-sm leading-relaxed text-secondary" dir="auto">{p.why}</p>
                        <p className="mt-2 text-sm leading-relaxed text-text" dir="auto"><span className="text-tertiary">{t("focus.thirty")} </span>{p.days30}</p>
                      </div>
                      {sk ? (
                        <div className="rounded-2xl bg-surface-subtle p-3 sm:mt-1">
                          <div className="flex justify-between text-xs text-tertiary"><span>{t("focus.range")}</span><bdi dir="ltr" className="font-semibold text-text tabular">{n1(sk.range[0])}–{n1(sk.range[1])}</bdi></div>
                          <RangeScale low={sk.range[0]} high={sk.range[1]} estimate={sk.estimate} size="sm" className="mt-2" />
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </section>
          ) : null}

          <section aria-labelledby="tracks-h">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="tracks-h" className="text-xl font-bold tracking-[-0.015em] text-text">{t("tracks.title")}</h2>
              <Link href="/app/grow/tracks" className="text-sm font-medium text-accent-text underline-offset-4 hover:underline">{t("tracks.all")}</Link>
            </div>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {TRACKS.slice(0, 4).map((tr, i) => {
                const e = enrollments.find((x) => x.track.key === tr.key);
                const pct = e ? (e.completedSessions / tr.sessions.length) * 100 : 0;
                return (
                  <li key={tr.key}>
                    <Link href={`/app/grow/tracks/${tr.key}`} className="group flex h-full items-center gap-4 rounded-card bg-surface p-4 shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-focus">
                      <span className={cn("grid size-12 shrink-0 place-items-center rounded-2xl text-white", ["tile-violet", "tile-blue", "tile-teal", "tile-coral"][i % 4])}>
                        <span className="text-base font-extrabold tabular">{e ? `${Math.round(pct)}%` : tr.sessions.length}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-text">{tr.name[locale]}</span>
                        <span className="mt-0.5 block text-xs text-secondary">{e ? t("tracks.progress", { done: e.completedSessions, total: tr.sessions.length }) : t("tracks.sessions", { n: tr.sessions.length })}</span>
                        <span className="mt-2.5 block h-1.5 overflow-hidden rounded-full bg-level-empty" aria-hidden>
                          <span className="block h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-tertiary transition-transform group-hover:translate-x-0.5 flip-rtl" aria-hidden />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          {report ? (
            <section aria-labelledby="snap-h" className="rounded-card bg-surface p-5 shadow-card sm:p-6">
              <h2 id="snap-h" className="text-lg font-bold text-text">{t("snapshot.title")}</h2>
              <p className="text-sm text-secondary">{daysSince !== null ? t("snapshot.when", { days: daysSince }) : null}</p>
              <SkillRadar data={report.domains.map((d) => ({ key: d.key, label: tr(`domainShort.${d.key}` as "domainShort.technical"), values: { c: d.estimate } }))} series={[{ key: "c", label: viewer.user.name }]} label={t("snapshot.title")} />
              <Button asChild variant="secondary" className="mt-2 w-full">
                <Link href="/app/grow/profile">{t("snapshot.open")}</Link>
              </Button>
              {daysSince !== null && daysSince >= 28 ? (
                <form action={startBaselineAction} className="mt-2">
                  <Button type="submit" variant="ghost" className="w-full">{t("snapshot.reassess")}</Button>
                </form>
              ) : daysSince !== null ? (
                <p className="mt-3 text-center text-xs text-tertiary">{t("snapshot.nextIn", { days: 28 - daysSince })}</p>
              ) : null}
            </section>
          ) : null}
          <nav aria-label={t("title")} className="flex flex-col gap-2 rounded-card bg-surface p-2 shadow-card">
            {[
              { href: "/app/grow/progress", icon: LineChart, title: t("nav.progress"), body: t("links.progress"), tile: "tile-blue" },
              { href: "/app/grow/coach", icon: MessagesSquare, title: t("nav.coach"), body: t("links.coach"), tile: "tile-violet" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="group flex items-center gap-3 rounded-[18px] p-3 text-sm text-text transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-focus">
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", l.tile)}><l.icon className="size-4" aria-hidden /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{l.title}</span>
                  <span className="block text-xs text-secondary">{l.body}</span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-tertiary transition-transform group-hover:translate-x-0.5 flip-rtl" aria-hidden />
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </PageContainer>
  );
}
