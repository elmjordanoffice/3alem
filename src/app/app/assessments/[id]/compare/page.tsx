import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { reportsForCompare } from "@/lib/hire/recruiter";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { CompareView } from "@/components/recruiter/compare-view";
import { EmptyState } from "@/components/ui/empty-state";
import { Alert } from "@/components/ui/alert";
import { Columns3 } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("compare");
  return { title: t("title") };
}

export default async function ComparePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ids?: string }> }) {
  const viewer = await requirePermission("report.view");
  const { id } = await params;
  const ids = ((await searchParams).ids ?? "").split(",").filter(Boolean).slice(0, 4);
  const t = await getTranslations("compare");
  const reports = await reportsForCompare(viewer, ids);
  return (
    <PageContainer className="max-w-6xl">
      <Link href={`/app/assessments/${id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-secondary hover:text-text">
        <ArrowLeft className="size-4 flip-rtl" aria-hidden />
        {t("back")}
      </Link>
      <PageHeader title={t("title")} description={t("description")} />
      {reports.some((r) => r.reviewPending) ? (
        <Alert tone="warning" className="mb-8" title={t("reviewPendingTitle")}>
          {t("reviewPendingBody", { names: reports.filter((r) => r.reviewPending).map((r) => r.name).join(", ") })}
        </Alert>
      ) : null}
      {reports.length < 2 ? <EmptyState icon={Columns3} title={t("emptyTitle")} description={t("emptyBody")} /> : <CompareView reports={reports} />}
    </PageContainer>
  );
}
