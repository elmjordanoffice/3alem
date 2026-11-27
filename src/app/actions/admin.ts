"use server";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { systemDb, withTenant } from "@/lib/db";
import { requirePermission, requireViewer, tenantOf } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { encrypt } from "@/lib/crypto";
import { WEBHOOK_EVENTS, dispatchWebhook, validateWebhookUrl } from "@/lib/webhooks";
import { saveLibraryEntry as saveEntry, type LibraryEntryInput } from "@/lib/library";
import { retentionSweep } from "@/lib/retention";
import { deleteOrganizationData, deleteSessionData, deleteUserData } from "@/lib/privacy";
import { BANK } from "@/lib/itembank";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

// ───────────── Webhooks (ATS integration) ─────────────

const webhookSchema = z.object({ url: z.string().trim().max(500), events: z.array(z.enum(WEBHOOK_EVENTS)).min(1) });

/** The signing secret is shown once, then stored encrypted. */
export async function createWebhook(input: z.input<typeof webhookSchema>): Promise<Result<{ secret: string }>> {
  const viewer = await requirePermission("org.settings");
  const p = webhookSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  const check = validateWebhookUrl(p.data.url);
  if (!check.ok) return { ok: false, error: check.error };
  const secret = `whsec_${randomBytes(24).toString("base64url")}`;
  const hook = await withTenant(tenantOf(viewer), (tx) =>
    tx.webhook.create({ data: { organizationId: viewer.activeOrganization.id, url: check.url.toString(), events: p.data.events, secretEncrypted: encrypt(secret) } }),
  );
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "webhook.created", targetType: "webhook", targetId: hook.id, metadata: { url: hook.url, events: hook.events } });
  revalidatePath("/app/org/integrations");
  return { ok: true, secret };
}

export async function setWebhookActive(id: string, active: boolean): Promise<Result> {
  const viewer = await requirePermission("org.settings");
  const { count } = await withTenant(tenantOf(viewer), (tx) => tx.webhook.updateMany({ where: { id }, data: { active } }));
  if (!count) return { ok: false, error: "notFound" };
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: active ? "webhook.enabled" : "webhook.disabled", targetType: "webhook", targetId: id });
  revalidatePath("/app/org/integrations");
  return { ok: true };
}

export async function deleteWebhook(id: string): Promise<Result> {
  const viewer = await requirePermission("org.settings");
  const { count } = await withTenant(tenantOf(viewer), (tx) => tx.webhook.deleteMany({ where: { id } }));
  if (!count) return { ok: false, error: "notFound" };
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "webhook.deleted", targetType: "webhook", targetId: id });
  revalidatePath("/app/org/integrations");
  return { ok: true };
}

/** Send a signed test event to every active webhook subscribed to report.ready. */
export async function sendTestWebhook(): Promise<Result> {
  const viewer = await requirePermission("org.settings");
  await dispatchWebhook(viewer.activeOrganization.id, "report.ready", { test: true, sessionId: "test", candidate: "Test Candidate", roleFit: "GOOD", confidence: 0.8 });
  revalidatePath("/app/org/integrations");
  return { ok: true };
}

// ───────────── Competency library ─────────────

export async function saveLibraryEntry(input: LibraryEntryInput): Promise<Result<{ id: string }>> {
  const viewer = await requirePermission("framework.edit");
  try {
    const row = await withTenant(tenantOf(viewer), (tx) => saveEntry(tx, viewer.activeOrganization.id, input));
    await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: input.id ? "library.updated" : "library.created", targetType: "competency", targetId: row.id, metadata: { key: row.key, version: row.version } });
    revalidatePath("/app/org/library");
    revalidatePath("/app/framework");
    return { ok: true, id: row.id };
  } catch {
    return { ok: false, error: "invalid" };
  }
}

export async function setLibraryEntryActive(id: string, isActive: boolean): Promise<Result> {
  const viewer = await requirePermission("framework.edit");
  const { count } = await withTenant(tenantOf(viewer), (tx) => tx.competency.updateMany({ where: { id, organizationId: viewer.activeOrganization.id }, data: { isActive } }));
  if (!count) return { ok: false, error: "notFound" };
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: isActive ? "library.restored" : "library.retired", targetType: "competency", targetId: id });
  revalidatePath("/app/org/library");
  return { ok: true };
}

// ───────────── Item bank review (platform) ─────────────

const reviewSchema = z.object({ itemKey: z.string().min(1), status: z.enum(["active", "retired"]), note: z.string().trim().max(500).optional() });

export async function reviewBankItem(input: z.input<typeof reviewSchema>): Promise<Result> {
  const viewer = await requireViewer();
  if (!viewer.user.isPlatformAdmin) return { ok: false, error: "forbidden" };
  const p = reviewSchema.safeParse(input);
  if (!p.success || !BANK.some((b) => b.id === p.data.itemKey)) return { ok: false, error: "invalid" };
  const data = { status: p.data.status, note: p.data.note || null, reviewedById: viewer.user.id, reviewedAt: new Date() };
  await systemDb.bankItemReview.upsert({ where: { itemKey: p.data.itemKey }, create: { itemKey: p.data.itemKey, ...data }, update: data });
  await audit({ actorUserId: viewer.user.id, action: `itembank.${p.data.status === "retired" ? "retired" : "restored"}`, targetType: "bank_item", targetId: p.data.itemKey, metadata: { note: p.data.note ?? null } });
  revalidatePath("/app/admin/items");
  return { ok: true };
}

// ───────────── Retention and data rights ─────────────

export async function runRetentionNow(): Promise<Result<{ deleted: number }>> {
  const viewer = await requirePermission("org.settings");
  const { deleted } = await retentionSweep(viewer.activeOrganization.id);
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "retention.run_manually", metadata: { deleted } });
  return { ok: true, deleted };
}

/** An organisation erases one candidate's assessment (right to erasure request, or by policy). */
export async function deleteCandidateData(sessionId: string): Promise<Result> {
  const viewer = await requirePermission("org.settings");
  const session = await withTenant(tenantOf(viewer), (tx) => tx.assessmentSession.findFirst({ where: { id: sessionId, mode: "HIRE" }, select: { id: true, templateId: true } }));
  if (!session) return { ok: false, error: "notFound" };
  await deleteSessionData(sessionId, viewer.user.id, viewer.activeOrganization.id);
  revalidatePath("/app/assessments");
  redirect(session.templateId ? `/app/assessments/${session.templateId}?deleted=1` : "/app/assessments");
}

/** A person deletes their own account and everything Aalim holds about them. */
export async function deleteMyAccount(confirmEmail: string): Promise<Result> {
  const viewer = await requireViewer();
  if (confirmEmail.trim().toLowerCase() !== viewer.user.email.toLowerCase()) return { ok: false, error: "confirmMismatch" };
  // The last admin of an organisation with other members must hand over first.
  const adminOf = await systemDb.membership.findMany({ where: { userId: viewer.user.id, roles: { has: "ORG_ADMIN" } }, select: { organizationId: true } });
  for (const m of adminOf) {
    const others = await systemDb.membership.count({ where: { organizationId: m.organizationId, userId: { not: viewer.user.id }, roles: { has: "ORG_ADMIN" } } });
    const members = await systemDb.membership.count({ where: { organizationId: m.organizationId, userId: { not: viewer.user.id } } });
    if (members > 0 && others === 0) return { ok: false, error: "lastAdmin" };
  }
  // Organisations where this person is the only member would be left with nobody to manage
  // or delete their candidates' data, so they go too.
  const soleMemberOf: string[] = [];
  for (const m of await systemDb.membership.findMany({ where: { userId: viewer.user.id }, select: { organizationId: true } })) {
    if ((await systemDb.membership.count({ where: { organizationId: m.organizationId, userId: { not: viewer.user.id } } })) === 0) soleMemberOf.push(m.organizationId);
  }
  await auth.api.signOut({ headers: await headers() }).catch(() => undefined);
  for (const organizationId of soleMemberOf) await deleteOrganizationData(organizationId, viewer.user.id);
  await deleteUserData(viewer.user.id);
  redirect("/?deleted=1");
}

/** An admin deletes the active organisation and everything in it, after typing its name. */
export async function deleteOrganization(confirmName: string): Promise<Result> {
  const viewer = await requirePermission("org.settings");
  if (!viewer.activeOrganization.roles.includes("ORG_ADMIN")) return { ok: false, error: "forbidden" };
  const org = viewer.activeOrganization;
  if (confirmName.trim().toLocaleLowerCase() !== org.name.trim().toLocaleLowerCase()) return { ok: false, error: "confirmMismatch" };
  try {
    await deleteOrganizationData(org.id, viewer.user.id);
  } catch (e) {
    console.error("[org] delete failed", e);
    return { ok: false, error: "failed" };
  }
  revalidatePath("/app", "layout");
  redirect("/app?orgDeleted=1");
}

// ───────────── Outcomes (validity) ─────────────

const outcomeSchema = z.object({ sessionId: z.string(), period: z.union([z.literal(6), z.literal(12)]), rating: z.number().int().min(1).max(5) });

/** Job performance after hire, for checking the assessment predicts what matters. */
export async function recordOutcome(input: z.input<typeof outcomeSchema>): Promise<Result> {
  const viewer = await requirePermission("report.view");
  const p = outcomeSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  const ok = await withTenant(tenantOf(viewer), async (tx) => {
    const report = await tx.report.findFirst({ where: { sessionId: p.data.sessionId, kind: "HIRE", status: "READY" }, select: { id: true } });
    if (!report) return false;
    await tx.outcomeRating.upsert({
      where: { sessionId_period: { sessionId: p.data.sessionId, period: p.data.period } },
      create: { organizationId: viewer.activeOrganization.id, sessionId: p.data.sessionId, period: p.data.period, rating: p.data.rating, ratedById: viewer.user.id },
      update: { rating: p.data.rating, ratedById: viewer.user.id },
    });
    return true;
  });
  if (!ok) return { ok: false, error: "notFound" };
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "outcome.recorded", targetType: "session", targetId: p.data.sessionId, metadata: { period: p.data.period } });
  revalidatePath(`/app/reports/${p.data.sessionId}`);
  return { ok: true };
}
