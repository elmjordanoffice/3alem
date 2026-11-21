import Link from "next/link";
import { INK_PRIMARY } from "@/components/ui/ink";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { LineChart, Lock, MessagesSquare, Target } from "lucide-react";
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
import { MomentumCard } from "@/components/grow/momentum";
import { momentumFor, momentumView } from "@/lib/grow/momentum-data";

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

  // Every skill's estimate from the latest report, for the ranges below.
  const skills = new Map((report?.domains ?? []).flatMap((d) => d.subSkills.map((x) => [x.key, x] as const)));
  const todaySkill = skills.get(today);
  const n1 = (v: number) => v.toFixed(1);

  return (
    <PageContainer className="max-w-6xl">
      <header className="mb-10">
        <h1 className="text-[2.25rem] font-semibold leading-[1.1] text-text sm:text-[2.75rem]">{t("homeTitle", { name: viewer.user.name.split(" ")[0] ?? "" })}</h1>
        <p className="mt-3 text-[15px] text-secondary">{t("homeSubtitle", { goal: profile.goal })}</p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-tertiary">
          <Lock className="size-3.5" aria-hidden />
          {t("private")}
        </p>
      </header>

      {!report ? (
        <section className="mb-10 hero-card rounded-[20px] p-7 text-ink-foreground shadow-raised sm:p-10">
          <h2 className="text-[2rem] font-semibold leading-tight">{inProgress ? t("baseline.resumeTitle") : t("baseline.title")}</h2>
          <p className="mt-3 max-w-xl text-hero-secondary">{t("baseline.body")}</p>
          <div className="mt-8">
            {inProgress ? (
              <Button asChild size="lg" className={`rounded-[10px] ${INK_PRIMARY}`}>
                <Link href={`/grow/session/${inProgress.id}`}>{t("baseline.resume")}</Link>
              </Button>
            ) : (
              <form action={startBaselineAction}>
                <Button size="lg" type="submit" className={`rounded-[10px] ${INK_PRIMARY}`}>
                  <Target aria-hidden />
                  {t("baseline.start")}
                </Button>
              </form>
            )}
          </div>
        </section>
      ) : null}

      <div className="grid gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-12">
          {/* Today: one clear thing to do. */}
          <section aria-labelledby="today-h" className="hero-card rounded-[20px] p-7 text-ink-foreground shadow-raised sm:p-9">
            <h2 id="today-h" className="font-sans text-sm font-normal tracking-normal text-hero-secondary">{t("today.title")}</h2>
            <p className="mt-2 font-display text-[2rem] font-semibold leading-tight">{report ? nameOf(today) : t("today.fallbackSkill")}</p>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-hero-secondary">{report ? t("today.body", { skill: nameOf(today) }) : t("today.bodyNoReport")}</p>
            {report && next ? (
              <p className="mt-3 inline-flex items-center gap-2 rounded-[8px] px-2.5 py-1 text-[13px] text-hero-foreground shadow-[inset_0_0_0_1px_rgb(242_240_235/0.2)]">
                <span className="size-1.5 rounded-full bg-saffron" aria-hidden />
                {next.reason.key === "rested"
                  ? t("today.why.rested", { days: next.reason.days })
                  : next.reason.key === "retry" || next.reason.key === "consolidate"
                    ? t(`today.why.${next.reason.key}`, { level: tl(String(Math.round(next.reason.level))) })
                    : t(`today.why.${next.reason.key}`)}
              </p>
            ) : null}
            {todaySkill ? (
              <div className="mt-6 max-w-md">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-hero-secondary">{t("today.now")}</span>
                  <bdi dir="ltr" className="tabular">{n1(todaySkill.range[0])}–{n1(todaySkill.range[1])}</bdi>
                </div>
                <RangeScale low={todaySkill.range[0]} high={todaySkill.range[1]} estimate={todaySkill.estimate} tone="ink" className="mt-2" />
              </div>
            ) : null}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <PracticeLauncher skillKey={today} label={t("today.start")} size="lg" className={`rounded-[10px] ${INK_PRIMARY}`} />
              <Link href="/app/grow/practice" className="rounded-control px-3 py-2 text-sm font-medium text-ink-foreground underline-offset-4 hover:underline">{t("today.choose")}</Link>
            </div>
          </section>

          {plan.length ? (
            <section aria-labelledby="focus-h">
              <h2 id="focus-h" className="text-xl font-semibold text-text">{t("focus.title")}</h2>
              <p className="mt-1 text-sm text-secondary">{t("focus.body")}</p>
              <ol className="mt-6 flex flex-col divide-y divide-border overflow-hidden rounded-card bg-surface shadow-card">
                {plan.map((p) => {
                  const sk = skills.get(p.skillKey);
                  return (
                    <li key={p.skillKey} className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_12rem] sm:items-start">
                      <div className="min-w-0">
                        <p className="font-semibold text-text">{nameOf(p.skillKey)}</p>
                        <p className="mt-1 text-sm leading-relaxed text-secondary" dir="auto">{p.why}</p>
                        <p className="mt-2 text-sm leading-relaxed text-text" dir="auto"><span className="text-tertiary">{t("focus.thirty")} </span>{p.days30}</p>
                      </div>
                      {sk ? (
                        <div className="sm:pt-1">
                          <div className="flex justify-between text-xs text-tertiary"><span>{t("focus.range")}</span><bdi dir="ltr" className="tabular">{n1(sk.range[0])}–{n1(sk.range[1])}</bdi></div>
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
              <h2 id="tracks-h" className="text-xl font-semibold text-text">{t("tracks.title")}</h2>
              <Link href="/app/grow/tracks" className="text-sm text-secondary underline-offset-4 hover:text-text hover:underline">{t("tracks.all")}</Link>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {TRACKS.slice(0, 4).map((tr) => {
                const e = enrollments.find((x) => x.track.key === tr.key);
                return (
                  <li key={tr.key}>
                    <Link href={`/app/grow/tracks/${tr.key}`} className="block h-full rounded-card bg-surface shadow-card p-4 transition-[box-shadow,background-color,color] hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-focus">
                      <span className="block font-medium text-text">{tr.name[locale]}</span>
                      <span className="mt-1 block text-xs text-secondary">{e ? t("tracks.progress", { done: e.completedSessions, total: tr.sessions.length }) : t("tracks.sessions", { n: tr.sessions.length })}</span>
                      <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-level-empty" aria-hidden>
                        <span className="block h-full rounded-full bg-level-4" style={{ width: `${e ? (e.completedSessions / tr.sessions.length) * 100 : 0}%` }} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-8">
          {report ? <MomentumCard m={momentum} /> : null}
          {report ? (
            <section aria-labelledby="snap-h" className="rounded-card bg-surface shadow-card p-5">
              <h2 id="snap-h" className="text-lg font-semibold text-text">{t("snapshot.title")}</h2>
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
          <nav aria-label={t("title")} className="flex flex-col divide-y divide-border overflow-hidden rounded-card bg-surface shadow-card">
            <Link href="/app/grow/progress" className="flex items-center gap-3 px-5 py-4 text-sm text-text transition-colors hover:bg-surface-subtle">
              <LineChart className="size-4 text-tertiary" aria-hidden />
              <span className="flex-1">
                <span className="block font-medium">{t("nav.progress")}</span>
                <span className="block text-xs text-secondary">{t("links.progress")}</span>
              </span>
            </Link>
            <Link href="/app/grow/coach" className="flex items-center gap-3 px-5 py-4 text-sm text-text transition-colors hover:bg-surface-subtle">
              <MessagesSquare className="size-4 text-tertiary" aria-hidden />
              <span className="flex-1">
                <span className="block font-medium">{t("nav.coach")}</span>
                <span className="block text-xs text-secondary">{t("links.coach")}</span>
              </span>
            </Link>
          </nav>
        </aside>
      </div>
    </PageContainer>
  );
}
