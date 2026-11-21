import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { DOMAINS } from "@/lib/framework/data";
import { systemDb, withTenant } from "@/lib/db";
import type { Viewer } from "@/lib/auth/session";

/** Tenant context for withTenant() (kept local so scripts can import this module). */
function tenantOf(viewer: Viewer) {
  return { userId: viewer.user.id, organizationId: viewer.activeOrganization?.id ?? null };
}
import { ENGINE_VERSION, buildRoleProfile, createModel, type RoleProfileInput } from "@/lib/engine";
import { curatedWorld } from "@/lib/hire/world";
import { generateToken, hashToken } from "@/lib/hire/tokens";
import { appUrl } from "@/lib/hire/invitations";
import { sendMail } from "@/lib/mail";
import { brandedEmail } from "@/lib/mail/templates";
import { audit } from "@/lib/audit";
import { enqueue } from "@/lib/jobs";
import { TRACKS } from "@/lib/grow/tracks";
import type { ReportContent } from "@/lib/hire/report-types";

/** Below this many assessed members, managers see only anonymised aggregates. */
export const MIN_NAMED_TEAM = 5;
export const TEAM_CONSENT_VERSION = "team-consent.v1";

type OrgViewer = Viewer & { activeOrganization: { id: string; name: string } };

export async function createTeam(viewer: OrgViewer, input: { name: string; goals: string[]; description: string }) {
  const team = await withTenant(tenantOf(viewer), (tx) =>
    tx.team.create({
      data: {
        organizationId: viewer.activeOrganization.id,
        name: input.name,
        managerUserId: viewer.user.id,
        goals: { domains: input.goals.filter((g) => DOMAINS.some((d) => d.key === g)), description: input.description } as Prisma.InputJsonValue,
      },
    }),
  );
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "team.created", targetType: "team", targetId: team.id });
  return team;
}

export async function inviteMembers(viewer: OrgViewer, teamId: string, emails: { email: string; name: string | null }[]) {
  const team = await withTenant(tenantOf(viewer), (tx) => tx.team.findUnique({ where: { id: teamId } }));
  if (!team) throw new Error("Not found");
  const created: { email: string; link: string }[] = [];
  for (const { email } of emails) {
    const token = generateToken();
    const exists = await withTenant(tenantOf(viewer), (tx) => tx.teamMember.findUnique({ where: { teamId_email: { teamId, email } } }));
    if (exists && exists.status !== "DECLINED" && exists.status !== "REMOVED") continue;
    const data = { teamId, organizationId: team.organizationId, email, status: "INVITED" as const, inviteTokenHash: hashToken(token), consentedAt: null, userId: null, sessionId: null, reportSeenAt: null, shareRawAnswers: false };
    await withTenant(tenantOf(viewer), (tx) => (exists ? tx.teamMember.update({ where: { id: exists.id }, data }) : tx.teamMember.create({ data })));
    const link = `${appUrl()}/team-invite/${token}`;
    const lang = viewer.user.locale === "ar" ? "ar" : "en";
    await sendMail({ to: email, ...brandedEmail("team", lang, { manager: viewer.user.name, team: team.name, org: viewer.activeOrganization.name }, { url: link, org: viewer.activeOrganization.name }) });
    created.push({ email, link });
  }
  await audit({ organizationId: team.organizationId, actorUserId: viewer.user.id, action: "team.members_invited", targetType: "team", targetId: teamId, metadata: { count: created.length } });
  return created;
}

export async function teamInvitation(token: string) {
  const m = await systemDb.teamMember.findUnique({ where: { inviteTokenHash: hashToken(token) }, include: { team: { include: { organization: true } } } });
  if (!m || m.status === "REMOVED") return null;
  const manager = await systemDb.user.findUnique({ where: { id: m.team.managerUserId }, select: { name: true } });
  return { member: m, team: m.team, managerName: manager?.name ?? "" };
}

export async function respondToTeamInvite(token: string, userId: string, accept: boolean, shareRaw: boolean) {
  const inv = await teamInvitation(token);
  if (!inv) throw new Error("Invalid invitation");
  const { member, team } = inv;
  await systemDb.$transaction(async (tx) => {
    await tx.teamMember.update({
      where: { id: member.id },
      data: accept ? { status: "CONSENTED", userId, consentedAt: new Date(), shareRawAnswers: shareRaw } : { status: "DECLINED", userId },
    });
    await tx.consent.create({ data: { userId, organizationId: team.organizationId, kind: "TEAM_SHARING", subject: `team-member:${member.id}`, granted: accept, textVersion: TEAM_CONSENT_VERSION } });
    if (accept) await tx.consent.create({ data: { userId, organizationId: team.organizationId, kind: "RAW_ANSWER_SHARING", subject: `team-member:${member.id}`, granted: shareRaw, textVersion: TEAM_CONSENT_VERSION } });
  });
  await audit({ organizationId: team.organizationId, actorUserId: userId, action: accept ? "team.member_consented" : "team.member_declined", targetType: "team_member", targetId: member.id });
  return member;
}

function teamRoleProfile(goals: string[]): RoleProfileInput {
  return {
    domainWeights: Object.fromEntries(DOMAINS.map((d) => [d.key, goals.includes(d.key) ? 0.8 : 0.5])),
    importance: goals.map((key) => ({ key, importance: "MUST_HAVE" as const })),
    seniority: "mid",
    technicalSkills: [],
  };
}

/** The member's assessment: a Team session visible to the organisation only through the privacy rules. */
export async function startTeamSession(memberId: string, userId: string, locale: "en" | "ar") {
  const member = await systemDb.teamMember.findFirst({ where: { id: memberId, userId }, include: { team: true } });
  if (!member || member.status !== "CONSENTED") throw new Error("Not allowed");
  if (member.sessionId) return { id: member.sessionId };
  const goals = ((member.team.goals as { domains?: string[] }).domains ?? []) as string[];
  const roleInput = teamRoleProfile(goals);
  const session = await systemDb.assessmentSession.create({
    data: {
      organizationId: member.organizationId,
      subjectUserId: userId,
      mode: "TEAM",
      status: "STARTED",
      timeBudgetMinutes: 40,
      locale,
      accommodations: { extraTime: 1, untimed: false, largerText: false, roleProfile: roleInput, teamMemberId: member.id } as unknown as Prisma.InputJsonValue,
      engineVersion: ENGINE_VERSION,
      startedAt: new Date(),
    },
  });
  await systemDb.candidateModelSnapshot.create({ data: { sessionId: session.id, sequence: 0, model: createModel(buildRoleProfile(roleInput)) as unknown as Prisma.InputJsonValue, organizationId: member.organizationId, subjectUserId: userId } });
  const { id, world } = curatedWorld(member.team.name, locale);
  await systemDb.scenarioWorld.create({
    data: { sessionId: session.id, organizationId: member.organizationId, subjectUserId: userId, companyName: world.companyName, industry: world.industry, summary: world as unknown as Prisma.InputJsonValue, cast: world.cast as unknown as Prisma.InputJsonValue, hooks: { decisions: [] }, promptVersion: `bank:${id}` },
  });
  await systemDb.teamMember.update({ where: { id: member.id }, data: { sessionId: session.id } });
  void enqueue("pregenerate", { sessionId: session.id }, session.id);
  return session;
}

/** The member opened their own report: from now on it can count in the team view. */
export async function markReportSeen(sessionId: string, userId: string) {
  await systemDb.teamMember.updateMany({ where: { sessionId, userId, reportSeenAt: null }, data: { reportSeenAt: new Date(), status: "ASSESSED" } });
}

export interface TeamAnalytics {
  team: { id: string; name: string; description: string; goals: string[] };
  members: { id: string; name: string; email: string; status: string; shareRawAnswers: boolean; counted: boolean; sessionId: string | null }[];
  named: boolean;
  assessedCount: number;
  domains: { key: string; name: string }[];
  heatmap: { key: string; label: string; values: Record<string, number | null>; thin: string[] }[];
  aggregates: { key: string; name: string; mean: number | null; min: number | null; max: number | null; n: number }[];
  gaps: { key: string; name: string; reason: "low_team_level" | "single_point" | "no_one_strong"; detail: number }[];
  pipeline: { memberId: string; name: string; leadership: number; management: number; readiness: "ready" | "emerging"; evidence: number }[];
  pairings: { mentor: string; learner: string; domain: string; domainName: string; gap: number }[];
  suggestedTracks: { key: string; reasonDomain: string }[];
  assignedTracks: string[];
}

const TRACK_FOR_DOMAIN: Record<string, string> = {
  leadership: "first-time-manager",
  management: "first-time-manager",
  communication: "executive-communication",
  collaboration: "executive-communication",
  "critical-thinking": "strategic-thinking",
  judgment: "decisions-under-pressure",
  adaptability: "decisions-under-pressure",
  "product-thinking": "product-thinking",
  technical: "strategic-thinking",
};

/**
 * Team analytics with privacy built in: only members who consented, finished
 * and saw their own report count; with fewer than five such members, nothing
 * is shown per person.
 */
export async function teamAnalytics(viewer: OrgViewer, teamId: string, locale: "en" | "ar"): Promise<TeamAnalytics | null> {
  return withTenant(tenantOf(viewer), async (tx) => {
    const team = await tx.team.findUnique({ where: { id: teamId }, include: { members: { where: { status: { not: "REMOVED" } }, orderBy: { createdAt: "asc" } } } });
    if (!team) return null;
    const goals = ((team.goals as { domains?: string[] }).domains ?? []) as string[];
    const description = (team.goals as { description?: string }).description ?? "";
    const counted = team.members.filter((m) => m.status === "ASSESSED" && m.reportSeenAt && m.sessionId);
    const reports = await tx.report.findMany({ where: { sessionId: { in: counted.map((m) => m.sessionId!) }, status: "READY" } });
    const users = await systemDb.user.findMany({ where: { id: { in: team.members.map((m) => m.userId).filter((x): x is string => Boolean(x)) } }, select: { id: true, name: true } });
    const nameOf = (m: (typeof team.members)[number]) => users.find((u) => u.id === m.userId)?.name ?? m.email.split("@")[0]!;
    const byMember = counted
      .map((m) => ({ m, content: reports.find((r) => r.sessionId === m.sessionId)?.content as unknown as ReportContent | undefined }))
      .filter((x): x is { m: (typeof counted)[number]; content: ReportContent } => Boolean(x.content));
    const named = byMember.length >= MIN_NAMED_TEAM;
    const domains = DOMAINS.map((d) => ({ key: d.key, name: d.name[locale] }));
    const level = (c: ReportContent, key: string) => c.domains.find((d) => d.key === key)?.estimate ?? null;

    const aggregates = domains.map((d) => {
      const vals = byMember.map((x) => level(x.content, d.key)).filter((v): v is number => v !== null);
      return { key: d.key, name: d.name, n: vals.length, mean: vals.length ? round1(vals.reduce((a, b) => a + b, 0) / vals.length) : null, min: vals.length ? round1(Math.min(...vals)) : null, max: vals.length ? round1(Math.max(...vals)) : null };
    });

    const gaps: TeamAnalytics["gaps"] = [];
    if (byMember.length) {
      for (const d of domains) {
        const agg = aggregates.find((a) => a.key === d.key)!;
        const strong = byMember.filter((x) => (level(x.content, d.key) ?? 0) >= 3.75).length;
        const isGoal = goals.includes(d.key);
        if (isGoal && strong === 0) gaps.push({ key: d.key, name: d.name, reason: "no_one_strong", detail: agg.max ?? 0 });
        else if (isGoal && strong === 1 && byMember.length >= 3) gaps.push({ key: d.key, name: d.name, reason: "single_point", detail: 1 });
        else if ((agg.mean ?? 3) < 2.75) gaps.push({ key: d.key, name: d.name, reason: "low_team_level", detail: agg.mean ?? 0 });
      }
    }

    const pipeline = named
      ? byMember
          .map((x) => {
            const leadership = level(x.content, "leadership") ?? 0;
            const management = level(x.content, "management") ?? 0;
            const evidence = x.content.domains.filter((d) => d.key === "leadership" || d.key === "management").reduce((a, d) => a + d.evidenceIds.length, 0);
            return { memberId: x.m.id, name: nameOf(x.m), leadership: round1(leadership), management: round1(management), evidence, readiness: (leadership >= 3.75 && management >= 3.5 ? "ready" : "emerging") as "ready" | "emerging", score: leadership + management };
          })
          .filter((p) => p.leadership >= 3.25)
          .sort((a, b) => b.score - a.score)
          .map((p) => ({ memberId: p.memberId, name: p.name, leadership: p.leadership, management: p.management, evidence: p.evidence, readiness: p.readiness }))
      : [];

    const pairings: TeamAnalytics["pairings"] = [];
    if (named) {
      for (const d of domains) {
        const sorted = byMember.map((x) => ({ x, v: level(x.content, d.key) ?? 3 })).sort((a, b) => b.v - a.v);
        const top = sorted[0];
        const bottom = sorted.at(-1);
        if (top && bottom && top.v >= 3.75 && top.v - bottom.v >= 1.25 && top.x.m.id !== bottom.x.m.id) {
          pairings.push({ mentor: nameOf(top.x.m), learner: nameOf(bottom.x.m), domain: d.key, domainName: d.name, gap: round1(top.v - bottom.v) });
        }
      }
      pairings.sort((a, b) => b.gap - a.gap);
    }

    const suggested = [...new Set(gaps.map((g) => TRACK_FOR_DOMAIN[g.key]).filter((x): x is string => Boolean(x)))].map((key) => ({ key, reasonDomain: gaps.find((g) => TRACK_FOR_DOMAIN[g.key] === key)!.name }));
    const assigned = await tx.trackEnrollment.findMany({ where: { assignedByTeamId: team.id }, select: { track: { select: { key: true } } } });

    return {
      team: { id: team.id, name: team.name, description, goals },
      members: team.members.map((m) => ({ id: m.id, name: nameOf(m), email: m.email, status: m.status, shareRawAnswers: m.shareRawAnswers, counted: counted.some((c) => c.id === m.id), sessionId: m.sessionId })),
      named,
      assessedCount: byMember.length,
      domains,
      heatmap: named
        ? byMember.map((x) => ({
            key: x.m.id,
            label: nameOf(x.m),
            values: Object.fromEntries(domains.map((d) => [d.key, level(x.content, d.key)])),
            // Below 0.5 confidence the range is wide: say so on the cell.
            thin: x.content.domains.filter((d) => d.confidence < 0.5).map((d) => d.key),
          }))
        : [],
      aggregates,
      gaps,
      pipeline,
      pairings: pairings.slice(0, 5),
      suggestedTracks: suggested.filter((s) => TRACKS.some((t) => t.key === s.key)),
      assignedTracks: [...new Set(assigned.map((a) => a.track.key))],
    };
  });
}

/** Assign a Grow track to every member who consented (they see it in their own Grow space). */
export async function assignTrack(viewer: OrgViewer, teamId: string, trackKey: string) {
  const team = await withTenant(tenantOf(viewer), (tx) => tx.team.findUnique({ where: { id: teamId }, include: { members: true } }));
  if (!team) throw new Error("Not found");
  const track = await systemDb.track.findFirst({ where: { key: trackKey, organizationId: null } });
  if (!track) throw new Error("Unknown track");
  let n = 0;
  for (const m of team.members.filter((x) => x.userId && (x.status === "CONSENTED" || x.status === "ASSESSED"))) {
    await systemDb.trackEnrollment.upsert({ where: { userId_trackId: { userId: m.userId!, trackId: track.id } }, create: { userId: m.userId!, trackId: track.id, assignedByTeamId: team.id }, update: { assignedByTeamId: team.id } });
    n++;
  }
  await audit({ organizationId: team.organizationId, actorUserId: viewer.user.id, action: "team.track_assigned", targetType: "team", targetId: teamId, metadata: { trackKey, members: n } });
  return n;
}

/** What a manager may see about one member. */
export async function memberView(viewer: OrgViewer, teamId: string, memberId: string) {
  return withTenant(tenantOf(viewer), async (tx) => {
    const team = await tx.team.findUnique({ where: { id: teamId }, include: { members: true } });
    const member = team?.members.find((m) => m.id === memberId);
    if (!team || !member) return null;
    const countedCount = team.members.filter((m) => m.status === "ASSESSED" && m.reportSeenAt).length;
    const allowed = member.status === "ASSESSED" && Boolean(member.reportSeenAt) && countedCount >= MIN_NAMED_TEAM;
    const report = allowed && member.sessionId ? await tx.report.findUnique({ where: { sessionId: member.sessionId } }) : null;
    const user = member.userId ? await systemDb.user.findUnique({ where: { id: member.userId }, select: { name: true } }) : null;
    let content = (report?.content as unknown as ReportContent) ?? null;
    if (content && !member.shareRawAnswers) {
      // Without the member's agreement, no quotes from their answers leave their report.
      content = { ...content, evidence: {}, domains: content.domains.map((d) => ({ ...d, evidenceIds: [], subSkills: d.subSkills.map((s) => ({ ...s, evidenceIds: [] })) })), narrative: { ...content.narrative, strengths: content.narrative.strengths.map((s) => ({ ...s, evidenceIds: [] })), hiddenPotential: content.narrative.hiddenPotential.map((s) => ({ ...s, evidenceIds: [] })), developmentAreas: content.narrative.developmentAreas.map((s) => ({ ...s, evidenceIds: [] })), decisionPattern: { ...content.narrative.decisionPattern, evidenceIds: [] } } };
    }
    if (allowed) await audit({ organizationId: team.organizationId, actorUserId: viewer.user.id, action: "team.member_viewed", targetType: "team_member", targetId: memberId });
    return { team: { id: team.id, name: team.name }, member: { id: member.id, name: user?.name ?? member.email, status: member.status, shareRawAnswers: member.shareRawAnswers }, allowed, countedCount, content };
  });
}

function round1(x: number) {
  return Math.round(x * 10) / 10;
}
