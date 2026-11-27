import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { OrgSettingsForm } from "@/components/app/org-settings-form";
import { RetentionCard } from "@/components/app/retention-card";
import { DeleteOrganization } from "@/components/app/delete-organization";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orgSettings");
  return { title: t("title") };
}

export default async function OrgSettingsPage() {
  const viewer = await requirePermission("org.settings");
  const t = await getTranslations("orgSettings");
  // One after the other: queries in a tenant transaction share one connection.
  const [org, inProgress] = await withTenant(tenantOf(viewer), async (tx) => [
    await tx.organization.findUniqueOrThrow({ where: { id: viewer.activeOrganization.id } }),
    await tx.assessmentSession.count({ where: { organizationId: viewer.activeOrganization.id, status: { in: ["STARTED", "IN_PROGRESS", "PAUSED"] } } }),
  ] as const);
  const isAdmin = viewer.activeOrganization.roles.includes("ORG_ADMIN");
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title={t("title")} description={t("description")} />
      <OrgSettingsForm name={org.name} brandColor={org.brandColor} dataRetentionMonths={org.dataRetentionMonths} />
      <div className="mt-6">
        <RetentionCard months={org.dataRetentionMonths} />
      </div>
      {isAdmin ? (
        <div className="mt-6">
          <DeleteOrganization name={org.name} inProgress={inProgress} />
        </div>
      ) : null}
    </PageContainer>
  );
}
