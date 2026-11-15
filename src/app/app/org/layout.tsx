import { getTranslations } from "next-intl/server";
import { requireViewer, viewerCan } from "@/lib/auth/session";
import { SectionNavOrg } from "@/components/app/section-navs";

const ORG_TABS = [
  { href: "/app/org/members", key: "members", permission: null },
  { href: "/app/org/library", key: "library", permission: "framework.edit" },
  { href: "/app/org/fairness", key: "fairness", permission: "fairness.view" },
  { href: "/app/org/integrations", key: "integrations", permission: "org.settings" },
  { href: "/app/org/audit", key: "audit", permission: "audit.view" },
  { href: "/app/org/settings", key: "settings", permission: "org.settings" },
] as const;

export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  const t = await getTranslations("shell");
  const tabs = ORG_TABS.filter((x) => !x.permission || viewerCan(viewer, x.permission)).map((x) => ({ href: x.href, label: t(`nav.${x.key}`) }));
  return (
    <>
      <SectionNavOrg title={viewer.activeOrganization?.name ?? t("nav.organization")} tabs={tabs} />
      {children}
    </>
  );
}
