import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, BookOpen, Dumbbell, LineChart, MessagesSquare, Target } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { getGrowProfile, growSessions } from "@/lib/grow/profile";
import { TRACKS } from "@/lib/grow/tracks";
import { DOMAINS } from "@/lib/framework/data";
import { isLocale } from "@/i18n/config";
import type { ReportContent } from "@/lib/hire/report-types";
import { startBaselineAction } from "@/app/actions/grow";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { SkillRadar } from "@/components/report/charts";
import { PracticeLauncher } from "@/components/grow/practice-launcher";

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
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";
  const profile = await getGrowProfile(viewer.user.id);
  if (!profile) redirect("/app/grow/onboarding");
  const sessions = await growSessions(viewer.user.id);
  const inProgress = sessions.find((s) => ["STARTED", "IN_PROGRESS", "PAUSED"].includes(s.status));
  const latest = sessions.find((s) => s.report?.status === "READY");
  const report = (latest?.report?.content as unknown as ReportContent) ?? null;
  const plan = report?.narrative.plan ?? [];
  const enrollments = await withTenant({ userId: viewer.user.id }, (tx) => tx.trackEnrollment.findMany({ where: { userId: viewer.user.id }, include: { track: true } }));
  const daysSince = latest?.report ? daysAgo(latest.report.createdAt) : null;
  const nameOf = (k: string) => DOMAINS.flatMap((d) => d.subSkills).find((s) => s.key === k)?.name[locale] ?? k;
  const today = plan[0]?.skillKey ?? "judgment.trade-off-reasoning";

  return (
    <PageContainer className="max-w-6xl">
      <PageHeader title={t("homeTitle", { name: viewer.user.name.split(" ")[0] ?? "" })} description={t("homeSubtitle", { goal: profile.goal })} />
      <Alert tone="neutral" className="mb-8">{t("private")}</Alert>

      {!report ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{inProgress ? t("baseline.resumeTitle") : t("baseline.title")}</CardTitle>
            <CardDescription>{t("baseline.body")}</CardDescription>
          </CardHeader>
          <CardContent>
            {inProgress ? (
              <Button asChild size="lg">
                <Link href={`/grow/session/${inProgress.id}`}>{t("baseline.resume")}</Link>
              </Button>
            ) : (
              <form action={startBaselineAction}>
                <Button size="lg" type="submit">
                  <Target aria-hidden />
                  {t("baseline.start")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Dumbbell className="size-4 text-accent-text" aria-hidden />{t("today.title")}</CardTitle>
              <CardDescription>{report ? t("today.body", { skill: nameOf(today) }) : t("today.bodyNoReport")}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <PracticeLauncher skillKey={today} label={t("today.start")} />
              <Button asChild variant="ghost">
                <Link href="/app/grow/practice">{t("today.choose")}</Link>
              </Button>
            </CardContent>
          </Card>

          {plan.length ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("focus.title")}</CardTitle>
                <CardDescription>{t("focus.body")}</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="flex flex-col gap-4">
                  {plan.map((p, i) => (
                    <li key={p.skillKey} className="flex gap-3">
                      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-xs font-semibold text-accent-text tabular">{i + 1}</span>
                      <span className="flex flex-col gap-1">
                        <span className="font-medium text-text">{nameOf(p.skillKey)}</span>
                        <span className="text-sm text-secondary" dir="auto">{p.why}</span>
                        <span className="text-sm text-secondary" dir="auto"><span className="text-tertiary">{t("focus.thirty")} </span>{p.days30}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="size-4 text-accent-text" aria-hidden />{t("tracks.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {TRACKS.slice(0, 4).map((tr) => {
                const e = enrollments.find((x) => x.track.key === tr.key);
                return (
                  <Link key={tr.key} href={`/app/grow/tracks/${tr.key}`} className="rounded-control border border-border p-3 hover:border-border-strong focus-visible:outline-2 focus-visible:outline-focus">
                    <span className="block text-sm font-medium text-text">{tr.name[locale]}</span>
                    <span className="block text-xs text-secondary">{e ? t("tracks.progress", { done: e.completedSessions, total: tr.sessions.length }) : t("tracks.sessions", { n: tr.sessions.length })}</span>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          {report ? (
            <Card>
              <CardHeader>
                <CardTitle>{t("snapshot.title")}</CardTitle>
                <CardDescription>{daysSince !== null ? t("snapshot.when", { days: daysSince }) : null}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <SkillRadar data={report.domains.map((d) => ({ key: d.key, label: d.name.split(/[\s/]+/)[0]!, values: { c: d.estimate } }))} series={[{ key: "c", label: viewer.user.name }]} label={t("snapshot.title")} />
                <Button asChild variant="secondary">
                  <Link href="/app/grow/profile">{t("snapshot.open")}<ArrowRight className="flip-rtl" aria-hidden /></Link>
                </Button>
                {daysSince !== null && daysSince >= 28 ? (
                  <form action={startBaselineAction}>
                    <Button type="submit" variant="ghost" className="w-full">{t("snapshot.reassess")}</Button>
                  </form>
                ) : daysSince !== null ? (
                  <p className="text-xs text-tertiary">{t("snapshot.nextIn", { days: 28 - daysSince })}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
          <Card>
            <CardContent className="flex flex-col gap-2">
              <Link href="/app/grow/progress" className="flex items-center gap-2 text-sm font-medium text-text hover:text-accent-text"><LineChart className="size-4" aria-hidden />{t("nav.progress")}</Link>
              <Link href="/app/grow/coach" className="flex items-center gap-2 text-sm font-medium text-text hover:text-accent-text"><MessagesSquare className="size-4" aria-hidden />{t("nav.coach")}</Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageContainer>
  );
}
