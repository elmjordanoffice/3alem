import "server-only";
import { withTenant } from "@/lib/db";
import { tenantOf, type Viewer } from "@/lib/auth/session";
import { templateAnalysis, technicalSkills, templateAccommodations, type TemplateRow } from "./templates";
import type { ReportContent } from "./report-types";

export type CandidateStatus = "invited" | "opened" | "in_progress" | "paused" | "completed" | "report_ready" | "expired" | "revoked";

export interface CandidateRow {
  invitationId: string;
  sessionId: string | null;
  name: string;
  email: string;
  status: CandidateStatus;
  invitedAt: string;
  completedAt: string | null;
  fit: ReportContent["fit"]["level"] | null;
  fitConfidence: number | null;
  topStrengths: string[];
  flags: number;
  minutes: number | null;
}

function statusOf(inv: { status: string; expiresAt: Date }, session: { status: string } | null, report: { status: string } | null): CandidateStatus {
  if (inv.status === "REVOKED") return "revoked";
  if (report?.status === "READY") return "report_ready";
  if (session) {
    if (["COMPLETED", "SCORED", "REPORTED"].includes(session.status)) return "completed";
    if (session.status === "PAUSED") return "paused";
    return "in_progress";
  }
  if (inv.expiresAt < new Date()) return "expired";
  return inv.status === "OPENED" ? "opened" : "invited";
}

/** Roles with candidate counts, for the dashboard. */
export async function listAssessments(viewer: Viewer & { activeOrganization: { id: string } }) {
  return withTenant(tenantOf(viewer), async (tx) => {
    const templates = await tx.assessmentTemplate.findMany({
      where: { organizationId: viewer.activeOrganization.id },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      include: { invitations: { select: { status: true, expiresAt: true, session: { select: { status: true, report: { select: { status: true } } } } } } },
    });
    return templates.map((t) => {
      const counts = { invited: 0, inProgress: 0, completed: 0, awaitingReview: 0 };
      for (const inv of t.invitations) {
        const st = statusOf(inv, inv.session, inv.session?.report ?? null);
        if (st === "revoked") continue;
        counts.invited++;
        if (st === "in_progress" || st === "paused") counts.inProgress++;
        if (st === "completed" || st === "report_ready") counts.completed++;
        if (st === "report_ready") counts.awaitingReview++;
      }
      const analysis = templateAnalysis(t as unknown as TemplateRow);
      return { id: t.id, title: t.title, status: t.status, seniority: analysis?.seniority ?? null, durationMinutes: t.durationMinutes, updatedAt: t.updatedAt.toISOString(), counts };
    });
  });
}

/** One role: its setup and its candidates. */
export async function assessmentDetail(viewer: Viewer & { activeOrganization: { id: string } }, id: string) {
  return withTenant(tenantOf(viewer), async (tx) => {
    const t = await tx.assessmentTemplate.findUnique({ where: { id }, include: { skillWeights: true } });
    if (!t) return null;
    const invitations = await tx.invitation.findMany({
      where: { templateId: id },
      orderBy: { createdAt: "desc" },
      include: { session: { include: { report: true, integrityEvents: { select: { id: true } } } } },
    });
    const candidates: CandidateRow[] = invitations.map((inv) => {
      const report = inv.session?.report ?? null;
      const content = report?.status === "READY" ? (report.content as unknown as ReportContent) : null;
      return {
        invitationId: inv.id,
        sessionId: inv.session?.id ?? null,
        name: inv.name ?? inv.email.split("@")[0]!,
        email: inv.email,
        status: statusOf(inv, inv.session, report),
        invitedAt: inv.createdAt.toISOString(),
        completedAt: inv.session?.completedAt?.toISOString() ?? null,
        fit: content?.fit.level ?? null,
        fitConfidence: content?.fit.confidence ?? null,
        topStrengths: content?.narrative.strengths.slice(0, 2).map((s) => s.headline) ?? [],
        flags: inv.session?.integrityEvents.length ?? 0,
        minutes: inv.session ? Math.round(inv.session.elapsedSeconds / 60) : null,
      };
    });
    const row = t as unknown as TemplateRow;
    return {
      template: { id: t.id, title: t.title, status: t.status, jobDescription: t.jobDescription, durationMinutes: t.durationMinutes, language: t.language, publishedAt: t.publishedAt?.toISOString() ?? null },
      analysis: templateAnalysis(row),
      technicalSkills: technicalSkills(row),
      accommodations: templateAccommodations(row),
      weights: t.skillWeights.map((w) => ({ skillKey: w.skillKey, importance: w.importance, weight: w.weight })),
      candidates,
    };
  });
}

/** A report the viewer's organisation owns. */
export async function reportForViewer(viewer: Viewer, sessionId: string) {
  return withTenant(tenantOf(viewer), async (tx) => {
    const s = await tx.assessmentSession.findUnique({
      where: { id: sessionId },
      include: { report: { include: { shareLinks: { where: { revokedAt: null }, orderBy: { createdAt: "desc" } } } }, invitation: true, template: true },
    });
    if (!s) return null;
    return {
      session: { id: s.id, status: s.status, completedAt: s.completedAt?.toISOString() ?? null, templateId: s.templateId, mode: s.mode },
      candidate: { name: s.invitation?.name ?? s.invitation?.email ?? "", email: s.invitation?.email ?? "" },
      template: s.template ? { id: s.template.id, title: s.template.title } : null,
      report: s.report
        ? {
            id: s.report.id,
            status: s.report.status,
            sharedWithCandidate: s.report.sharedWithCandidate,
            content: s.report.status === "READY" ? (s.report.content as unknown as ReportContent) : null,
            shareLinks: s.report.shareLinks.map((l) => ({ id: l.id, audience: l.audience, expiresAt: l.expiresAt.toISOString(), expired: l.expiresAt < new Date() })),
          }
        : null,
    };
  });
}

export async function reportsForCompare(viewer: Viewer, sessionIds: string[]) {
  return withTenant(tenantOf(viewer), async (tx) => {
    const reports = await tx.report.findMany({ where: { sessionId: { in: sessionIds.slice(0, 4) }, status: "READY" }, include: { session: { include: { invitation: true } } } });
    return sessionIds
      .map((id) => reports.find((r) => r.sessionId === id))
      .filter((r): r is NonNullable<typeof r> => Boolean(r))
      .map((r) => ({ sessionId: r.sessionId, name: r.session.invitation?.name ?? r.session.invitation?.email ?? "", content: r.content as unknown as ReportContent }));
  });
}

export async function dashboardStats(viewer: Viewer & { activeOrganization: { id: string } }) {
  const list = await listAssessments(viewer);
  return list.reduce(
    (a, t) => ({
      open: a.open + (t.status === "PUBLISHED" ? 1 : 0),
      invited: a.invited + t.counts.invited,
      inProgress: a.inProgress + t.counts.inProgress,
      completed: a.completed + t.counts.completed,
      awaitingReview: a.awaitingReview + t.counts.awaitingReview,
    }),
    { open: 0, invited: 0, inProgress: 0, completed: 0, awaitingReview: 0 },
  );
}
