import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import { reportForViewer } from "@/lib/hire/recruiter";
import { HireReport } from "@/components/report/hire-report";
import { Logo } from "@/components/brand/logo";

export const dynamic = "force-dynamic";

/** Print layout for PDF export: every section expanded, no navigation. */
export default async function PrintReport({ params }: { params: Promise<{ sessionId: string }> }) {
  const viewer = await requirePermission("report.view");
  const r = await reportForViewer(viewer, (await params).sessionId);
  if (!r?.report?.content) notFound();
  return (
    <div className="mx-auto max-w-[820px] bg-background px-8 py-8">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <Logo showArabic={false} />
        <span className="text-xs text-tertiary">{viewer.activeOrganization.name}</span>
      </div>
      <HireReport content={r.report.content} audience="print" />
    </div>
  );
}
