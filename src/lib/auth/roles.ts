import type { OrgRole } from "@/generated/prisma/enums";

/**
 * Role model
 *
 * - Every signed-in person is a Candidate / Individual (Grow is always theirs).
 * - Organisation roles come from Membership.roles; a person can hold several.
 * - Platform admin is User.isPlatformAdmin and is never set from the client.
 */

export const ORG_ROLES = ["ORG_ADMIN", "RECRUITER", "HIRING_MANAGER", "TEAM_MANAGER"] as const satisfies readonly OrgRole[];

export const PERMISSIONS = [
  "assessment.create",
  "assessment.view",
  "candidate.invite",
  "candidate.view",
  "report.view",
  "report.share",
  "team.manage",
  "team.view",
  "org.settings",
  "members.manage",
  "framework.edit",
  "itembank.review",
  "audit.view",
  "fairness.view",
  // Plan, payment and invoices (D-066). Org admins only.
  "billing.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<OrgRole, readonly Permission[]> = {
  ORG_ADMIN: PERMISSIONS,
  RECRUITER: [
    "assessment.create",
    "assessment.view",
    "candidate.invite",
    "candidate.view",
    "report.view",
    "report.share",
  ],
  HIRING_MANAGER: ["assessment.view", "candidate.view", "report.view"],
  TEAM_MANAGER: ["team.manage", "team.view"],
};

export interface AccessContext {
  isPlatformAdmin: boolean;
  /** Roles in the active organisation; empty when acting as an individual. */
  roles: readonly OrgRole[];
}

export function permissionsFor(roles: readonly OrgRole[]): Set<Permission> {
  const set = new Set<Permission>();
  for (const role of roles) for (const p of ROLE_PERMISSIONS[role]) set.add(p);
  return set;
}

/** Platform admins can support any organisation; otherwise roles decide. */
export function can(ctx: AccessContext, permission: Permission): boolean {
  if (ctx.isPlatformAdmin) return true;
  return permissionsFor(ctx.roles).has(permission);
}

/** Org admins must always keep at least one admin. */
export function wouldRemoveLastAdmin(
  members: { userId: string; roles: readonly OrgRole[] }[],
  userId: string,
  nextRoles: readonly OrgRole[],
): boolean {
  const admins = members.filter((m) => m.roles.includes("ORG_ADMIN"));
  const isAdmin = admins.some((m) => m.userId === userId);
  return isAdmin && admins.length === 1 && !nextRoles.includes("ORG_ADMIN");
}
