"use server";
import { z } from "zod";
import { requireViewer, tenantOf, viewerCan } from "@/lib/auth/session";
import { withTenant } from "@/lib/db";

export interface SearchHit {
  group: "assessments" | "candidates" | "teams" | "members";
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

/** Command-palette search across what the viewer may see. RLS scopes every query. */
export async function commandSearch(query: string): Promise<SearchHit[]> {
  const q = z.string().trim().min(2).max(80).safeParse(query);
  if (!q.success) return [];
  const viewer = await requireViewer();
  if (!viewer.activeOrganization) return [];
  const term = { contains: q.data, mode: "insensitive" as const };
  return withTenant(tenantOf(viewer), async (tx) => {
    const hits: SearchHit[] = [];
    if (viewerCan(viewer, "assessment.view")) {
      const templates = await tx.assessmentTemplate.findMany({ where: { title: term, status: { not: "ARCHIVED" } }, select: { id: true, title: true, status: true }, take: 5, orderBy: { updatedAt: "desc" } });
      for (const t of templates) hits.push({ group: "assessments", id: t.id, title: t.title, subtitle: t.status, href: `/app/assessments/${t.id}` });
    }
    if (viewerCan(viewer, "candidate.view")) {
      const invitations = await tx.invitation.findMany({
        where: { OR: [{ name: term }, { email: term }], status: { not: "REVOKED" } },
        select: { id: true, name: true, email: true, templateId: true, template: { select: { title: true } }, session: { select: { id: true, report: { select: { status: true } } } } },
        take: 6,
        orderBy: { createdAt: "desc" },
      });
      for (const i of invitations) {
        const ready = i.session?.report?.status === "READY";
        hits.push({ group: "candidates", id: i.id, title: i.name ?? i.email, subtitle: i.template.title, href: ready ? `/app/reports/${i.session!.id}` : `/app/assessments/${i.templateId}` });
      }
    }
    if (viewerCan(viewer, "team.view")) {
      const teams = await tx.team.findMany({ where: { name: term }, select: { id: true, name: true }, take: 4 });
      for (const t of teams) hits.push({ group: "teams", id: t.id, title: t.name, href: `/app/teams/${t.id}` });
    }
    const members = await tx.membership.findMany({ where: { organizationId: viewer.activeOrganization!.id, user: { OR: [{ name: term }, { email: term }] } }, select: { userId: true, user: { select: { name: true, email: true } } }, take: 4 });
    for (const m of members) hits.push({ group: "members", id: m.userId, title: m.user.name, subtitle: m.user.email, href: "/app/org/members" });
    return hits;
  });
}
