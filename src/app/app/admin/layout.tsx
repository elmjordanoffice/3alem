import { getTranslations } from "next-intl/server";
import { SectionNavAdmin } from "@/components/app/section-navs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("shell");
  return (
    <>
      <SectionNavAdmin title={t("nav.admin")} tabs={[{ href: "/app/admin", label: t("nav.overview"), exact: true }, { href: "/app/admin/items", label: t("nav.itemBank") }]} />
      {children}
    </>
  );
}
