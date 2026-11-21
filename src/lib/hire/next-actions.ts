import "server-only";
import { withTenant } from "@/lib/db";
import { tenantOf, type Viewer } from "@/lib/auth/session";

/**
 * Home's "next actions": the pipeline turned into a short to-do list, most
 * urgent first. Each item links straight to where it's done.
 *
 * - review: a candidate asked for a person to review every score, and
 *   nobody has confirmed one (sharing and final decisions wait for it).
 * - interview: invited to interview, but no scorecard yet (the kit is ready).
 * - decide: report read more than three days ago, no decision recorded.
 * - nudge: invitation sent more than three days ago, not started.
 */
export type NextAction =
  | { kind: "review"; name: string; href: string; count: number }
  | { kind: "interview"; name: string; href: string; count: number }
  | { kind: "decide"; name: string; href: string; count: number; days: number }
  | { kind: "nudge"; name: string; href: string; count: number; days: number };

const DAY = 86400_000;

export async function nextActions(viewer: Viewer & { activeOrganization: { id: string } }): Promise<NextAction[]> {
  return withTenant(tenantOf(viewer), async (tx) => {
    const now = Date.now();
    const out: NextAction[] = [];

    const reviews = await tx.assessmentSession.findMany({
      where: { mode: "HIRE", humanReviewRequested: true, humanReviewedAt: null, report: { status: "READY" } },
      select: { id: true, invitation: { select: { name: true, email: true } } },
      orderBy: { completedAt: "asc" },
    });
    if (reviews.length) out.push({ kind: "review", name: reviews[0]!.invitation?.name ?? reviews[0]!.invitation?.email ?? "", href: `/app/reports/${reviews[0]!.id}`, count: reviews.length });

    const advanced = await tx.hiringDecision.findMany({
      where: { outcome: "ADVANCE", session: { scorecards: { none: {} } } },
      select: { sessionId: true, session: { select: { invitation: { select: { name: true, email: true } } } } },
      orderBy: { updatedAt: "asc" },
    });
    if (advanced.length) out.push({ kind: "interview", name: advanced[0]!.session.invitation?.name ?? "", href: `/app/reports/${advanced[0]!.sessionId}/interview`, count: advanced.length });

    // Read but undecided for more than three days (the audit log says when a report was first opened).
    const undecided = await tx.assessmentSession.findMany({
      where: { mode: "HIRE", decision: null, report: { status: "READY" } },
      select: { id: true, invitation: { select: { name: true, email: true } } },
    });
    if (undecided.length) {
      const views = await tx.auditLog.findMany({
        where: { action: "report.viewed", targetId: { in: undecided.map((s) => s.id) } },
        select: { targetId: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      });
      const firstView = new Map<string, Date>();
      for (const v of views) if (v.targetId && !firstView.has(v.targetId)) firstView.set(v.targetId, v.createdAt);
      const stale = undecided
        .map((s) => ({ s, at: firstView.get(s.id) }))
        .filter((x): x is { s: (typeof undecided)[number]; at: Date } => Boolean(x.at) && now - x.at!.getTime() > 3 * DAY)
        .sort((a, b) => a.at.getTime() - b.at.getTime());
      if (stale.length) out.push({ kind: "decide", name: stale[0]!.s.invitation?.name ?? "", href: `/app/reports/${stale[0]!.s.id}`, count: stale.length, days: Math.floor((now - stale[0]!.at.getTime()) / DAY) });
    }

    const waiting = await tx.invitation.findMany({
      where: { status: { in: ["PENDING", "OPENED"] }, session: null, createdAt: { lt: new Date(now - 3 * DAY) }, expiresAt: { gt: new Date(now) } },
      select: { name: true, email: true, templateId: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    if (waiting.length) out.push({ kind: "nudge", name: waiting[0]!.name ?? waiting[0]!.email, href: `/app/assessments/${waiting[0]!.templateId}`, count: waiting.length, days: Math.floor((now - waiting[0]!.createdAt.getTime()) / DAY) });

    return out;
  });
}
