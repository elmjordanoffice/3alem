import "server-only";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { ROLE_FAMILIES } from "@/lib/framework/role-families";
import { systemDb, withTenant } from "@/lib/db";
import { ENGINE_VERSION, buildRoleProfile, createModel, type RoleProfileInput } from "@/lib/engine";
import { curatedWorld } from "@/lib/hire/world";
import { enqueue } from "@/lib/jobs";
import { normalize } from "@/lib/ai/offline/text";

export interface GrowProfileInput {
  currentRole: string;
  experienceYears: number;
  goal: string;
  hoursPerWeek: number;
  /** Own view per domain, 1–5; domains the person wasn't sure about are absent. */
  selfView?: Record<string, number>;
}

/** "How often does this describe you?" answers, as levels on the 1–5 scale. */
export const SELF_VIEW_LEVELS = { rarely: 1.5, sometimes: 2.5, often: 3.5, almostAlways: 4.5 } as const;

export function detectFamily(text: string): string {
  const t = normalize(text);
  let best = { key: "general-management", hits: 0 };
  for (const f of ROLE_FAMILIES) {
    const hits = f.keywords.reduce((n, k) => n + (t.includes(normalize(k)) ? 1 : 0), 0);
    if (hits > best.hits) best = { key: f.key, hits };
  }
  return best.key;
}

export function seniorityFromYears(years: number) {
  return years < 2 ? "entry" : years < 5 ? "mid" : years < 9 ? "senior" : "lead";
}

/** The engine profile for a person's Grow sessions: weighted towards their goal. */
export function growRoleProfileInput(p: { targetFamily: string; experienceYears: number }): RoleProfileInput {
  const family = ROLE_FAMILIES.find((f) => f.key === p.targetFamily) ?? ROLE_FAMILIES[0]!;
  const ranked = Object.entries(family.domainWeights).sort((a, b) => b[1] - a[1]);
  return {
    domainWeights: family.domainWeights,
    importance: ranked.slice(0, 3).map(([key]) => ({ key, importance: "MUST_HAVE" as const })),
    seniority: seniorityFromYears(p.experienceYears),
    technicalSkills: family.technicalSkills.map((s) => s.key),
  };
}

export async function getGrowProfile(userId: string) {
  return withTenant({ userId }, (tx) => tx.growProfile.findUnique({ where: { userId } }));
}

export async function saveGrowProfile(userId: string, input: GrowProfileInput) {
  const targetFamily = detectFamily(`${input.goal} ${input.currentRole}`);
  return withTenant({ userId }, (tx) =>
    tx.growProfile.upsert({
      where: { userId },
      create: { userId, ...input, targetFamily },
      update: { ...input, targetFamily },
    }),
  );
}

/**
 * Start a Grow baseline (or re-assessment): a 30-minute adaptive session in
 * the person's own private space. No organisation can see it.
 */
export async function startGrowSession(userId: string, locale: "en" | "ar") {
  const profile = await getGrowProfile(userId);
  if (!profile) throw new Error("Complete onboarding first");
  const roleInput = growRoleProfileInput(profile);
  const role = buildRoleProfile(roleInput);
  const session = await systemDb.assessmentSession.create({
    data: {
      organizationId: null,
      subjectUserId: userId,
      mode: "GROW",
      status: "STARTED",
      phase: "CALIBRATE",
      timeBudgetMinutes: 30,
      locale,
      accommodations: { extraTime: 1, untimed: false, largerText: false, roleProfile: roleInput } as unknown as Prisma.InputJsonValue,
      engineVersion: ENGINE_VERSION,
      startedAt: new Date(),
    },
  });
  await systemDb.candidateModelSnapshot.create({ data: { sessionId: session.id, sequence: 0, model: createModel(role) as unknown as Prisma.InputJsonValue, subjectUserId: userId } });
  const { id, world } = curatedWorld(profile.currentRole, locale);
  await systemDb.scenarioWorld.create({
    data: {
      sessionId: session.id,
      subjectUserId: userId,
      companyName: world.companyName,
      industry: world.industry,
      summary: { ...world, yourRole: profile.currentRole } as unknown as Prisma.InputJsonValue,
      cast: world.cast as unknown as Prisma.InputJsonValue,
      hooks: { decisions: [] },
      promptVersion: `bank:${id}`,
    },
  });
  void enqueue("pregenerate", { sessionId: session.id }, session.id);
  return session;
}

/** The person's Grow sessions, newest first. */
export async function growSessions(userId: string) {
  return withTenant({ userId }, (tx) =>
    tx.assessmentSession.findMany({ where: { subjectUserId: userId, mode: "GROW" }, orderBy: { createdAt: "desc" }, include: { report: { select: { id: true, status: true, content: true, createdAt: true } } } }),
  );
}

export { randomUUID };
