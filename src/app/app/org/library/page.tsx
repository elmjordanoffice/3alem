import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";
import { listLibrary } from "@/lib/library";
import { DOMAINS } from "@/lib/framework/data";
import { PageContainer, PageHeader } from "@/components/app/page-header";
import { LibraryEditor } from "@/components/admin/library-editor";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("library");
  return { title: t("title") };
}

export default async function LibraryPage() {
  const viewer = await requirePermission("framework.edit");
  const t = await getTranslations("library");
  const locale = (await getLocale()) === "ar" ? "ar" : "en";
  const entries = await withTenant(tenantOf(viewer), (tx) => listLibrary(tx, viewer.activeOrganization.id));
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title={t("title")} description={t("description")} />
      <LibraryEditor entries={entries} domains={DOMAINS.map((d) => ({ key: d.key, name: d.name[locale] }))} />
    </PageContainer>
  );
}
