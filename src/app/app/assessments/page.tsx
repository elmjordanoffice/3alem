import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ClipboardList, Plus } from "lucide-react";
import { requirePermission, viewerCan } from "@/lib/auth/session";
import { listAssessments } from "@/lib/hire/recruiter";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { FormattedNumber } from "@/components/app/formatted";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("assessments");
  return { title: t("title") };
}

export default async function AssessmentsPage() {
  const viewer = await requirePermission("assessment.view");
  const t = await getTranslations("assessments");
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
      <dl className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-5">
        {([
          ["open", totals.open],
          ["invited", totals.invited],
          ["inProgress", totals.inProgress],
          ["completed", totals.completed],
          ["review", totals.review],
        ] as const).map(([k, v]) => (
          <div key={k} className="flex flex-col gap-1 bg-surface p-4">
            <dt className="text-xs text-secondary">{t(`stats.${k}`)}</dt>
            <dd className="text-xl font-semibold text-text tabular">
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
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[640px] text-sm">
            <caption className="sr-only">{t("title")}</caption>
            <thead className="bg-surface-subtle text-xs text-secondary">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">{t("col.role")}</th>
                <th scope="col" className="px-4 py-2.5 text-start font-medium">{t("col.status")}</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium">{t("stats.invited")}</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium">{t("stats.inProgress")}</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium">{t("stats.completed")}</th>
                <th scope="col" className="px-4 py-2.5 text-end font-medium">{t("stats.review")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-surface-subtle/60">
                  <td className="px-4 py-3">
                    <Link href={r.status === "DRAFT" ? `/app/assessments/${r.id}/setup` : `/app/assessments/${r.id}`} className="font-medium text-text hover:text-accent-text hover:underline">
                      {r.title}
                    </Link>
                    <span className="block text-xs text-tertiary">{t("minutes", { n: r.durationMinutes })}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={r.status === "PUBLISHED" ? "success" : r.status === "DRAFT" ? "neutral" : "warning"}>{t(`status.${r.status}`)}</Badge>
                  </td>
                  {[r.counts.invited, r.counts.inProgress, r.counts.completed, r.counts.awaitingReview].map((v, i) => (
                    <td key={i} className="px-4 py-3 text-end tabular text-text">
                      <FormattedNumber value={v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
