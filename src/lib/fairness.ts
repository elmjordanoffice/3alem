import "server-only";
import { systemDb } from "@/lib/db";

import { FAIRNESS_FIELDS, aggregateFairness, pearson, type FairnessCutoff, type FairnessField } from "./fairness-core";

export { FAIRNESS_FIELDS, FIT_LEVELS, MIN_GROUP, type FairnessCutoff, type FairnessField, type FairnessGroup } from "./fairness-core";

export async function saveFairnessResponse(sessionId: string, organizationId: string | null, answers: Partial<Record<FairnessField, string>>) {
  const clean = Object.fromEntries(FAIRNESS_FIELDS.map((f) => [f, answers[f] && answers[f] !== "prefer_not" ? answers[f]!.slice(0, 40) : null]));
  await systemDb.fairnessResponse.upsert({ where: { sessionRef: sessionId }, create: { sessionRef: sessionId, organizationId, ...clean }, update: clean });
}

/**
 * Score distributions by voluntary self-reported group, with adverse-impact
 * monitoring by the four-fifths rule: a group whose rate of Strong/Good fit
 * is below 80% of the highest group's rate is flagged for review.
 * Aggregation runs on the system connection; only aggregates leave it.
 */
export async function fairnessReport(organizationId: string, templateId?: string | null, cutoff: FairnessCutoff = "GOOD") {
  const rows = await systemDb.$queryRaw<{ gender: string | null; ageBand: string | null; disability: string | null; firstLanguage: string | null; roleFit: string; margin: number | null }[]>`
    SELECT f.gender, f."ageBand", f.disability, f."firstLanguage", r."roleFit"::text AS "roleFit", (r.content->'fit'->>'margin')::float AS margin
    FROM fairness_response f
    JOIN report r ON r."sessionId" = f."sessionRef"
    JOIN assessment_session s ON s.id = r."sessionId"
    WHERE r.status = 'READY' AND r.kind = 'HIRE' AND s."organizationId" = ${organizationId}
      AND (${templateId ?? null}::text IS NULL OR s."templateId" = ${templateId ?? null})`;
  return aggregateFairness(rows, cutoff);
}

/** Correlation between role-fit margin and later job performance. */
export async function validity(organizationId: string) {
  const rows = await systemDb.$queryRaw<{ margin: number | null; rating: number; period: number }[]>`
    SELECT (r.content->'fit'->>'margin')::float AS margin, o.rating, o.period
    FROM outcome_rating o JOIN report r ON r."sessionId" = o."sessionId"
    WHERE o."organizationId" = ${organizationId} AND r.status = 'READY'`;
  const pairs = rows.filter((r) => r.margin !== null).map((r) => [r.margin!, r.rating] as const);
  return { n: pairs.length, r: pairs.length >= 3 ? pearson(pairs) : null };
}
