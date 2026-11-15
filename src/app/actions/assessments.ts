"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { withTenant, systemDb } from "@/lib/db";
import { requirePermission, tenantOf } from "@/lib/auth/session";
import { audit } from "@/lib/audit";
import { analyzeJobDescription } from "@/lib/hire/jd";
import { initialSkillWeights, templateAnalysis, type TemplateRow } from "@/lib/hire/templates";
import { createInvitation, parseCandidateList } from "@/lib/hire/invitations";
import { generateToken, hashToken } from "@/lib/hire/tokens";
import { sendMail } from "@/lib/mail";
import { brandedEmail } from "@/lib/mail/templates";
import { appUrl } from "@/lib/hire/invitations";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const createSchema = z.object({ jobDescription: z.string().trim().min(80).max(20000) });

/** Paste a job description → the JD Analyst drafts the assessment. */
export async function createAssessment(input: { jobDescription: string }): Promise<Result<{ id: string }>> {
  const viewer = await requirePermission("assessment.create");
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "jdLength" };
  const { analysis, technicalSkills: tech } = await analyzeJobDescription(parsed.data.jobDescription, { organizationId: viewer.activeOrganization.id });
  const template = await withTenant(tenantOf(viewer), (tx) =>
    tx.assessmentTemplate.create({
      data: {
        organizationId: viewer.activeOrganization.id,
        createdById: viewer.user.id,
        title: analysis.roleTitle.slice(0, 120),
        jobDescription: parsed.data.jobDescription,
        analysis: analysis as object,
        technicalSkillMap: tech as object,
        language: analysis.language,
        durationMinutes: 50,
        accommodations: { extraTimeAllowed: true, untimedAllowed: false, largerTextAllowed: true },
        status: "DRAFT",
        skillWeights: { create: initialSkillWeights(analysis, tech).map((w) => ({ ...w, organizationId: viewer.activeOrganization.id })) },
      },
    }),
  );
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "assessment.created", targetType: "template", targetId: template.id, metadata: { source: analysis.source, flags: analysis.flags.length } });
  return { ok: true, id: template.id };
}

const importance = z.enum(["MUST_HAVE", "NICE_TO_HAVE", "BASELINE"]);
const setupSchema = z.object({
  id: z.string(),
  title: z.string().trim().min(2).max(120),
  seniority: z.enum(["entry", "mid", "senior", "lead", "executive"]),
  durationMinutes: z.number().int().min(25).max(90),
  language: z.enum(["en", "ar"]),
  accommodations: z.object({ extraTimeAllowed: z.boolean(), untimedAllowed: z.boolean(), largerTextAllowed: z.boolean() }),
  domains: z.array(z.object({ key: z.string(), importance })).length(9),
  technical: z
    .array(z.object({ key: z.string().optional(), name: z.string().trim().min(2).max(80), description: z.string().trim().max(300), anchors: z.array(z.string()).length(5), importance, domain: z.string().max(40).optional() }))
    .min(1)
    .max(8),
  acknowledgedFlags: z.boolean(),
});

/** Save the recruiter's review of the drafted assessment. */
export async function saveSetup(input: z.input<typeof setupSchema>): Promise<Result> {
  const viewer = await requirePermission("assessment.create");
  const p = setupSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  const d = p.data;
  return withTenant(tenantOf(viewer), async (tx) => {
    const t = await tx.assessmentTemplate.findUnique({ where: { id: d.id } });
    if (!t) return { ok: false as const, error: "notFound" };
    if (t.status === "PUBLISHED" && (await tx.invitation.count({ where: { templateId: t.id } })) > 0) {
      // Weights can't change once candidates are in, or reports wouldn't be comparable.
      await tx.assessmentTemplate.update({ where: { id: t.id }, data: { title: d.title, accommodations: d.accommodations } });
      return { ok: true as const };
    }
    const analysis = { ...((t.analysis as object) ?? {}), seniority: d.seniority, roleTitle: d.title, flagsAcknowledged: d.acknowledgedFlags };
    const family = (t.analysis as { roleFamily?: string } | null)?.roleFamily?.split("-")[0] ?? "role";
    const tech = d.technical.map((s) => ({
      key: s.key && (s.key.startsWith("technical.") || s.key.startsWith("org.")) ? s.key : `technical.${family}.${s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "skill"}`,
      name: s.name,
      description: s.description,
      anchors: s.anchors,
      importance: s.importance,
      ...(s.key?.startsWith("org.") && s.domain ? { domain: s.domain } : {}),
    }));
    await tx.templateSkillWeight.deleteMany({ where: { templateId: t.id } });
    const domainWeight = (k: string) => (t.analysis as { domainWeights?: { domain: string; weight: number }[] } | null)?.domainWeights?.find((w) => w.domain === k)?.weight ?? 0.3;
    await tx.templateSkillWeight.createMany({
      data: [
        ...d.domains.map((x) => ({ organizationId: t.organizationId, templateId: t.id, skillKey: x.key, importance: x.importance, weight: x.importance === "MUST_HAVE" ? Math.max(0.8, domainWeight(x.key)) : x.importance === "NICE_TO_HAVE" ? Math.max(0.5, domainWeight(x.key)) : Math.min(0.4, domainWeight(x.key)) })),
        ...tech.map((s) => ({ organizationId: t.organizationId, templateId: t.id, skillKey: s.key, importance: s.importance, weight: s.importance === "MUST_HAVE" ? 1 : s.importance === "NICE_TO_HAVE" ? 0.6 : 0.3 })),
      ],
    });
    await tx.assessmentTemplate.update({
      where: { id: t.id },
      data: { title: d.title, durationMinutes: d.durationMinutes, language: d.language, accommodations: d.accommodations, analysis: analysis as object, technicalSkillMap: tech as object },
    });
    return { ok: true as const };
  });
}

export async function publishAssessment(id: string): Promise<Result> {
  const viewer = await requirePermission("assessment.create");
  const t = await withTenant(tenantOf(viewer), async (tx) => {
    const row = await tx.assessmentTemplate.findUnique({ where: { id } });
    if (!row) return null;
    const analysis = row.analysis as { flags?: unknown[]; flagsAcknowledged?: boolean } | null;
    if ((analysis?.flags?.length ?? 0) > 0 && !analysis?.flagsAcknowledged) return "flags" as const;
    return tx.assessmentTemplate.update({ where: { id }, data: { status: "PUBLISHED", publishedAt: new Date() } });
  });
  if (!t) return { ok: false, error: "notFound" };
  if (t === "flags") return { ok: false, error: "flags" };
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "assessment.published", targetType: "template", targetId: id });
  revalidatePath(`/app/assessments/${id}`);
  return { ok: true };
}

export async function archiveAssessment(id: string): Promise<Result> {
  const viewer = await requirePermission("assessment.create");
  await withTenant(tenantOf(viewer), (tx) => tx.assessmentTemplate.update({ where: { id }, data: { status: "ARCHIVED" } }));
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "assessment.archived", targetType: "template", targetId: id });
  revalidatePath("/app/assessments");
  redirect("/app/assessments");
}

const inviteSchema = z.object({
  templateId: z.string(),
  list: z.string().max(200_000),
  send: z.boolean(),
});

/** Invite candidates by email list or CSV. With send=false, returns links to share yourself. */
export async function inviteCandidates(input: z.input<typeof inviteSchema>): Promise<Result<{ created: { email: string; link: string }[]; skipped: number }>> {
  const viewer = await requirePermission("candidate.invite");
  const p = inviteSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  const people = parseCandidateList(p.data.list);
  if (people.length === 0) return { ok: false, error: "noEmails" };
  if (people.length > 500) return { ok: false, error: "tooMany" };
  const template = await withTenant(tenantOf(viewer), (tx) => tx.assessmentTemplate.findUnique({ where: { id: p.data.templateId } }));
  if (!template) return { ok: false, error: "notFound" };
  if (template.status !== "PUBLISHED") return { ok: false, error: "notPublished" };
  const existing = new Set(
    (await withTenant(tenantOf(viewer), (tx) => tx.invitation.findMany({ where: { templateId: template.id, status: { not: "REVOKED" } }, select: { email: true } }))).map((i) => i.email),
  );
  const created: { email: string; link: string }[] = [];
  let skipped = 0;
  const analysis = templateAnalysis(template as unknown as TemplateRow);
  for (const person of people) {
    if (existing.has(person.email)) {
      skipped++;
      continue;
    }
    const r = await createInvitation({
      organizationId: template.organizationId,
      templateId: template.id,
      invitedById: viewer.user.id,
      email: person.email,
      name: person.name,
      send: p.data.send,
      orgName: viewer.activeOrganization.name,
      roleTitle: analysis?.roleTitle ?? template.title,
      minutes: template.durationMinutes,
      language: template.language === "ar" ? "ar" : "en",
    });
    created.push({ email: person.email, link: r.link });
  }
  await audit({ organizationId: template.organizationId, actorUserId: viewer.user.id, action: "candidates.invited", targetType: "template", targetId: template.id, metadata: { count: created.length, emailed: p.data.send } });
  revalidatePath(`/app/assessments/${template.id}`);
  return { ok: true, created, skipped };
}

export async function revokeInvitation(invitationId: string): Promise<Result> {
  const viewer = await requirePermission("candidate.invite");
  const inv = await withTenant(tenantOf(viewer), (tx) => tx.invitation.update({ where: { id: invitationId }, data: { status: "REVOKED" } }));
  await audit({ organizationId: inv.organizationId, actorUserId: viewer.user.id, action: "invitation.revoked", targetType: "invitation", targetId: invitationId });
  revalidatePath(`/app/assessments/${inv.templateId}`);
  return { ok: true };
}

/** A new link for an invitation (old one stops working). Optionally re-sends the email. */
export async function renewInvitationLink(invitationId: string, send: boolean): Promise<Result<{ link: string }>> {
  const viewer = await requirePermission("candidate.invite");
  const token = generateToken();
  const inv = await withTenant(tenantOf(viewer), (tx) =>
    tx.invitation.update({ where: { id: invitationId }, data: { tokenHash: hashToken(token), status: "PENDING", expiresAt: new Date(Date.now() + 14 * 86400_000) }, include: { template: true } }),
  );
  const link = `${appUrl()}/a/${token}`;
  if (send) {
    const lang = inv.template.language === "ar" ? "ar" : "en";
    await sendMail({ to: inv.email, ...brandedEmail("renew", lang, { role: inv.template.title, org: viewer.activeOrganization.name, days: 14 }, { url: link, org: viewer.activeOrganization.name }) });
  }
  await audit({ organizationId: inv.organizationId, actorUserId: viewer.user.id, action: "invitation.renewed", targetType: "invitation", targetId: invitationId, metadata: { emailed: send } });
  return { ok: true, link };
}

const shareSchema = z.object({ sessionId: z.string(), days: z.union([z.literal(7), z.literal(14), z.literal(30)]), audience: z.enum(["team", "candidate"]) });

/** A read-only link to a report, with an expiry. "candidate" links go to the candidate by email. */
export async function shareReport(input: z.input<typeof shareSchema>): Promise<Result<{ link: string; expiresAt: string }>> {
  const viewer = await requirePermission("report.share");
  const p = shareSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  const token = generateToken();
  const expiresAt = new Date(Date.now() + p.data.days * 86400_000);
  const result = await withTenant(tenantOf(viewer), async (tx) => {
    const report = await tx.report.findUnique({ where: { sessionId: p.data.sessionId }, include: { session: { include: { invitation: true, template: true } } } });
    if (!report || report.status !== "READY") return null;
    await tx.reportShareLink.create({
      data: { reportId: report.id, organizationId: report.organizationId, subjectUserId: report.subjectUserId, tokenHash: hashToken(token), audience: p.data.audience, expiresAt, createdById: viewer.user.id },
    });
    if (p.data.audience === "candidate") await tx.report.update({ where: { id: report.id }, data: { sharedWithCandidate: true } });
    return report;
  });
  if (!result) return { ok: false, error: "notReady" };
  const link = `${appUrl()}/r/${token}`;
  if (p.data.audience === "candidate" && result.session.invitation?.email) {
    const lang = (result.content as { language?: string } | null)?.language === "ar" ? "ar" : "en";
    const date = new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en-GB", { day: "numeric", month: "long", year: "numeric" }).format(expiresAt);
    await sendMail({
      to: result.session.invitation.email,
      ...brandedEmail("report", lang, { org: viewer.activeOrganization.name, role: result.session.template?.title ?? "", date }, { url: link, org: viewer.activeOrganization.name }),
    });
  }
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "report.shared", targetType: "report", targetId: result.id, metadata: { audience: p.data.audience, days: p.data.days } });
  return { ok: true, link, expiresAt: expiresAt.toISOString() };
}

export async function revokeShareLink(linkId: string): Promise<Result> {
  const viewer = await requirePermission("report.share");
  await withTenant(tenantOf(viewer), (tx) => tx.reportShareLink.update({ where: { id: linkId }, data: { revokedAt: new Date() } }));
  await audit({ organizationId: viewer.activeOrganization.id, actorUserId: viewer.user.id, action: "report.share_revoked", targetType: "share_link", targetId: linkId });
  return { ok: true };
}

/** Rebuild a report (e.g. after a scorer update). */
export async function regenerateReport(sessionId: string): Promise<Result> {
  const viewer = await requirePermission("assessment.create");
  const s = await withTenant(tenantOf(viewer), (tx) => tx.assessmentSession.findUnique({ where: { id: sessionId } }));
  if (!s) return { ok: false, error: "notFound" };
  await systemDb.report.updateMany({ where: { sessionId }, data: { status: "PENDING" } });
  const { buildReport } = await import("@/lib/hire/report");
  await buildReport(sessionId);
  revalidatePath(`/app/reports/${sessionId}`);
  return { ok: true };
}

