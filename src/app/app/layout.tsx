import { getTranslations } from "next-intl/server";
import { requireViewer, viewerCan } from "@/lib/auth/session";
import { AppShell, type ShellNavItem } from "@/components/app/app-shell";
import type { CommandPage } from "@/components/app/command-menu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();
  const t = await getTranslations("shell");
  const org = viewer.activeOrganization;
  const can = (p: Parameters<typeof viewerCan>[1]) => Boolean(org) && viewerCan(viewer, p);

  // A short main list; Grow, Organisation and Platform admin have their own tabs.
  const main: ShellNavItem[] = [{ href: "/app", labelKey: "home", icon: "home" }];
  if (can("assessment.view")) main.push({ href: "/app/assessments", labelKey: "assessments", icon: "assessments" });
  if (can("team.view")) main.push({ href: "/app/teams", labelKey: "teams", icon: "teams" });
  main.push({ href: "/app/grow", labelKey: "grow", icon: "grow" });
  main.push({ href: "/app/framework", labelKey: "framework", icon: "framework" });

  const manage: ShellNavItem[] = [];
  if (org) manage.push({ href: "/app/org", labelKey: "organization", icon: "orgSettings" });
  if (viewer.user.isPlatformAdmin) manage.push({ href: "/app/admin", labelKey: "admin", icon: "admin" });
  manage.push({ href: "/app/settings", labelKey: "settings", icon: "settings" });

  const nav = [
    { sectionKey: "main", items: main },
    { sectionKey: "manage", items: manage },
  ];

  // Everything reachable, for the command menu.
  const section = { grow: t("nav.grow"), org: org?.name ?? t("nav.organization"), admin: t("nav.admin") };
  const pages: CommandPage[] = [
    ...main.map((i) => ({ href: i.href, label: t(`nav.${i.labelKey}`) })),
    { href: "/app/grow/practice", label: t("nav.practice"), section: section.grow },
    { href: "/app/grow/tracks", label: t("nav.tracks"), section: section.grow },
    { href: "/app/grow/progress", label: t("nav.progress"), section: section.grow },
    { href: "/app/grow/coach", label: t("nav.coach"), section: section.grow },
    ...(org ? [{ href: "/app/org/members", label: t("nav.members"), section: section.org }] : []),
    ...(can("framework.edit") ? [{ href: "/app/org/library", label: t("nav.library"), section: section.org }] : []),
    ...(can("fairness.view") ? [{ href: "/app/org/fairness", label: t("nav.fairness"), section: section.org }] : []),
    ...(can("org.settings") ? [{ href: "/app/org/integrations", label: t("nav.integrations"), section: section.org }, { href: "/app/org/settings", label: t("nav.orgSettings"), section: section.org }] : []),
    ...(can("audit.view") ? [{ href: "/app/org/audit", label: t("nav.audit"), section: section.org }] : []),
    ...(viewer.user.isPlatformAdmin ? [{ href: "/app/admin", label: t("nav.admin") }, { href: "/app/admin/items", label: t("nav.items"), section: section.admin }] : []),
    { href: "/app/settings", label: t("nav.settings") },
  ];

  return (
    <AppShell
      user={{ name: viewer.user.name, email: viewer.user.email }}
      organizations={viewer.memberships.map((m) => ({ id: m.organizationId, name: m.organizationName }))}
      activeOrganizationId={org?.id ?? null}
      nav={nav}
      commandPages={pages}
      canCreateAssessment={can("assessment.create")}
    >
      {children}
    </AppShell>
  );
}
