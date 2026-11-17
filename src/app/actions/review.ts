"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withTenant } from "@/lib/db";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { answerContext, type AnswerContext } from "@/lib/hire/review";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** The full answer behind a piece of evidence, so a reviewer can read the quote in context. */
export async function getAnswerContext(sessionId: string, scoreId: string): Promise<Result<{ answer: AnswerContext }>> {
  const viewer = await requirePermission("report.view");
  const answer = await answerContext(viewer, z.string().parse(sessionId), z.string().parse(scoreId));
  if (!answer) return { ok: false, error: "notFound" };
  return { ok: true, answer };
}

const adjustSchema = z.object({
  sessionId: z.string(),
  skillKey: z.string().min(1).max(80),
  level: z.number().min(1).max(5).multipleOf(0.5),
  note: z.string().trim().min(10).max(1000),
});

/** A reviewer sets a skill level. A note is required; the change is logged and shown on the report. */
export async function adjustSkillLevel(input: z.input<typeof adjustSchema>): Promise<Result> {
  const viewer = await requirePermission("report.view");
  const p = adjustSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  const { sessionId, skillKey, level, note } = p.data;
  const ok = await withTenant(tenantOf(viewer), async (tx) => {
    const report = await tx.report.findUnique({ where: { sessionId }, select: { status: true } });
    if (report?.status !== "READY") return false;
    await tx.reportAdjustment.upsert({
      where: { sessionId_skillKey: { sessionId, skillKey } },
      create: { organizationId: viewer.activeOrganization.id, sessionId, skillKey, level, note, createdById: viewer.user.id },
      update: { level, note, createdById: viewer.user.id },
    });
    return true;
  });
  if (!ok) return { ok: false, error: "notReady" };
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "report.level_adjusted", targetType: "session", targetId: sessionId, metadata: { skillKey, level, note } });
  revalidatePath(`/app/reports/${sessionId}`);
  return { ok: true };
}

/** Go back to the assessment's own estimate for a skill. Logged. */
export async function clearAdjustment(input: { sessionId: string; skillKey: string }): Promise<Result> {
  const viewer = await requirePermission("report.view");
  const sessionId = z.string().parse(input.sessionId);
  const skillKey = z.string().parse(input.skillKey);
  await withTenant(tenantOf(viewer), (tx) => tx.reportAdjustment.deleteMany({ where: { sessionId, skillKey } }));
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "report.level_restored", targetType: "session", targetId: sessionId, metadata: { skillKey } });
  revalidatePath(`/app/reports/${sessionId}`);
  return { ok: true };
}

const confirmSchema = z.object({ sessionId: z.string(), note: z.string().trim().min(10).max(1000) });

/** The candidate asked for a person to review every score: record that someone did, and what they concluded. */
export async function confirmHumanReview(input: z.input<typeof confirmSchema>): Promise<Result> {
  const viewer = await requirePermission("report.view");
  const p = confirmSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  const updated = await withTenant(tenantOf(viewer), (tx) =>
    tx.assessmentSession.updateMany({
      where: { id: p.data.sessionId, humanReviewRequested: true },
      data: { humanReviewedAt: new Date(), humanReviewedById: viewer.user.id, humanReviewNote: p.data.note },
    }),
  );
  if (!updated.count) return { ok: false, error: "notFound" };
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "report.human_review_confirmed", targetType: "session", targetId: p.data.sessionId });
  revalidatePath(`/app/reports/${p.data.sessionId}`);
  return { ok: true };
}
