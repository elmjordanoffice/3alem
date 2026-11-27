"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { OrgRole } from "@/generated/prisma/enums";
import { systemDb, withTenant } from "@/lib/db";
import { requirePermission, requireViewer, tenantOf } from "@/lib/auth/session";
import { ORG_ROLES, wouldRemoveLastAdmin } from "@/lib/auth/roles";
import { audit } from "@/lib/audit";
import { slugify } from "@/lib/utils";
import { startTrial } from "@/lib/billing";

type Result = { ok: true } | { ok: false; error: string };

const createSchema = z.object({ name: z.string().trim().min(2).max(80) });

/** Create an organisation; the creator becomes its admin and recruiter. */
export async function createOrganization(input: { name: string }): Promise<Result> {
  const viewer = await requireViewer();
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "nameLength" };

  // Creating a tenant is a system operation: no org context exists yet.
  const org = await systemDb.$transaction(async (tx) => {
    const created = await tx.organization.create({ data: { name: parsed.data.name, slug: slugify(parsed.data.name) } });
    await tx.membership.create({
      data: { organizationId: created.id, userId: viewer.user.id, roles: ["ORG_ADMIN", "RECRUITER"] },
    });
    await tx.authSession.update({ where: { id: viewer.sessionId }, data: { activeOrganizationId: created.id } });
    return created;
  });
  await audit({ organizationId: org.id, actorUserId: viewer.user.id, action: "organization.created", targetType: "organization", targetId: org.id });
  // With billing on, the free trial starts now (D-066).
  await startTrial(org.id, org.createdAt);
  revalidatePath("/app", "layout");
  redirect("/app");
}

/** Switch the organisation the person is working in. */
export async function switchOrganization(organizationId: string): Promise<Result> {
  const viewer = await requireViewer();
  if (!viewer.memberships.some((m) => m.organizationId === organizationId)) return { ok: false, error: "notMember" };
  await systemDb.authSession.update({ where: { id: viewer.sessionId }, data: { activeOrganizationId: organizationId } });
  revalidatePath("/app", "layout");
  return { ok: true };
}

const rolesSchema = z.object({
  userId: z.string().min(1),
  roles: z.array(z.enum(ORG_ROLES)).min(1),
});

export async function updateMemberRoles(input: { userId: string; roles: OrgRole[] }): Promise<Result> {
  const viewer = await requirePermission("members.manage");
  const parsed = rolesSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "rolesRequired" };

  return withTenant(tenantOf(viewer), async (tx) => {
    const members = await tx.membership.findMany({ where: { organizationId: viewer.activeOrganization.id } });
    if (!members.some((m) => m.userId === parsed.data.userId)) return { ok: false, error: "notMember" } as const;
    if (wouldRemoveLastAdmin(members, parsed.data.userId, parsed.data.roles)) return { ok: false, error: "lastAdmin" } as const;
    await tx.membership.update({
      where: { organizationId_userId: { organizationId: viewer.activeOrganization.id, userId: parsed.data.userId } },
      data: { roles: parsed.data.roles },
    });
    await audit({
      organizationId: viewer.activeOrganization.id,
      actorUserId: viewer.user.id,
      action: "membership.roles_changed",
      targetType: "user",
      targetId: parsed.data.userId,
      metadata: { roles: parsed.data.roles },
    });
    revalidatePath("/app/org/members");
    return { ok: true } as const;
  });
}

const addSchema = z.object({ email: z.email().transform((e) => e.toLowerCase()), roles: z.array(z.enum(ORG_ROLES)).min(1) });

/** Add a person who already has an Aalim account. Email invitations follow in Phase 2. */
export async function addMember(input: { email: string; roles: OrgRole[] }): Promise<Result> {
  const viewer = await requirePermission("members.manage");
  const parsed = addSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalidEmail" };

  // Looking up a person by email crosses tenants, so it uses the system client
  // and reveals nothing beyond "found / not found" to an authorised admin.
  const user = await systemDb.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (!user) return { ok: false, error: "noAccount" };

  return withTenant(tenantOf(viewer), async (tx) => {
    const existing = await tx.membership.findUnique({
      where: { organizationId_userId: { organizationId: viewer.activeOrganization.id, userId: user.id } },
    });
    if (existing) return { ok: false, error: "alreadyMember" } as const;
    await tx.membership.create({
      data: { organizationId: viewer.activeOrganization.id, userId: user.id, roles: parsed.data.roles },
    });
    await audit({
      organizationId: viewer.activeOrganization.id,
      actorUserId: viewer.user.id,
      action: "membership.added",
      targetType: "user",
      targetId: user.id,
      metadata: { roles: parsed.data.roles },
    });
    revalidatePath("/app/org/members");
    return { ok: true } as const;
  });
}

export async function removeMember(userId: string): Promise<Result> {
  const viewer = await requirePermission("members.manage");
  return withTenant(tenantOf(viewer), async (tx) => {
    const members = await tx.membership.findMany({ where: { organizationId: viewer.activeOrganization.id } });
    if (wouldRemoveLastAdmin(members, userId, [])) return { ok: false, error: "lastAdmin" } as const;
    await tx.membership.delete({
      where: { organizationId_userId: { organizationId: viewer.activeOrganization.id, userId } },
    });
    await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "membership.removed", targetType: "user", targetId: userId });
    revalidatePath("/app/org/members");
    return { ok: true } as const;
  });
}

const settingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .nullable(),
  dataRetentionMonths: z.number().int().min(1).max(60),
});

export async function updateOrganizationSettings(input: z.input<typeof settingsSchema>): Promise<Result> {
  const viewer = await requirePermission("org.settings");
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  await withTenant(tenantOf(viewer), (tx) =>
    tx.organization.update({ where: { id: viewer.activeOrganization.id }, data: parsed.data }),
  );
  await audit({
    organizationId: viewer.activeOrganization.id,
    actorUserId: viewer.user.id,
    action: "organization.settings_changed",
    metadata: parsed.data,
  });
  revalidatePath("/app", "layout");
  return { ok: true };
}
