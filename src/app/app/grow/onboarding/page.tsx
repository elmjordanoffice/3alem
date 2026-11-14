import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requireViewer } from "@/lib/auth/session";
import { getGrowProfile } from "@/lib/grow/profile";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { GrowOnboardingForm } from "@/components/grow/onboarding-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("grow.onboarding");
  return { title: t("title") };
}

export default async function GrowOnboarding() {
  const viewer = await requireViewer();
  const t = await getTranslations("grow.onboarding");
  const p = await getGrowProfile(viewer.user.id);
  return (
    <PageContainer className="max-w-2xl">
      <PageHeader title={t("title")} description={t("description")} />
      <GrowOnboardingForm initial={p ? { currentRole: p.currentRole, experienceYears: p.experienceYears, goal: p.goal, hoursPerWeek: p.hoursPerWeek } : null} />
    </PageContainer>
  );
}
