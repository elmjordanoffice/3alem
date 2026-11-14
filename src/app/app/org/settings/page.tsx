import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { OrgSettingsForm } from "@/components/app/org-settings-form";
import { RetentionCard } from "@/components/app/retention-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orgSettings");
  return { title: t("title") };
}

export default async function OrgSettingsPage() {
  const viewer = await requirePermission("org.settings");
  const t = await getTranslations("orgSettings");
  const org = await withTenant(tenantOf(viewer), (tx) =>
    tx.organization.findUniqueOrThrow({ where: { id: viewer.activeOrganization.id } }),
  );
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title={t("title")} description={t("description")} />
      <OrgSettingsForm name={org.name} brandColor={org.brandColor} dataRetentionMonths={org.dataRetentionMonths} />
      <div className="mt-6">
        <RetentionCard months={org.dataRetentionMonths} />
      </div>
    </PageContainer>
  );
}
