import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { systemDb } from "@/lib/db";

/**
 * Append-only audit log. Written with the system client so a failed tenant
 * transaction cannot silently drop the record of an attempted action.
 */
export async function audit(entry: {
  organizationId?: string | null;
  actorUserId?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  await systemDb.auditLog.create({
    data: {
      organizationId: entry.organizationId ?? null,
      actorUserId: entry.actorUserId ?? null,
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      metadata: entry.metadata ?? {},
    },
  });
}
