import "server-only";
import { systemDb } from "@/lib/db";
import { audit } from "@/lib/audit";

/** Everything Aalim holds about a person, as JSON (data portability). */
export async function exportUserData(userId: string) {
  const user = await systemDb.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, name: true, email: true, locale: true, numerals: true, createdAt: true } });
  const sessions = await systemDb.assessmentSession.findMany({
    where: { subjectUserId: userId },
    include: { responses: { select: { stage: true, content: true, submittedAt: true, itemId: true } }, report: { select: { kind: true, content: true, createdAt: true } }, items: { select: { id: true, content: true, chapter: true } } },
  });
  const [practice, coach, growProfile, plans, consents, memberships, teamMemberships] = await Promise.all([
    systemDb.practiceSession.findMany({ where: { userId } }),
    systemDb.coachMessage.findMany({ where: { userId } }),
    systemDb.growProfile.findUnique({ where: { userId } }),
    systemDb.developmentPlan.findMany({ where: { userId } }),
    systemDb.consent.findMany({ where: { userId } }),
    systemDb.membership.findMany({ where: { userId }, select: { organizationId: true, roles: true } }),
    systemDb.teamMember.findMany({ where: { userId }, select: { teamId: true, status: true, shareRawAnswers: true } }),
  ]);
  await audit({ actorUserId: userId, action: "privacy.data_exported", targetType: "user", targetId: userId });
  return { exportedAt: new Date().toISOString(), user, sessions, practice, coach, growProfile, plans, consents, memberships, teamMemberships };
}

/**
 * Delete a person and everything about them: sessions (with items, answers,
 * scores and reports), Grow data and their account. Organisation audit
 * records keep only the fact that a deletion happened.
 */
export async function deleteUserData(userId: string) {
  const orgs = (await systemDb.assessmentSession.findMany({ where: { subjectUserId: userId }, select: { organizationId: true } })).map((s) => s.organizationId).filter(Boolean) as string[];
  await systemDb.$transaction(async (tx) => {
    const sessionIds = (await tx.assessmentSession.findMany({ where: { subjectUserId: userId }, select: { id: true } })).map((s) => s.id);
    const practiceIds = (await tx.practiceSession.findMany({ where: { userId }, select: { id: true } })).map((s) => s.id);
    // AI request logs carry the person's words; they go with everything else (see aiLogKeys).
    await tx.aiCallLog.deleteMany({ where: { sessionId: { in: [...sessionIds, ...practiceIds, coachLogKey(userId)] } } });
    await tx.fairnessResponse.deleteMany({ where: { sessionRef: { in: sessionIds } } });
    await tx.outcomeRating.deleteMany({ where: { sessionId: { in: sessionIds } } });
    await tx.assessmentSession.deleteMany({ where: { subjectUserId: userId } });
    await tx.coachMessage.deleteMany({ where: { userId } });
    await tx.growProfile.deleteMany({ where: { userId } });
    await tx.teamMember.updateMany({ where: { userId }, data: { status: "REMOVED", userId: null, sessionId: null } });
    await tx.user.delete({ where: { id: userId } });
  });
  for (const organizationId of new Set(orgs)) await audit({ organizationId, action: "privacy.subject_deleted", metadata: { at: new Date().toISOString() } });
}

/** An organisation deletes one candidate's assessment data. */
export async function deleteSessionData(sessionId: string, actorUserId: string, organizationId: string) {
  await systemDb.$transaction(async (tx) => {
    await tx.aiCallLog.deleteMany({ where: { sessionId } });
    await tx.fairnessResponse.deleteMany({ where: { sessionRef: sessionId } });
    await tx.outcomeRating.deleteMany({ where: { sessionId } });
    await tx.assessmentSession.delete({ where: { id: sessionId } });
  });
  await audit({ organizationId, actorUserId, action: "privacy.session_deleted", targetType: "session", targetId: sessionId });
}

/**
 * The key Grow coach conversations are logged under in ai_call_log.sessionId
 * (they have no session of their own), so they can be deleted with the person.
 */
export function coachLogKey(userId: string) {
  return `coach:${userId}`;
}

/**
 * An organisation's admin deletes the organisation and everything in it:
 * roles, assessments (with answers, scores and reports), teams, invitations,
 * integrations, AI request logs and its audit log. People's own accounts and
 * personal Grow data stay; they simply stop being members. A platform-level
 * audit record keeps only the fact that it happened.
 */
export async function deleteOrganizationData(organizationId: string, actorUserId: string) {
  // Stop charging first: if Stripe can't be reached, nothing is deleted and the admin can retry.
  const billing = await systemDb.organizationBilling.findUnique({ where: { organizationId }, select: { stripeSubscriptionId: true, status: true } });
  if (billing?.stripeSubscriptionId && billing.status !== "CANCELED" && process.env.STRIPE_SECRET_KEY) {
    const { stripe } = await import("@/lib/billing/stripe");
    await stripe()
      .subscriptions.cancel(billing.stripeSubscriptionId)
      .catch((e: { code?: string }) => {
        if (e?.code !== "resource_missing") throw e;
      });
  }
  const sessionIds = (await systemDb.assessmentSession.findMany({ where: { organizationId }, select: { id: true } })).map((s) => s.id);
  await systemDb.$transaction(async (tx) => {
    // Rows keyed by organisation or session without a foreign key go first.
    await tx.aiCallLog.deleteMany({ where: { OR: [{ organizationId }, { sessionId: { in: sessionIds } }] } });
    await tx.fairnessResponse.deleteMany({ where: { OR: [{ organizationId }, { sessionRef: { in: sessionIds } }] } });
    await tx.outcomeRating.deleteMany({ where: { OR: [{ organizationId }, { sessionId: { in: sessionIds } }] } });
    await tx.auditLog.deleteMany({ where: { organizationId } });
    await tx.authSession.updateMany({ where: { activeOrganizationId: organizationId }, data: { activeOrganizationId: null } });
    // Everything else belongs to the organisation and is removed with it (onDelete: Cascade).
    await tx.organization.delete({ where: { id: organizationId } });
  });
  await audit({ actorUserId, action: "organization.deleted", targetType: "organization", targetId: organizationId, metadata: { sessions: sessionIds.length } });
}
