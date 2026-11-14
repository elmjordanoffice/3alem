import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requirePermission } from "@/lib/auth/session";
import { aiMode } from "@/lib/ai/run";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { NewAssessmentForm } from "@/components/recruiter/new-assessment-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("assessments.newPage");
  return { title: t("title") };
}

export default async function NewAssessmentPage() {
  await requirePermission("assessment.create");
  const t = await getTranslations("assessments.newPage");
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title={t("title")} description={t("description")} />
      <NewAssessmentForm aiMode={aiMode()} />
    </PageContainer>
  );
}
