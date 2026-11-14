import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { libraryEntryAsSkill, listLibrary } from "@/lib/library";
import { assessmentDetail } from "@/lib/hire/recruiter";
import { DOMAINS } from "@/lib/framework/data";
import { isLocale } from "@/i18n/config";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { SetupForm } from "@/components/recruiter/setup-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("setup");
  return { title: t("title") };
}

export default async function SetupPage({ params }: { params: Promise<{ id: string }> }) {
  const viewer = await requirePermission("assessment.create");
  const { id } = await params;
  const detail = await assessmentDetail(viewer, id);
  if (!detail) notFound();
  const t = await getTranslations("setup");
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";
  const locked = detail.template.status === "PUBLISHED" && detail.candidates.length > 0;
  const library = (await withTenant(tenantOf(viewer), (tx) => listLibrary(tx, viewer.activeOrganization.id)))
    .filter((e) => e.isActive)
    .map((e) => ({ ...libraryEntryAsSkill(e, locale), domainName: DOMAINS.find((d) => d.key === e.domain)?.name[locale] ?? e.domain }));
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title={t("title")} description={t("description")} />
      <SetupForm
        id={detail.template.id}
        status={detail.template.status}
        locked={locked}
        library={library}
        initial={{
          title: detail.template.title,
          seniority: detail.analysis?.seniority ?? "mid",
          summary: detail.analysis?.summary ?? "",
          industry: detail.analysis?.industry ?? "",
          source: detail.analysis?.source ?? "offline",
          flags: detail.analysis?.flags ?? [],
          acknowledgedFlags: Boolean((detail.analysis as { flagsAcknowledged?: boolean } | null)?.flagsAcknowledged),
          durationMinutes: detail.template.durationMinutes,
          language: detail.template.language === "ar" ? "ar" : "en",
          accommodations: detail.accommodations,
          domains: DOMAINS.map((d) => ({
            key: d.key,
            name: d.name[locale],
            description: d.description[locale],
            importance: (detail.weights.find((w) => w.skillKey === d.key)?.importance ?? "BASELINE") as "MUST_HAVE" | "NICE_TO_HAVE" | "BASELINE",
            rationale: detail.analysis?.domainWeights.find((w) => w.domain === d.key)?.rationale ?? "",
          })),
          technical: detail.technicalSkills.map((s) => ({ ...s, importance: (detail.weights.find((w) => w.skillKey === s.key)?.importance ?? s.importance) as "MUST_HAVE" | "NICE_TO_HAVE" | "BASELINE" })),
        }}
      />
    </PageContainer>
  );
}
