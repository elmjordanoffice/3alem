import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { requireViewer, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { localized } from "@/lib/i18n/localized";
import { isLocale } from "@/i18n/config";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { FrameworkBrowser, type FrameworkDomainView } from "@/components/app/framework-browser";
import { EmptyState } from "@/components/ui/empty-state";
import { Layers } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("framework");
  return { title: t("title") };
}

export default async function FrameworkPage() {
  const viewer = await requireViewer();
  const t = await getTranslations("framework");
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";

  const domains = await withTenant(tenantOf(viewer), (tx) =>
    tx.competencyDomain.findMany({
      orderBy: [{ order: "asc" }],
      include: { competencies: { where: { isActive: true }, orderBy: [{ order: "asc" }, { key: "asc" }] } },
    }),
  );

  const view: FrameworkDomainView[] = domains.map((d) => ({
    key: d.key,
    order: d.order,
    name: localized(d.name, locale),
    description: localized(d.description, locale),
    highLevel: localized(d.highLevel, locale),
    generated: d.generatedFromJobDescription,
    custom: d.organizationId !== null,
    subSkills: d.competencies.map((c) => {
      const anchors = c.anchors as Record<string, unknown>;
      return {
        key: c.key,
        name: localized(c.name, locale),
        description: localized(c.description, locale),
        anchors: [1, 2, 3, 4, 5].map((l) => localized(anchors[String(l)], locale)),
      };
    }),
  }));

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      {view.length === 0 ? (
        <EmptyState icon={Layers} title={t("emptyTitle")} description={t("emptyBody")} />
      ) : (
        <FrameworkBrowser domains={view} />
      )}
    </PageContainer>
  );
}
