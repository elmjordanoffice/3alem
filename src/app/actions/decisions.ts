"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { withTenant } from "@/lib/db";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { RECOMMENDATIONS, ratingSchema } from "@/lib/hire/interview";

type Result = { ok: true } | { ok: false; error: string };

const decisionSchema = z.object({
  sessionId: z.string(),
  outcome: z.enum(["ADVANCE", "HIRE", "HOLD", "DECLINE"]),
  reason: z.string().trim().min(10).max(2000),
});

/**
 * Record what the hiring team decided, and why. A final decision (hire or
 * decline) waits for the human review the candidate asked for.
 */
export async function recordDecision(input: z.input<typeof decisionSchema>): Promise<Result> {
  const viewer = await requirePermission("report.view");
  const p = decisionSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  const { sessionId, outcome, reason } = p.data;
  const result = await withTenant(tenantOf(viewer), async (tx) => {
    const s = await tx.assessmentSession.findUnique({ where: { id: sessionId }, select: { humanReviewRequested: true, humanReviewedAt: true, report: { select: { status: true } } } });
    if (!s || s.report?.status !== "READY") return "notReady";
    if ((outcome === "HIRE" || outcome === "DECLINE") && s.humanReviewRequested && !s.humanReviewedAt) return "reviewPending";
    await tx.hiringDecision.upsert({
      where: { sessionId },
      create: { organizationId: viewer.activeOrganization.id, sessionId, outcome, reason, decidedById: viewer.user.id },
      update: { outcome, reason, decidedById: viewer.user.id },
    });
    return "ok";
  });
  if (result !== "ok") return { ok: false, error: result };
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "hire.decision_recorded", targetType: "session", targetId: sessionId, metadata: { outcome, reason } });
  revalidatePath(`/app/reports/${sessionId}`);
  return { ok: true };
}

const scorecardSchema = z.object({
  sessionId: z.string(),
  ratings: z.array(ratingSchema).min(1).max(8),
  recommendation: z.enum(RECOMMENDATIONS),
  summary: z.string().trim().min(10).max(3000),
});

/** An interviewer's structured scorecard. One per interviewer; submitting again replaces it. */
export async function submitScorecard(input: z.input<typeof scorecardSchema>): Promise<Result> {
  const viewer = await requirePermission("report.view");
  const p = scorecardSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  if (!p.data.ratings.some((r) => r.rating != null)) return { ok: false, error: "noRatings" };
  const { sessionId, ratings, recommendation, summary } = p.data;
  const ok = await withTenant(tenantOf(viewer), async (tx) => {
    const report = await tx.report.findUnique({ where: { sessionId }, select: { status: true } });
    if (report?.status !== "READY") return false;
    await tx.interviewScorecard.upsert({
      where: { sessionId_interviewerId: { sessionId, interviewerId: viewer.user.id } },
      create: { organizationId: viewer.activeOrganization.id, sessionId, interviewerId: viewer.user.id, ratings, recommendation, summary },
      update: { ratings, recommendation, summary, submittedAt: new Date() },
    });
    return true;
  });
  if (!ok) return { ok: false, error: "notReady" };
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "hire.scorecard_submitted", targetType: "session", targetId: sessionId, metadata: { recommendation } });
  revalidatePath(`/app/reports/${sessionId}`);
  revalidatePath(`/app/reports/${sessionId}/interview`);
  return { ok: true };
}
