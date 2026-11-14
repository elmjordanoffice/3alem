import { DOMAINS } from "@/lib/framework/data";
import { SENIORITY_LEVEL } from "./config";
import type { RoleProfile } from "./types";

export interface RoleProfileInput {
  /** 0–1 per domain key. Missing domains get 0.3. */
  domainWeights: Record<string, number>;
  /** Importance set by the recruiter, by domain or sub-skill key. */
  importance: { key: string; importance: "MUST_HAVE" | "NICE_TO_HAVE" | "BASELINE" }[];
  seniority: keyof typeof SENIORITY_LEVEL | string;
  /** Role-specific technical sub-skill keys (from the JD Analyst). Empty → generic technical sub-skills. */
  technicalSkills: string[];
  /** Organisation library sub-skills, each placed in its framework domain. */
  extraSkills?: { key: string; domain: string }[];
}

/** Turn a template's analysis and the recruiter's weights into the engine's RoleProfile. */
export function buildRoleProfile(input: RoleProfileInput): RoleProfile {
  const domainOf: Record<string, string> = {};
  const skillKeys: string[] = [];
  for (const d of DOMAINS) {
    // Role-specific technical sub-skills sit alongside the generic ones: generic
    // ones capture general technical judgement (and are what the curated bank
    // measures); specific ones are what the role names.
    const subs = d.key === "technical" ? [...new Set([...input.technicalSkills, ...d.subSkills.map((s) => s.key)])] : d.subSkills.map((s) => s.key);
    for (const k of subs) {
      domainOf[k] = d.key;
      skillKeys.push(k);
    }
  }

  for (const x of input.extraSkills ?? []) {
    if (domainOf[x.key] || !DOMAINS.some((d) => d.key === x.domain)) continue;
    domainOf[x.key] = x.domain;
    skillKeys.push(x.key);
  }

  const domainWeights: Record<string, number> = {};
  for (const d of DOMAINS) domainWeights[d.key] = clamp01(input.domainWeights[d.key] ?? 0.3);

  const skillWeights: Record<string, number> = {};
  const critical: string[] = [];
  for (const { key, importance } of input.importance) {
    const w = importance === "MUST_HAVE" ? 1 : importance === "NICE_TO_HAVE" ? 0.6 : 0.25;
    if (domainOf[key] || key.includes(".")) skillWeights[key] = w;
    else domainWeights[key] = Math.max(domainWeights[key] ?? 0, w);
    if (importance === "MUST_HAVE") critical.push(key);
  }

  return {
    skillWeights,
    domainWeights,
    critical: [...new Set(critical)],
    expectedLevel: SENIORITY_LEVEL[input.seniority] ?? 3,
    skillKeys,
    domainOf,
  };
}

function clamp01(x: number) {
  return Math.min(1, Math.max(0, x));
}
