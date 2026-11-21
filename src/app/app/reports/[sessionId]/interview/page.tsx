import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { requirePermission } from "@/lib/auth/session";
import { reportForViewer } from "@/lib/hire/recruiter";
import { interviewKit } from "@/lib/hire/interview";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { InterviewKitView } from "@/components/report/interview-kit";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ sessionId: string }> }): Promise<Metadata> {
  const viewer = await requirePermission("report.view");
  const r = await reportForViewer(viewer, (await params).sessionId);
  const t = await getTranslations("interview");
  return { title: r ? t("metaTitle", { name: r.candidate.name }) : t("title") };
}

export default async function InterviewKitPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const viewer = await requirePermission("report.view");
  const { sessionId } = await params;
  const r = await reportForViewer(viewer, sessionId);
  if (!r) notFound();
  const t = await getTranslations("interview");
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const content = r.report?.content;

  return (
    <PageContainer className="max-w-4xl">
      <Link href={`/app/reports/${sessionId}`} className="mb-6 inline-flex items-center gap-1.5 text-sm text-secondary hover:text-text print:hidden">
        <ArrowLeft className="size-4 flip-rtl" aria-hidden />
        {t("back", { name: r.candidate.name })}
      </Link>
      <PageHeader title={t("title")} description={t("description", { name: r.candidate.name, role: content?.role.title ?? r.template?.title ?? "" })} className="mb-6" />
      {content ? (
        <InterviewKitView kit={await interviewKit(viewer, sessionId, content, { candidate: r.candidate.name, role: content.role.title }, locale)} />
      ) : (
        <EmptyState icon={ClipboardList} title={t("pendingTitle")} description={t("pendingBody")} />
      )}
    </PageContainer>
  );
}
