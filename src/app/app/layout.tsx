import { requireViewer, viewerCan } from "@/lib/auth/session";
import { AppShell, type ShellNavItem } from "@/components/app/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireViewer();

  const workspace: ShellNavItem[] = [
    { href: "/app", labelKey: "home", icon: "home" },
    { href: "/app/framework", labelKey: "framework", icon: "framework" },
  ];
  const organization: ShellNavItem[] = [];
  if (viewer.activeOrganization) {
    organization.push({ href: "/app/org/members", labelKey: "members", icon: "members" });
    if (viewerCan(viewer, "org.settings")) {
      organization.push({ href: "/app/org/settings", labelKey: "orgSettings", icon: "orgSettings" });
    }
  }
  const account: ShellNavItem[] = [{ href: "/app/settings", labelKey: "settings", icon: "settings" }];
  if (viewer.user.isPlatformAdmin) account.push({ href: "/app/admin", labelKey: "admin", icon: "admin" });

  const nav = [
    { sectionKey: "workspace", items: workspace },
    ...(organization.length ? [{ sectionKey: "organization", items: organization }] : []),
    { sectionKey: "account", items: account },
  ];

  return (
    <AppShell
      user={{ name: viewer.user.name, email: viewer.user.email }}
      organizations={viewer.memberships.map((m) => ({ id: m.organizationId, name: m.organizationName }))}
      activeOrganizationId={viewer.activeOrganization?.id ?? null}
      nav={nav}
    >
      {children}
    </AppShell>
  );
}
