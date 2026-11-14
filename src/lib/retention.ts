import "server-only";
import { systemDb } from "@/lib/db";
import { audit } from "@/lib/audit";

/**
 * Delete candidate data older than each organisation's retention period
 * (default 12 months). Sessions cascade to items, responses, scores, reports.
 */
export async function retentionSweep() {
  const orgs = await systemDb.organization.findMany({ select: { id: true, dataRetentionMonths: true } });
  for (const org of orgs) {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - org.dataRetentionMonths);
    const { count } = await systemDb.assessmentSession.deleteMany({ where: { organizationId: org.id, mode: "HIRE", createdAt: { lt: cutoff } } });
    await systemDb.invitation.deleteMany({ where: { organizationId: org.id, createdAt: { lt: cutoff } } });
    if (count) await audit({ organizationId: org.id, action: "retention.deleted_sessions", metadata: { count, cutoff: cutoff.toISOString() } });
  }
}
