import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { systemDb, type Db } from "@/lib/db";
import type { TenantTx } from "@/lib/db-core";
import { createModel, type CandidateModel, type RoleProfile } from "@/lib/engine";
import { roleProfileFor, skillCatalog, technicalSkills, type TemplateRow } from "./templates";
import { buildRoleProfile } from "@/lib/engine";

type Tx = TenantTx | Db;

export async function latestModel(sessionId: string, tx: Tx = systemDb): Promise<{ model: CandidateModel; sequence: number }> {
  const snap = await tx.candidateModelSnapshot.findFirst({ where: { sessionId }, orderBy: { sequence: "desc" } });
  if (!snap) throw new Error(`No model for session ${sessionId}`);
  return { model: snap.model as unknown as CandidateModel, sequence: snap.sequence };
}

export async function saveModel(sessionId: string, model: CandidateModel, sequence: number, tx: Tx = systemDb) {
  const session = await tx.assessmentSession.findUniqueOrThrow({ where: { id: sessionId }, select: { organizationId: true, subjectUserId: true } });
  await tx.candidateModelSnapshot.create({
    data: { sessionId, sequence, model: model as unknown as Prisma.InputJsonValue, organizationId: session.organizationId, subjectUserId: session.subjectUserId },
  });
}

/** Mirror the model's hypotheses into the Hypothesis table (for audit and reports). */
export async function syncHypotheses(sessionId: string, model: CandidateModel, tx: Tx = systemDb) {
  const session = await tx.assessmentSession.findUniqueOrThrow({ where: { id: sessionId }, select: { organizationId: true, subjectUserId: true } });
  for (const h of model.hypotheses) {
    const data = {
      competencyKey: h.skill,
      direction: h.direction,
      status: h.status,
      confidence: h.status === "OPEN" ? 0.5 : 0.8,
      evidence: { trigger: h.trigger, validationItemIds: h.validationItemIds, stressItemIds: h.stressItemIds } as Prisma.InputJsonValue,
      conditions: h.condition ? ({ condition: h.condition } as Prisma.InputJsonValue) : undefined,
      ceilingLevel: h.ceiling,
      resolvedAt: h.resolvedAtSeq ? new Date() : null,
    };
    const existing = await tx.hypothesis.findFirst({ where: { sessionId, competencyKey: h.skill, direction: h.direction } });
    if (existing) await tx.hypothesis.update({ where: { id: existing.id }, data });
    else await tx.hypothesis.create({ data: { ...data, sessionId, organizationId: session.organizationId, subjectUserId: session.subjectUserId } });
  }
}

/** The role profile and skill catalogue a session runs against. */
export async function loadRoleProfileForSession(sessionId: string) {
  const session = await systemDb.assessmentSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: { template: { include: { skillWeights: true } } },
  });
  const locale = (session.locale === "ar" ? "ar" : "en") as "en" | "ar";
  if (session.template) {
    const t = session.template as unknown as TemplateRow;
    const tech = technicalSkills(t);
    const catalog = skillCatalog(tech, locale);
    return { session, role: roleProfileFor(t), catalog, template: t, locale };
  }
  // Grow / Team sessions without a template use a balanced profile (set on the session).
  const profileInput = (session.accommodations as { roleProfile?: Parameters<typeof buildRoleProfile>[0] }).roleProfile;
  const role: RoleProfile = buildRoleProfile(
    profileInput ?? { domainWeights: {}, importance: [], seniority: "mid", technicalSkills: [] },
  );
  return { session, role, catalog: skillCatalog([], locale), template: null, locale };
}

export function initialModel(role: RoleProfile) {
  return createModel(role);
}
