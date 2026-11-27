import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { systemDb } from "@/lib/db";
import { audit } from "@/lib/audit";

/**
 * Delete candidate data older than each organisation's retention period
 * (default 12 months). Sessions cascade to items, responses, scores, reports.
 * The nightly run (no organisation given) also trims the AI request logs.
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
    await systemDb.aiCallLog.deleteMany({ where: { sessionId: { in: ids } } });
    await systemDb.fairnessResponse.deleteMany({ where: { sessionRef: { in: ids } } });
    await systemDb.outcomeRating.deleteMany({ where: { sessionId: { in: ids } } });
    const { count } = await systemDb.assessmentSession.deleteMany({ where });
    await systemDb.invitation.deleteMany({ where: { organizationId: org.id, createdAt: { lt: cutoff } } });
    deleted += count;
    if (count) await audit({ organizationId: org.id, action: "retention.deleted_sessions", metadata: { count, cutoff: cutoff.toISOString() } });
  }
  if (!organizationId) await trimAiLogs();
  return { deleted };
}

/**
 * AI request logs hold the text sent to and from the model, which can include
 * people's answers. The text is kept for AI_LOG_RETENTION_DAYS (default 30)
 * to check quality and troubleshoot, then cleared; the row (cost, timing,
 * tokens) stays for budgets and accounting for 13 months, then goes too.
 */
export async function trimAiLogs(now = new Date()): Promise<{ cleared: number; deleted: number }> {
  const days = Number(process.env.AI_LOG_RETENTION_DAYS);
  const keepDays = Number.isFinite(days) && days >= 0 ? days : 30;
  const textCutoff = new Date(now.getTime() - keepDays * 24 * 60 * 60 * 1000);
  const rowCutoff = new Date(now);
  rowCutoff.setMonth(rowCutoff.getMonth() - 13);
  const { count: cleared } = await systemDb.aiCallLog.updateMany({
    where: { createdAt: { lt: textCutoff }, NOT: { input: { equals: CLEARED } } },
    data: { input: CLEARED, output: Prisma.DbNull, error: null },
  });
  const { count: deleted } = await systemDb.aiCallLog.deleteMany({ where: { createdAt: { lt: rowCutoff } } });
  return { cleared, deleted };
}

const CLEARED = { cleared: true };
