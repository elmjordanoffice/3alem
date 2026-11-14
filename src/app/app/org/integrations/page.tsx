import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { WebhooksPanel } from "@/components/admin/webhooks-panel";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("integrations");
  return { title: t("title") };
}

export default async function IntegrationsPage() {
  const viewer = await requirePermission("org.settings");
  const t = await getTranslations("integrations");
  const { hooks, deliveries } = await withTenant(tenantOf(viewer), async (tx) => ({
    hooks: await tx.webhook.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, url: true, events: true, active: true, createdAt: true } }),
    deliveries: await tx.webhookDelivery.findMany({ orderBy: { createdAt: "desc" }, take: 20, select: { id: true, webhookId: true, event: true, status: true, responseCode: true, error: true, createdAt: true } }),
  }));
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title={t("title")} description={t("description")} />
      <WebhooksPanel
        hooks={hooks.map((h) => ({ ...h, createdAt: h.createdAt.toISOString() }))}
        deliveries={deliveries.map((d) => ({ ...d, createdAt: d.createdAt.toISOString() }))}
      />
    </PageContainer>
  );
}
