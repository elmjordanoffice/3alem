import Link from "next/link";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, ClipboardList, Plus, Sprout } from "lucide-react";
import { requireViewer, viewerCan, tenantOf, type Viewer } from "@/lib/auth/session";
import { homeOverview, type HomeOverview } from "@/lib/hire/recruiter";
import { nextActions, type NextAction } from "@/lib/hire/next-actions";
import { getGrowProfile } from "@/lib/grow/profile";
import { withTenant } from "@/lib/db";
import { formatNumber } from "@/lib/i18n/format";
import { PageContainer } from "@/components/app/page-header";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FitPill } from "@/components/report/fit";
import { INK_PRIMARY } from "@/components/ui/ink";
import { RolePipelineList } from "@/components/recruiter/role-pipeline";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return { title: t("title") };
}

type Fmt = { n: (v: number) => string; ago: (iso: string) => string; date: string };

async function formatters(viewer: Viewer): Promise<Fmt> {
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const nu = viewer.user.numerals === "arab" ? "arab" : "latn";
  const tag = `${locale === "ar" ? "ar" : "en-GB"}-u-nu-${nu}`;
  const rtf = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });
  const ago = (iso: string) => {
    const mins = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
    if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
    const hours = Math.round(mins / 60);
    if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
    return rtf.format(Math.round(hours / 24), "day");
  };
  return { n: (v) => formatNumber(v, locale, nu), ago, date: new Intl.DateTimeFormat(tag, { weekday: "long", day: "numeric", month: "long" }).format(new Date()) };
}

export default async function AppHome({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const viewer = await requireViewer();
  const t = await getTranslations("home");
  const { denied } = await searchParams;
  const org = viewer.activeOrganization;
  const fmt = await formatters(viewer);
  const firstName = viewer.user.name.split(" ")[0] ?? viewer.user.name;
  const hiring = Boolean(org) && viewerCan(viewer, "assessment.view");
  const overview = hiring ? await homeOverview(viewer as Parameters<typeof homeOverview>[0]) : null;
  const actions = hiring && viewerCan(viewer, "report.view") ? await nextActions(viewer as Parameters<typeof nextActions>[0]) : [];
  const teams = org && viewerCan(viewer, "team.view")
    ? await withTenant(tenantOf(viewer), (tx) => tx.team.findMany({ select: { id: true, name: true, members: { select: { status: true } } }, orderBy: { createdAt: "asc" }, take: 4 }))
    : [];
  const teamMemberships = await withTenant({ userId: viewer.user.id }, (tx) => tx.teamMember.findMany({ where: { userId: viewer.user.id, status: { in: ["CONSENTED", "ASSESSED"] } }, include: { team: { select: { name: true } } } }));
  const grow = await getGrowProfile(viewer.user.id);

  const summary = overview
    ? [
        overview.unviewed ? t("summary.unviewed", { count: overview.unviewed, n: fmt.n(overview.unviewed) }) : null,
        overview.inProgress.length ? t("summary.live", { count: overview.inProgress.length, n: fmt.n(overview.inProgress.length) }) : null,
      ].filter(Boolean)
    : [];

  return (
    <PageContainer className="max-w-6xl">
      {/* The brief: what changed and what to do next, before any list (docs/design-references.md). */}
      <section aria-labelledby="brief-h" className="hero-card mb-8 rounded-[20px] p-6 sm:p-8 lg:p-9">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="min-w-0 max-w-2xl">
            <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs text-hero-foreground">{org ? t("dateAt", { date: fmt.date, org: org.name }) : fmt.date}</p>
            <h1 id="brief-h" className="mt-4 text-[2.25rem] font-semibold leading-[1.1] sm:text-[2.75rem]">{t("greeting", { name: firstName })}</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-hero-secondary">
              {hiring ? (summary.length ? summary.join(" ") : t("summary.clear")) : org ? t("orgSubtitle", { org: org.name }) : t("personalSubtitle")}
            </p>
          </div>
          {org && viewerCan(viewer, "assessment.create") ? (
            <Button asChild size="lg" className={`rounded-[10px] px-6 ${INK_PRIMARY}`}>
              <Link href="/app/assessments/new">
                <Plus aria-hidden />
                {t("newAssessment")}
              </Link>
            </Button>
          ) : !hiring ? (
            <Button asChild size="lg" className={`rounded-[10px] ${INK_PRIMARY}`}>
              <Link href="/app/grow">
                <Sprout aria-hidden />
                {grow ? t("grow.ctaActive") : t("grow.ctaNew")}
              </Link>
            </Button>
          ) : null}
        </div>
        {overview ? (
          <dl className="mt-7 grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3">
            {([
              ["unopened", overview.unviewed, "/app/assessments"],
              ["inProgress", overview.totals.inProgress, "/app/assessments"],
              ["completed", overview.totals.completed, "/app/assessments"],
              ["decide", overview.awaitingDecision, "/app/assessments"],
            ] as const).map(([k, v, href]) => (
              <div key={k} className={cn("hero-tile relative px-4 py-3.5 transition-colors hover:bg-white/20 sm:px-5 sm:py-4", k === "unopened" && "col-span-3 bg-white/20 sm:col-span-2")}>
                <dt className="text-xs text-hero-secondary">{t(`brief.${k}`)}</dt>
                <dd className="mt-1.5 flex items-baseline gap-3">
                  <Link href={href} className={cn("font-display font-semibold leading-none tabular after:absolute after:inset-0 after:rounded-[14px] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-white", k === "unopened" ? "text-[2.5rem]" : "text-[1.6rem] sm:text-[1.85rem]")}>
                    {fmt.n(v)}
                  </Link>
                  {k === "unopened" && v > 0 ? <span className="text-sm text-hero-foreground">{t("brief.reviewCta")} →</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      {denied ? (
        <Alert tone="warning" className="mb-6" title={t("deniedTitle")}>
          {t("deniedBody")}
        </Alert>
      ) : null}

      {teamMemberships.map((m) => (
        <Alert
          key={m.id}
          tone="info"
          className="mb-6"
          title={t("teamCard.title", { team: m.team.name })}
          action={
            m.sessionId ? (
              <Button asChild size="sm" variant="secondary">
                <Link href={m.status === "ASSESSED" || m.reportSeenAt ? `/app/me/reports/${m.sessionId}` : `/grow/session/${m.sessionId}`}>{m.status === "ASSESSED" ? t("teamCard.report") : t("teamCard.continue")}</Link>
              </Button>
            ) : null
          }
        >
          {m.status === "ASSESSED" ? t("teamCard.done") : t("teamCard.pending")}
        </Alert>
      ))}

      {overview ? (
        <div className="grid gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div className="flex min-w-0 flex-col gap-12">
            {actions.length ? <NextActions actions={actions} fmt={fmt} t={t} /> : null}
            <ReviewQueue overview={overview} fmt={fmt} t={t} />
            <Roles overview={overview} fmt={fmt} t={t} canCreate={viewerCan(viewer, "assessment.create")} />
          </div>
          <aside className="flex flex-col gap-10">
            <Live overview={overview} fmt={fmt} t={t} />
            {teams.length ? (
              <section aria-labelledby="teams-h">
                <SectionTitle id="teams-h" title={t("teams.title")} href="/app/teams" linkLabel={t("teams.all")} />
                <ul className="flex flex-col gap-2">
                  {teams.map((tm) => {
                    const active = tm.members.filter((m) => m.status !== "REMOVED" && m.status !== "DECLINED");
                    const done = active.filter((m) => m.status === "ASSESSED").length;
                    return (
                      <li key={tm.id}>
                        <Link href={`/app/teams/${tm.id}`} className="block rounded-card bg-surface shadow-card px-4 py-3 transition-[box-shadow,background-color,color] hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-focus">
                          <span className="block truncate text-sm font-medium text-text">{tm.name}</span>
                          <span className="mt-2 flex items-center gap-3">
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-level-empty" aria-hidden>
                              <span className="block h-full rounded-full bg-level-4" style={{ width: `${active.length ? (done / active.length) * 100 : 0}%` }} />
                            </span>
                            <span className="shrink-0 text-xs text-secondary tabular">{t("teams.assessed", { done: fmt.n(done), total: fmt.n(active.length) })}</span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ) : null}
            <GrowCard t={t} hasProfile={Boolean(grow)} />
          </aside>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <GrowCard t={t} hasProfile={Boolean(grow)} large />
          <Link href="/app/framework" className="group flex flex-col justify-between gap-6 rounded-card bg-surface shadow-card p-6 transition-[box-shadow,background-color,color] hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-focus">
            <span>
              <span className="block font-semibold text-text">{t("links.framework.title")}</span>
              <span className="mt-1 block text-sm text-secondary">{t("links.framework.body", { count: 47 })}</span>
            </span>
            <span className="text-sm font-medium text-accent-text">{t("links.framework.cta")}</span>
          </Link>
        </div>
      )}
    </PageContainer>
  );
}

type T = Awaited<ReturnType<typeof getTranslations<"home">>>;

function SectionTitle({ id, title, count, href, linkLabel }: { id: string; title: string; count?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 id={id} className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 text-lg font-semibold text-text">
        <span className="whitespace-nowrap">{title}</span>
        {count ? <span className="whitespace-nowrap font-sans text-sm font-normal text-tertiary tabular">{count}</span> : null}
      </h2>
      {href ? (
        <Link href={href} className="shrink-0 whitespace-nowrap text-sm text-secondary underline-offset-4 hover:text-text hover:underline">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

/** The pipeline as a to-do list: the most urgent first, each one a link to where it's done. */
function NextActions({ actions, fmt, t }: { actions: NextAction[]; fmt: Fmt; t: T }) {
  const line = (a: NextAction) => {
    const others = a.count > 1 ? t("actions.others", { n: fmt.n(a.count - 1) }) : "";
    switch (a.kind) {
      case "review":
        return t("actions.review", { name: a.name, others });
      case "interview":
        return t("actions.interview", { name: a.name, others });
      case "decide":
        return t("actions.decide", { name: a.name, days: fmt.n(a.days), others });
      case "nudge":
        return t("actions.nudge", { name: a.name, days: fmt.n(a.days), others });
    }
  };
  return (
    <section aria-labelledby="actions-h">
      <SectionTitle id="actions-h" title={t("actions.title")} />
      <ol className="overflow-hidden rounded-card bg-surface shadow-card">
        {actions.map((a, i) => (
          <li key={a.kind} className="border-b border-border last:border-b-0">
            <Link href={a.href} className="group grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:px-5">
              <span className={cn("font-display text-lg font-extrabold tabular [font-stretch:125%]", i === 0 ? "text-text" : "text-tertiary")} aria-hidden>
                {fmt.n(i + 1)}
              </span>
              <span className="min-w-0">
                <span className="eyebrow block text-tertiary">{t(`actions.kind.${a.kind}`)}</span>
                <span className="mt-0.5 block text-sm text-text">{line(a)}</span>
              </span>
              <ArrowRight className="size-4 text-tertiary transition-transform group-hover:translate-x-0.5 flip-rtl" aria-hidden />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ReviewQueue({ overview, fmt, t }: { overview: HomeOverview; fmt: Fmt; t: T }) {
  const tf = (k: string) => t(`fit.${k}` as "fit.GOOD");
  return (
    <section aria-labelledby="review-h">
      <SectionTitle id="review-h" title={t("review.title")} count={overview.unviewed ? t("review.unopened", { n: fmt.n(overview.unviewed) }) : undefined} href="/app/assessments" linkLabel={t("review.all")} />
      {overview.review.length === 0 ? (
        <EmptyState icon={ClipboardList} title={t("review.emptyTitle")} description={t("review.emptyBody")} />
      ) : (
        <ul className="overflow-hidden rounded-card bg-surface shadow-card">
          {overview.review.map((r) => (
            <li key={r.sessionId} className="border-b border-border last:border-b-0">
              <Link href={`/app/reports/${r.sessionId}`} className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3.5 transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:grid-cols-[auto_minmax(0,1fr)_auto_6.5rem] sm:px-5">
                <span className="relative">
                  <Avatar name={r.name} />
                  {!r.viewed ? <span className="absolute -end-0.5 -top-0.5 size-2.5 rounded-full bg-saffron ring-2 ring-surface" aria-hidden /> : null}
                </span>
                <span className="min-w-0">
                  <span className={cn("block truncate text-sm text-text", !r.viewed && "font-semibold")}>
                    {r.name}
                    {!r.viewed ? <span className="sr-only"> ({t("review.new")})</span> : null}
                  </span>
                  <span className="block truncate text-xs text-secondary">{r.role}</span>
                </span>
                <span className="flex flex-col items-end gap-1">
                  <FitPill fit={r.fit} label={tf(r.fit)} />
                  <span className="text-[11px] text-tertiary">{r.decision ? t(`decision.${r.decision}` as "decision.HIRE") : t(`confidence.${r.confidence >= 0.75 ? "high" : r.confidence >= 0.5 ? "moderate" : "low"}`)}</span>
                </span>
                <span className="hidden text-end text-xs text-tertiary sm:block">{fmt.ago(r.readyAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Roles({ overview, fmt, t, canCreate }: { overview: HomeOverview; fmt: Fmt; t: T; canCreate: boolean }) {
  const roles = overview.roles.filter((r) => r.status !== "ARCHIVED").slice(0, 5);
  return (
    <section aria-labelledby="roles-h">
      <SectionTitle id="roles-h" title={t("roles.title")} href="/app/assessments" linkLabel={t("roles.all")} />
      {roles.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t("assessments.emptyTitle")}
          description={t("assessments.emptyBody")}
          action={canCreate ? <Button asChild><Link href="/app/assessments/new">{t("assessments.create")}</Link></Button> : undefined}
        />
      ) : (
        <RolePipelineList
          roles={roles}
          n={fmt.n}
          labels={{
            status: (st) => t(`assessments.status.${st}` as "assessments.status.DRAFT"),
            completedOf: (done, total) => t("roles.completedOf", { done, total }),
            segment: (k, v) => t(`roles.${k}`, { n: v }),
            noCandidates: t("roles.noCandidates"),
          }}
        />
      )}
    </section>
  );
}

function Live({ overview, fmt, t }: { overview: HomeOverview; fmt: Fmt; t: T }) {
  return (
    <section aria-labelledby="live-h">
      <SectionTitle id="live-h" title={t("live.title")} />
      {overview.inProgress.length === 0 ? (
        <p className="rounded-card border border-dashed border-border-strong px-4 py-5 text-sm text-secondary">{t("live.empty")}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {overview.inProgress.map((s) => (
            <li key={s.sessionId} className="flex items-start gap-3">
              <span className="relative mt-1.5 flex size-2 shrink-0" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-50 motion-reduce:animate-none" />
                <span className="relative inline-flex size-2 rounded-full bg-success" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text">{s.name}</span>
                <span className="block truncate text-xs text-secondary">{s.role}</span>
                <span className="mt-2 flex items-center gap-2">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-level-empty" aria-hidden>
                    <span className="block h-full rounded-full bg-level-3" style={{ width: `${Math.min(100, (s.minutes / s.budget) * 100)}%` }} />
                  </span>
                  <span className="shrink-0 text-[11px] text-tertiary tabular">{t("live.minutes", { done: fmt.n(s.minutes), total: fmt.n(s.budget) })}</span>
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function GrowCard({ t, hasProfile, large = false }: { t: T; hasProfile: boolean; large?: boolean }) {
  return (
    <Link
      href="/app/grow"
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-card bg-surface p-5 shadow-card transition-[box-shadow] hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
        large && "p-7",
      )}
    >
      <span className="inline-flex size-9 items-center justify-center rounded-[10px] bg-accent-subtle text-accent-text">
        <Sprout className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </span>
      <span>
        <span className={cn("block font-display font-semibold text-text", large ? "text-2xl" : "text-lg")}>{t("grow.title")}</span>
        <span className="mt-1.5 block text-sm leading-relaxed text-secondary">{hasProfile ? t("grow.bodyActive") : t("grow.bodyNew")}</span>
      </span>
      <span className="text-sm font-medium text-accent-text underline-offset-4 group-hover:underline">{hasProfile ? t("grow.ctaActive") : t("grow.ctaNew")}</span>
    </Link>
  );
}
