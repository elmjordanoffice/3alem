import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { OrgRole } from "@/generated/prisma/enums";
import { auth } from "./auth";
import { systemDb } from "@/lib/db";
import { can, type Permission } from "./roles";

export interface Viewer {
  user: { id: string; name: string; email: string; locale: string; numerals: string; isPlatformAdmin: boolean };
  sessionId: string;
  /** Organisations the person belongs to. */
  memberships: { organizationId: string; organizationName: string; roles: OrgRole[] }[];
  /** The organisation they are working in, if any. */
  activeOrganization: { id: string; name: string; roles: OrgRole[] } | null;
}

/** The signed-in person, or null. Cached per request. */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  // Membership lookup is a trusted read of the person's own rows.
  const memberships = await systemDb.membership.findMany({
    where: { userId: session.user.id },
    include: { organization: { select: { name: true } } },
    orderBy: { createdAt: "asc" },
  });

  const activeId = (session.session as { activeOrganizationId?: string | null }).activeOrganizationId;
  const active = memberships.find((m) => m.organizationId === activeId) ?? memberships[0] ?? null;
  const u = session.user as typeof session.user & { locale?: string; numerals?: string; isPlatformAdmin?: boolean };

  return {
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      locale: u.locale ?? "en",
      numerals: u.numerals ?? "latn",
      isPlatformAdmin: u.isPlatformAdmin ?? false,
    },
    sessionId: session.session.id,
    memberships: memberships.map((m) => ({
      organizationId: m.organizationId,
      organizationName: m.organization.name,
      roles: m.roles,
    })),
    activeOrganization: active
      ? { id: active.organizationId, name: active.organization.name, roles: active.roles }
      : null,
  };
});

export async function requireViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in");
  return viewer;
}

export function viewerCan(viewer: Viewer, permission: Permission): boolean {
  return can(
    { isPlatformAdmin: viewer.user.isPlatformAdmin, roles: viewer.activeOrganization?.roles ?? [] },
    permission,
  );
}

/** Use in server components and actions that need a permission. */
export async function requirePermission(permission: Permission): Promise<Viewer & { activeOrganization: NonNullable<Viewer["activeOrganization"]> }> {
  const viewer = await requireViewer();
  if (!viewer.activeOrganization || !viewerCan(viewer, permission)) redirect("/app?denied=1");
  return viewer as Viewer & { activeOrganization: NonNullable<Viewer["activeOrganization"]> };
}

/** Tenant context for withTenant(). */
export function tenantOf(viewer: Viewer) {
  return { userId: viewer.user.id, organizationId: viewer.activeOrganization?.id ?? null };
}
