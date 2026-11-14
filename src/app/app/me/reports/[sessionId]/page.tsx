import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Loader2 } from "lucide-react";
import { requireViewer } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { markReportSeen } from "@/lib/team";
import type { ReportContent } from "@/lib/hire/report-types";
import { PageContainer } from "@/components/app/page-header";
import { HireReport } from "@/components/report/hire-report";
import { EmptyState } from "@/components/ui/empty-state";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = { title: "My report" };

/** A team member's own report. Opening it is what lets it count in the team view. */
export default async function MyReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const viewer = await requireViewer();
  const { sessionId } = await params;
  const t = await getTranslations("teamInvite");
  const r = await withTenant({ userId: viewer.user.id }, (tx) => tx.report.findFirst({ where: { sessionId, subjectUserId: viewer.user.id } }));
  const s = await withTenant({ userId: viewer.user.id }, (tx) => tx.assessmentSession.findFirst({ where: { id: sessionId, subjectUserId: viewer.user.id } }));
  if (!s) notFound();
  if (r?.status !== "READY") {
    return (
      <PageContainer>
        <AutoRefresh seconds={4} />
        <EmptyState icon={Loader2} title={t("reportPending")} description={t("reportPendingBody")} />
      </PageContainer>
    );
  }
  await markReportSeen(sessionId, viewer.user.id);
  return (
    <PageContainer className="max-w-6xl">
      <Alert tone="info" className="mb-8">{t("youFirst")}</Alert>
      <HireReport content={{ ...(r.content as unknown as ReportContent), candidate: { name: viewer.user.name } }} audience="candidate" />
    </PageContainer>
  );
}
