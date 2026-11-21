import "server-only";
import { withTenant } from "@/lib/db";
import { tenantOf, type Viewer } from "@/lib/auth/session";
import { importanceOf } from "@/lib/engine/select";
import type { RoleProfile } from "@/lib/engine";
import { roleProfileFor, type TemplateRow } from "./templates";
import type { ReportContent } from "./report-types";

/**
 * The shortlist: what the reports suggest doing next for a role, with the
 * reasons in plain words. People decide; this only orders the reading list.
 *
 * - interview: role fit Strong or Good.
 * - closer: Partial, but worth a look (a single gap, thin evidence, or a
 *   hidden strength the assessment surfaced).
 * - elsewhere: clearly better suited to another open role in the
 *   organisation (talent rediscovery), judged on the same domain estimates.
 * - notNow: everyone else.
 */
export type ShortlistGroup = "interview" | "closer" | "elsewhere" | "notNow";
export type Reason =
  | { key: "strongOn"; skills: string[] }
  | { key: "gapOn"; skill: string }
  | { key: "thin" }
  | { key: "potential"; text: string }
  | { key: "fitsRole"; role: string };

export interface ShortlistEntry {
  sessionId: string;
  name: string;
  fit: ReportContent["fit"]["level"];
  group: ShortlistGroup;
  reasons: Reason[];
  altRole?: { id: string; title: string };
  decision: "ADVANCE" | "HIRE" | "HOLD" | "DECLINE" | null;
}

/** Weighted mean of (estimate − expected) across what matters for a role, from a report's domain estimates. */
export function domainMargin(content: ReportContent, role: RoleProfile, opts: { skipTechnical?: boolean } = {}): number {
  let sum = 0;
  let w = 0;
  for (const d of content.domains) {
    if (opts.skipTechnical && d.key === "technical") continue;
    const weight = importanceOf(role, d.key);
    sum += weight * (d.estimate - role.expectedLevel);
    w += weight;
  }
  return w ? sum / w : 0;
}

export function shortlistEntry(
  c: { sessionId: string; name: string; content: ReportContent; decision: ShortlistEntry["decision"] },
  role: RoleProfile,
  others: { id: string; title: string; role: RoleProfile }[],
): ShortlistEntry {
  const { content } = c;
  const fit = content.fit.level;
  const reasons: Reason[] = [];

  // Strongest must-haves (or strongest domains when the role has none marked).
  const critical = content.domains.filter((d) => role.critical.includes(d.key));
  const pool = critical.length ? critical : content.domains;
  const strong = pool.filter((d) => d.estimate >= role.expectedLevel - 0.1).sort((a, b) => b.estimate - a.estimate).slice(0, 2);
  if (strong.length) reasons.push({ key: "strongOn", skills: strong.map((d) => d.name) });
  const gap = content.fit.gaps[0];
  if (gap) reasons.push({ key: "gapOn", skill: gap.name });
  if (content.fit.confidence < 0.55) reasons.push({ key: "thin" });
  const potential = content.narrative.hiddenPotential[0]?.headline;

  // Another open role this person would fit clearly better.
  const here = domainMargin(content, role, { skipTechnical: true });
  const best = others
    .map((o) => ({ o, m: domainMargin(content, o.role, { skipTechnical: true }) }))
    .sort((a, b) => b.m - a.m)[0];
  const elsewhere = best && best.m >= -0.25 && best.m >= here + 0.35 ? best.o : undefined;

  let group: ShortlistGroup;
  if (fit === "STRONG" || fit === "GOOD") group = "interview";
  else if (elsewhere) group = "elsewhere";
  else if (fit === "PARTIAL" && (content.fit.gaps.length <= 1 || content.fit.confidence < 0.55 || potential)) group = "closer";
  else group = "notNow";

  if (group === "closer" && potential) reasons.push({ key: "potential", text: potential });
  if (elsewhere) reasons.unshift({ key: "fitsRole", role: elsewhere.title });

  return { sessionId: c.sessionId, name: c.name, fit, group, reasons: reasons.slice(0, 3), altRole: elsewhere ? { id: elsewhere.id, title: elsewhere.title } : undefined, decision: c.decision };
}

const ORDER: Record<ReportContent["fit"]["level"], number> = { STRONG: 0, GOOD: 1, PARTIAL: 2, WEAK: 3 };

export async function shortlistFor(viewer: Viewer, templateId: string): Promise<ShortlistEntry[]> {
  return withTenant(tenantOf(viewer), async (tx) => {
    const templates = await tx.assessmentTemplate.findMany({ where: { status: { in: ["PUBLISHED", "DRAFT"] } }, include: { skillWeights: true } });
    const self = templates.find((t) => t.id === templateId);
    if (!self) return [];
    const role = roleProfileFor(self as unknown as TemplateRow);
    const others = templates
      .filter((t) => t.id !== templateId && t.status === "PUBLISHED")
      .map((t) => ({ id: t.id, title: t.title, role: roleProfileFor(t as unknown as TemplateRow) }));
    const sessions = await tx.assessmentSession.findMany({
      where: { templateId, report: { status: "READY" } },
      include: { report: true, invitation: { select: { name: true, email: true } }, decision: { select: { outcome: true } } },
    });
    return sessions
      .map((s) =>
        shortlistEntry(
          { sessionId: s.id, name: s.invitation?.name ?? s.invitation?.email ?? "", content: s.report!.content as unknown as ReportContent, decision: s.decision?.outcome ?? null },
          role,
          others,
        ),
      )
      .sort((a, b) => ORDER[a.fit] - ORDER[b.fit] || a.name.localeCompare(b.name));
  });
}
