import "server-only";
import { systemDb } from "@/lib/db";
import { audit } from "@/lib/audit";

/**
 * Delete candidate data older than each organisation's retention period
 * (default 12 months). Sessions cascade to items, responses, scores, reports.
 */
export async function retentionSweep(organizationId?: string): Promise<{ deleted: number }> {
  const orgs = await systemDb.organization.findMany({ where: organizationId ? { id: organizationId } : {}, select: { id: true, dataRetentionMonths: true } });
  let deleted = 0;
  for (const org of orgs) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - org.dataRetentionMonths);
    const where = { organizationId: org.id, mode: "HIRE" as const, createdAt: { lt: cutoff } };
    const ids = (await systemDb.assessmentSession.findMany({ where, select: { id: true } })).map((s) => s.id);
    // Rows keyed by session id without a foreign key go first.
    await systemDb.fairnessResponse.deleteMany({ where: { sessionRef: { in: ids } } });
    await systemDb.outcomeRating.deleteMany({ where: { sessionId: { in: ids } } });
    const { count } = await systemDb.assessmentSession.deleteMany({ where });
    await systemDb.invitation.deleteMany({ where: { organizationId: org.id, createdAt: { lt: cutoff } } });
    deleted += count;
    if (count) await audit({ organizationId: org.id, action: "retention.deleted_sessions", metadata: { count, cutoff: cutoff.toISOString() } });
  }
  return { deleted };
}
