import Link from "next/link";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { formatNumber } from "@/lib/i18n/format";
import { RolePipelineList } from "@/components/recruiter/role-pipeline";
import { ClipboardList, Plus } from "lucide-react";
import { requirePermission, viewerCan } from "@/lib/auth/session";
import { listAssessments } from "@/lib/hire/recruiter";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormattedNumber } from "@/components/app/formatted";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("assessments");
  return { title: t("title") };
}

export default async function AssessmentsPage() {
  const viewer = await requirePermission("assessment.view");
  const t = await getTranslations("assessments");
  const th = await getTranslations("home");
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const fmt = (v: number) => formatNumber(v, locale, viewer.user.numerals === "arab" ? "arab" : "latn");
  const list = await listAssessments(viewer);
  const canCreate = viewerCan(viewer, "assessment.create");
  const totals = list.reduce((a, r) => ({ open: a.open + (r.status === "PUBLISHED" ? 1 : 0), invited: a.invited + r.counts.invited, inProgress: a.inProgress + r.counts.inProgress, completed: a.completed + r.counts.completed, review: a.review + r.counts.awaitingReview }), { open: 0, invited: 0, inProgress: 0, completed: 0, review: 0 });

  return (
    <PageContainer className="max-w-6xl">
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={
          canCreate ? (
            <Button asChild>
              <Link href="/app/assessments/new">
                <Plus aria-hidden />
                {t("new")}
              </Link>
            </Button>
          ) : null
        }
      />
      <dl className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {([
          ["open", totals.open],
          ["invited", totals.invited],
          ["inProgress", totals.inProgress],
          ["completed", totals.completed],
          ["review", totals.review],
        ] as const).map(([k, v], i) => (
          <div key={k} className={i === 4 ? "tile-violet flex flex-col gap-1 p-4" : i === 3 ? "tile-teal flex flex-col gap-1 p-4" : "flex flex-col gap-1 rounded-[20px] bg-surface p-4 shadow-card"}>
            <dt className={i >= 3 ? "text-xs font-medium text-white/85" : "text-xs text-secondary"}>{t(`stats.${k}`)}</dt>
            <dd className={i >= 3 ? "text-[1.75rem] font-extrabold tracking-[-0.02em] text-white tabular" : "text-[1.75rem] font-extrabold tracking-[-0.02em] text-text tabular"}>
              <FormattedNumber value={v} />
            </dd>
          </div>
        ))}
      </dl>

      {list.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t("emptyTitle")}
          description={t("emptyBody")}
          action={
            canCreate ? (
              <Button asChild>
                <Link href="/app/assessments/new">{t("new")}</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <RolePipelineList
          roles={list}
          n={fmt}
          labels={{
            status: (st) => t(`status.${st}` as "status.DRAFT"),
            completedOf: (done, total) => th("roles.completedOf", { done, total }),
            segment: (k, v) => th(`roles.${k}`, { n: v }),
            noCandidates: th("roles.noCandidates"),
            minutes: (v) => t("minutes", { n: v }),
          }}
        />
      )}
    </PageContainer>
  );
}
