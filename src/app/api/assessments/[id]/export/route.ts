import { NextResponse } from "next/server";
import { getViewer, viewerCan } from "@/lib/auth/session";
import { assessmentDetail } from "@/lib/hire/recruiter";
import { audit } from "@/lib/audit";

export const runtime = "nodejs";

/** Neutralise spreadsheet formulas and quote every field. */
function cell(v: unknown): string {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Candidate list for an ATS or spreadsheet. Same visibility as the candidates table. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const viewer = await getViewer();
  if (!viewer?.activeOrganization || !viewerCan(viewer, "candidate.view")) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const { id } = await params;
  const detail = await assessmentDetail(viewer as typeof viewer & { activeOrganization: { id: string } }, id);
  if (!detail) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const header = ["name", "email", "status", "invited_at", "completed_at", "role_fit", "fit_confidence", "minutes", "integrity_flags", "top_strengths", "report_url"];
  const base = (process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "").replace(/\/$/, "");
  const rows = detail.candidates.map((c) => [
    c.name, c.email, c.status, c.invitedAt, c.completedAt, c.fit, c.fitConfidence !== null ? Math.round(c.fitConfidence * 100) / 100 : null, c.minutes, c.flags, c.topStrengths.join("; "), c.sessionId && c.fit ? `${base}/app/reports/${c.sessionId}` : null,
  ]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "candidates.exported_csv", targetType: "template", targetId: id, metadata: { rows: rows.length } });
  const slug = detail.template.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "candidates";
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${slug}-candidates.csv"`, "Cache-Control": "no-store" } });
}
