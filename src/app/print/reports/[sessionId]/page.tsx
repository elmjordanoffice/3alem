import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import { reportForViewer } from "@/lib/hire/recruiter";
import { reviewForViewer } from "@/lib/hire/review";
import { HireReport } from "@/components/report/hire-report";
import { Logo } from "@/components/brand/logo";
import { AutoPrint } from "@/components/report/auto-print";

export const dynamic = "force-dynamic";

/** Print layout for PDF export: every section expanded, no navigation. */
export default async function PrintReport({ params, searchParams }: { params: Promise<{ sessionId: string }>; searchParams: Promise<{ print?: string }> }) {
  const viewer = await requirePermission("report.view");
  const r = await reportForViewer(viewer, (await params).sessionId);
  const rvState = r ? await reviewForViewer(viewer, r.session.id) : null;
  if (!r?.report?.content) notFound();
  return (
    <div className="mx-auto max-w-[820px] bg-background px-8 py-8">
      {(await searchParams).print === "1" ? <AutoPrint /> : null}
      <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
        <Logo showArabic={false} />
        <span className="text-xs text-tertiary">{viewer.activeOrganization.name}</span>
      </div>
      <HireReport content={r.report.content} audience="print" review={{ sessionId: r.session.id, state: rvState?.review ?? null, adjustments: rvState?.adjustments ?? [], editable: false }} />
    </div>
  );
}
