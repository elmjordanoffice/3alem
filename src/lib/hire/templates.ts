import "server-only";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { DOMAINS } from "@/lib/framework/data";
import { buildRoleProfile, type RoleProfile } from "@/lib/engine";
import type { TemplateAnalysis, TechnicalSkillDef } from "./jd";

export const accommodationsSchema = z.object({
  extraTimeAllowed: z.boolean().default(true),
  untimedAllowed: z.boolean().default(false),
  largerTextAllowed: z.boolean().default(true),
});
export type TemplateAccommodations = z.infer<typeof accommodationsSchema>;

export interface TemplateRow {
  id: string;
  organizationId: string;
  title: string;
  jobDescription: string;
  analysis: Prisma.JsonValue | null;
  technicalSkillMap: Prisma.JsonValue | null;
  language: string;
  durationMinutes: number;
  accommodations: Prisma.JsonValue;
  status: string;
  skillWeights: { skillKey: string; importance: "MUST_HAVE" | "NICE_TO_HAVE" | "BASELINE"; weight: number }[];
}

export function templateAnalysis(t: Pick<TemplateRow, "analysis">): TemplateAnalysis | null {
  return (t.analysis as unknown as TemplateAnalysis) ?? null;
}

export function technicalSkills(t: Pick<TemplateRow, "technicalSkillMap">): TechnicalSkillDef[] {
  return (t.technicalSkillMap as unknown as TechnicalSkillDef[]) ?? [];
}

export function templateAccommodations(t: Pick<TemplateRow, "accommodations">): TemplateAccommodations {
  return accommodationsSchema.parse(t.accommodations ?? {});
}

/** The engine's view of a template. */
export function roleProfileFor(t: TemplateRow): RoleProfile {
  const analysis = templateAnalysis(t);
  const domainWeights: Record<string, number> = {};
  for (const d of DOMAINS) domainWeights[d.key] = analysis?.domainWeights.find((w) => w.domain === d.key)?.weight ?? 0.3;
  return buildRoleProfile({
    domainWeights,
    importance: t.skillWeights.map((w) => ({ key: w.skillKey, importance: w.importance })),
    seniority: analysis?.seniority ?? "mid",
    technicalSkills: technicalSkills(t).map((s) => s.key),
  });
}

/** Skill weight rows for a fresh analysis. */
export function initialSkillWeights(analysis: TemplateAnalysis, tech: TechnicalSkillDef[]) {
  return [
    ...analysis.domainWeights.map((w) => ({ skillKey: w.domain, importance: w.importance, weight: w.weight })),
    ...tech.map((s) => ({ skillKey: s.key, importance: s.importance, weight: s.importance === "MUST_HAVE" ? 1 : s.importance === "NICE_TO_HAVE" ? 0.6 : 0.3 })),
  ];
}

/** Name and anchors for any sub-skill key in a session (framework or role-specific). */
export function skillCatalog(tech: TechnicalSkillDef[], locale: "en" | "ar") {
  const out: Record<string, { name: string; description: string; anchors: string[]; domain: string }> = {};
  for (const d of DOMAINS) {
    for (const s of d.subSkills) {
      out[s.key] = { name: s.name[locale], description: s.description[locale], anchors: [1, 2, 3, 4, 5].map((l) => s.anchors[l as 1][locale]), domain: d.key };
    }
  }
  for (const t of tech) out[t.key] = { name: t.name, description: t.description, anchors: t.anchors, domain: "technical" };
  return out;
}

export function domainCatalog(locale: "en" | "ar") {
  return Object.fromEntries(DOMAINS.map((d) => [d.key, { name: d.name[locale], order: d.order, highLevel: d.highLevel[locale] }]));
}
