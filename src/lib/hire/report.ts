import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { DOMAINS } from "@/lib/framework/data";
import { itemContentSchema } from "@/lib/assessment/item-schema";
import { systemDb } from "@/lib/db";
import {
  ENGINE_VERSION,
  estimateDomain,
  estimateSkill,
  roleFit,
  workStylePositions,
  type CandidateModel,
  type RoleProfile,
} from "@/lib/engine";
import { levelRangeFromVariance } from "@/lib/levels";
import { reportWriter, reportNarrativeSchema, type ReportNarrative } from "@/lib/ai/prompts/report-writer";
import { getProvider, runAgent } from "@/lib/ai/run";
import { latestModel, loadRoleProfileForSession } from "./model-store";
import { templateAnalysis } from "./templates";
import { analyseIntegrity } from "./integrity";
import { offlineNarrative } from "./report-offline";
import type { ReportContent, ReportDomain, ReportEvidence, ReportSkill } from "./report-types";

/**
 * Build the report for a finished session. Everything numeric (levels, ranges,
 * confidence, fit) is computed here from the Candidate Model; the writer only
 * phrases it, and every claim must cite evidence that exists.
 */
export async function buildReport(sessionId: string): Promise<void> {
  const { session, role, catalog, template, locale } = await loadRoleProfileForSession(sessionId);
  const existing = await systemDb.report.findUnique({ where: { sessionId } });
  if (existing?.status === "READY") return;

  await analyseIntegrity(sessionId).catch((e) => console.error("[report] integrity analysis failed", e));
  const { model } = await latestModel(sessionId);
  const kind = session.mode === "GROW" ? "GROW" : session.mode === "TEAM" ? "TEAM_MEMBER" : "HIRE";
  const analysis = template ? templateAnalysis(template) : null;
  const subject = session.subjectUserId ? await systemDb.user.findUnique({ where: { id: session.subjectUserId }, select: { name: true } }) : null;

  // Evidence: final scores, with short ids for the writer.
  const scores = await systemDb.itemScore.findMany({
    where: { sessionId, isFinal: true },
    include: { item: { select: { content: true, chapter: true } }, response: { select: { stage: true } } },
    orderBy: { createdAt: "asc" },
  });
  const evidence: Record<string, ReportEvidence> = {};
  scores.forEach((s, i) => {
    const id = `E${i + 1}`;
    evidence[id] = {
      id,
      scoreId: s.id,
      skillKey: s.competencyKey,
      level: s.level,
      confidence: s.confidence,
      quote: s.evidenceQuote,
      rationale: s.rationale,
      itemTitle: itemContentSchema.safeParse(s.item.content).data?.title ?? "",
      chapter: s.item.chapter,
      stage: s.response.stage,
    };
  });
  const evidenceBySkill = (key: string) => Object.values(evidence).filter((e) => e.skillKey === key).sort((a, b) => b.confidence - a.confidence).map((e) => e.id);
  const importanceOf = (key: string) => (template?.skillWeights.find((w) => w.skillKey === key)?.importance ?? null) as ReportSkill["importance"];

  const domains: ReportDomain[] = DOMAINS.map((d) => {
    const de = estimateDomain(model, d.key);
    const subKeys = role.skillKeys.filter((k) => role.domainOf[k] === d.key);
    const subSkills: ReportSkill[] = subKeys
      .map((k) => {
        const e = estimateSkill(model, k);
        return {
          key: k,
          name: catalog[k]?.name ?? k,
          estimate: round1(e.mean),
          confidence: round2(e.confidence),
          range: levelRangeFromVariance(e.mean, e.variance),
          observations: e.observations,
          evidenceIds: evidenceBySkill(k),
          flags: model.skills[k]?.flags ?? [],
          importance: importanceOf(k),
        };
      })
      // Show what was measured, plus role-specific technical skills even if inferred.
      .filter((s) => s.observations > 0 || (d.key === "technical" && !DOMAINS[0]!.subSkills.some((g) => g.key === s.key)));
    return {
      key: d.key,
      name: d.name[locale],
      estimate: round1(de.mean),
      confidence: round2(de.confidence),
      range: levelRangeFromVariance(de.mean, de.variance),
      observations: de.observations,
      evidenceIds: subSkills.flatMap((s) => s.evidenceIds).slice(0, 6),
      flags: [],
      importance: importanceOf(d.key),
      subSkills,
    };
  });

  const fit = roleFit(model, role);
  const hypotheses = model.hypotheses
    .filter((h) => h.status !== "OPEN")
    .map((h) => ({ skillKey: h.skill, name: catalog[h.skill]?.name ?? h.skill, direction: h.direction, status: h.status, ceiling: h.ceiling, condition: h.condition }));
  const workStyle = Object.entries(workStylePositions(model)).map(([key, v]) => ({ key, ...v }));

  const events = await systemDb.integrityEvent.groupBy({ by: ["type"], where: { sessionId }, _count: true });
  const count = (t: string) => events.find((e) => e.type === t)?._count ?? 0;
  const itemsCompleted = await systemDb.item.count({ where: { sessionId, status: "ANSWERED" } });
  const inconsistent = Object.values(model.skills).filter((s) => s.flags.includes("inconsistent")).map((s) => catalog[s.key]?.name ?? s.key);

  const facts = narrativeFacts({ model, role, catalog, domains, evidence, fit, hypotheses, workStyle });
  let narrative: ReportNarrative;
  let writer = "report-offline.v1";
  if (getProvider()) {
    try {
      const { output } = await runAgent(
        reportWriter,
        { kind: kind === "GROW" ? "GROW" : "HIRE", language: locale, roleTitle: analysis?.roleTitle ?? template?.title ?? "", roleFit: `${fit.fit} (confidence ${round2(fit.confidence)})`, ...facts },
        { organizationId: session.organizationId, sessionId },
      );
      narrative = sanitizeNarrative(reportNarrativeSchema.parse(output), evidence);
      writer = reportWriter.version;
    } catch (e) {
      console.warn("[report] writer failed; using offline narrative", e);
      narrative = offlineNarrative({ locale, kind, domains, evidence, fit, hypotheses, workStyle, role, catalog, model });
    }
  } else {
    narrative = offlineNarrative({ locale, kind, domains, evidence, fit, hypotheses, workStyle, role, catalog, model });
  }

  const versions = [...new Set((await systemDb.itemScore.findMany({ where: { sessionId }, select: { scorerVersion: true } })).map((s) => s.scorerVersion))];
  const doubleScored = (await systemDb.itemScore.groupBy({ by: ["responseId"], where: { sessionId, pass: 2 } })).length;

  const content: ReportContent = {
    version: "report.v1",
    kind,
    language: locale,
    generatedAt: new Date().toISOString(),
    earlyVersion: true,
    candidate: { name: subject?.name ?? "" },
    role: { title: analysis?.roleTitle ?? template?.title ?? "", seniority: analysis?.seniority ?? "mid", family: analysis?.roleFamily ?? null },
    fit: { level: fit.fit, confidence: round2(fit.confidence), margin: round2(fit.margin), gaps: fit.gaps.map((g) => ({ key: g.key, name: catalog[g.key]?.name ?? domains.find((d) => d.key === g.key)?.name ?? g.key, gap: round1(g.gap) })) },
    domains,
    narrative,
    evidence,
    hypotheses,
    workStyle,
    integrity: {
      minutesUsed: Math.round(session.elapsedSeconds / 60),
      budgetMinutes: session.timeBudgetMinutes,
      itemsCompleted,
      pasteEvents: count("PASTE"),
      tabHidden: count("TAB_HIDDEN"),
      styleShifts: count("STYLE_SHIFT"),
      inconsistentSkills: inconsistent,
      notes: count("TIMING_ANOMALY") ? [`timing:${count("TIMING_ANOMALY")}`] : [],
    },
    method: {
      scoring: versions.some((v) => v.startsWith("scorer.v")) ? "anthropic" : "offline",
      scorerVersions: versions,
      writer,
      engineVersion: ENGINE_VERSION,
      doubleScoredItems: doubleScored,
    },
  };

  await systemDb.report.upsert({
    where: { sessionId },
    create: {
      sessionId,
      organizationId: session.organizationId,
      subjectUserId: session.subjectUserId,
      kind,
      status: "READY",
      roleFit: kind === "HIRE" ? fit.fit : null,
      content: content as unknown as Prisma.InputJsonValue,
      writerVersion: writer,
    },
    update: { status: "READY", roleFit: kind === "HIRE" ? fit.fit : null, content: content as unknown as Prisma.InputJsonValue, writerVersion: writer },
  });
  await systemDb.assessmentSession.update({ where: { id: sessionId }, data: { status: "REPORTED" } });
}

/** Drop any claim whose evidence ids don't exist; every claim must cite evidence. */
export function sanitizeNarrative(n: ReportNarrative, evidence: Record<string, unknown>): ReportNarrative {
  const ok = (ids: string[]) => ids.filter((id) => id in evidence);
  const claims = (list: ReportNarrative["strengths"]) => list.map((c) => ({ ...c, evidenceIds: ok(c.evidenceIds) })).filter((c) => c.evidenceIds.length > 0);
  return {
    ...n,
    strengths: claims(n.strengths),
    hiddenPotential: claims(n.hiddenPotential),
    developmentAreas: claims(n.developmentAreas),
    decisionPattern: { ...n.decisionPattern, evidenceIds: ok(n.decisionPattern.evidenceIds) },
  };
}

function narrativeFacts(x: {
  model: CandidateModel;
  role: RoleProfile;
  catalog: Record<string, { name: string }>;
  domains: ReportDomain[];
  evidence: Record<string, ReportEvidence>;
  fit: ReturnType<typeof roleFit>;
  hypotheses: ReportContent["hypotheses"];
  workStyle: ReportContent["workStyle"];
}) {
  const profile = x.domains
    .map((d) => `${d.name}: ${d.estimate} (range ${d.range[0]}–${d.range[1]}, confidence ${d.confidence})\n${d.subSkills.map((s) => `  - ${s.key} ${s.name}: ${s.estimate} (${s.range[0]}–${s.range[1]}, conf ${s.confidence}${s.flags.length ? `, ${s.flags.join("/")}` : ""})`).join("\n")}`)
    .join("\n");
  const hypotheses = x.hypotheses.map((h) => `${h.direction} ${h.status}: ${h.skillKey}${h.ceiling ? ` ceiling ${h.ceiling}` : ""}${h.condition ? ` condition ${h.condition}` : ""}`).join("\n");
  const beyondRole = x.domains
    .flatMap((d) => d.subSkills)
    .filter((s) => s.estimate >= Math.max(4, x.role.expectedLevel + 0.75) && (x.role.domainWeights[x.role.domainOf[s.key] ?? ""] ?? 0) < 0.5 && s.confidence >= 0.5)
    .map((s) => `${s.key} ${s.name}: ${s.estimate}`)
    .join("\n");
  const workStyle = x.workStyle.map((w) => `${w.key}: ${w.position.toFixed(2)} (n=${w.n})`).join("\n");
  const evidence = Object.values(x.evidence)
    .map((e) => `${e.id} | ${e.skillKey} | level ${e.level} | chapter ${e.chapter} "${e.itemTitle}" (${e.stage}) | "${e.quote}"`)
    .join("\n");
  const lowConfidence = x.domains
    .flatMap((d) => d.subSkills)
    .filter((s) => x.role.critical.includes(s.key) || x.role.critical.includes(x.role.domainOf[s.key] ?? "") || s.observations > 0)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 5)
    .map((s) => `${s.key} ${s.name}: confidence ${s.confidence}`)
    .join("\n");
  return { profile, hypotheses, beyondRole, workStyle, evidence, lowConfidence };
}

function round1(x: number) {
  return Math.round(x * 10) / 10;
}
function round2(x: number) {
  return Math.round(x * 100) / 100;
}
