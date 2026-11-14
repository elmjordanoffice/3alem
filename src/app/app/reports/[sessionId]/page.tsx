import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Loader2 } from "lucide-react";
import { requirePermission, viewerCan } from "@/lib/auth/session";
import { reportForViewer } from "@/lib/hire/recruiter";
import { audit } from "@/lib/audit";
import { PageContainer } from "@/components/app/page-header";
import { HireReport } from "@/components/report/hire-report";
import { ReportActions } from "@/components/recruiter/report-actions";
import { EmptyState } from "@/components/ui/empty-state";
import { AutoRefresh } from "@/components/app/auto-refresh";

export async function generateMetadata({ params }: { params: Promise<{ sessionId: string }> }): Promise<Metadata> {
  const viewer = await requirePermission("report.view");
  const r = await reportForViewer(viewer, (await params).sessionId);
  return { title: r?.candidate.name ?? "Report" };
}

export default async function ReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const viewer = await requirePermission("report.view");
  const { sessionId } = await params;
  const r = await reportForViewer(viewer, sessionId);
  if (!r) notFound();
  const t = await getTranslations("report");
  if (r.report?.content) await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "report.viewed", targetType: "session", targetId: sessionId });

  return (
    <PageContainer className="max-w-6xl">
      {r.template ? (
        <Link href={`/app/assessments/${r.template.id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-secondary hover:text-text">
          <ArrowLeft className="size-4 flip-rtl" aria-hidden />
          {r.template.title}
        </Link>
      ) : null}
      {r.report?.content ? (
        <HireReport
          content={r.report.content}
          audience="team"
          actions={<ReportActions sessionId={sessionId} canShare={viewerCan(viewer, "report.share")} shareLinks={r.report.shareLinks} sharedWithCandidate={r.report.sharedWithCandidate} />}
        />
      ) : (
        <>
          <AutoRefresh seconds={4} />
          <EmptyState icon={Loader2} title={t("pendingTitle")} description={t("pendingBody")} />
        </>
      )}
    </PageContainer>
  );
}
