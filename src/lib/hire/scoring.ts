import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { itemContentSchema, itemHiddenSchema, type ItemHidden } from "@/lib/assessment/item-schema";
import { responseContentSchema, responseText, candidateWords } from "@/lib/assessment/response-schema";
import { systemDb } from "@/lib/db";
import { recordWorkStyle, reviewHypotheses, updateModel, type CandidateModel, type ScoreInput } from "@/lib/engine";
import { scorer, type ScorerOutput } from "@/lib/ai/prompts/scorer";
import { getProvider, runAgent } from "@/lib/ai/run";
import { offlineScore } from "@/lib/ai/offline/scorer";
import { anchorsFor } from "@/lib/ai/prompts/shared";
import { rubricKeysForStage, type ItemMeta } from "./items";
import { loadRoleProfileForSession, latestModel, saveModel, syncHypotheses } from "./model-store";

export const SCORER_OFFLINE_VERSION = "scorer-offline.v2";

/** Normalise for verbatim comparison: whitespace and quote styles only. */
function norm(s: string) {
  return s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, " ").trim().toLowerCase();
}

/** No quote, no score: drop any score whose quote is not in the candidate's words. */
export function enforceVerbatim(out: ScorerOutput, words: string, allowedKeys: Set<string>): { kept: ScorerOutput["scores"]; dropped: number } {
  const hay = norm(words);
  const kept = out.scores.filter((s) => allowedKeys.has(s.competencyKey) && s.evidenceQuote.trim().length >= 3 && hay.includes(norm(s.evidenceQuote)));
  return { kept, dropped: out.scores.length - kept.length };
}

function itemTextForScorer(content: ReturnType<typeof itemContentSchema.parse>, stage: string): string {
  const parts = [`Title: ${content.title}`, `Scenario: ${content.scenario}`, `Task: ${content.task.prompt}`];
  if (content.task.options) parts.push(`Options: ${content.task.options.map((o) => `${o.id}) ${o.label}`).join(" | ")}`);
  if (stage === "PROBE" && content.probe) parts.push(`Follow-up question: ${content.probe.prompt}`);
  if (stage === "TWIST" && content.twist) parts.push(`Change: ${content.twist.change ?? ""}\nFollow-up question: ${content.twist.prompt}`);
  return parts.join("\n");
}

function rubricFor(keys: string[], hidden: ItemHidden, catalog: Record<string, { name: string; anchors: string[] }>) {
  return keys.map((k) => {
    const own = hidden.rubric.find((r) => r.competencyKey === k);
    if (own) return own;
    // Follow-ups can show framework skills the item rubric doesn't spell out.
    const fromFramework = anchorsFor([k], catalog)
      .split("\n")
      .slice(1)
      .map((l) => l.replace(/^\s*\d:\s*/, ""));
    return { competencyKey: k, anchors: fromFramework.length === 5 ? fromFramework : ["Absent", "Partial", "Solid", "Strong", "Exceptional"] };
  });
}

/**
 * Score one response, persist ItemScores, and update the Candidate Model.
 *
 * High-impact items (hypothesis validation/stress, or must-have skills) are
 * scored twice independently; if the passes differ by more than one level on
 * any sub-skill, a third pass decides. All passes are stored; only the final
 * level per sub-skill updates the model.
 */
export async function scoreResponse(responseId: string): Promise<void> {
  const response = await systemDb.response.findUnique({
    where: { id: responseId },
    include: { item: true, session: true, scores: { select: { id: true }, take: 1 } },
  });
  if (!response || response.scores.length) return; // missing or already scored
  if (response.stage === "ROLE_PLAY_TURN") return; // turns are scored as one transcript at the end

  const item = response.item;
  const content = itemContentSchema.parse(item.content);
  const hidden = itemHiddenSchema.parse(item.rubric);
  const meta = item.meta as unknown as ItemMeta;
  const parsed = responseContentSchema.parse(response.content);
  const stage = response.stage as "MAIN" | "PROBE" | "TWIST";
  const { role, catalog, session } = await loadRoleProfileForSession(response.sessionId);

  // Forced choice: work-style tallies, no scores.
  if (parsed.kind === "forced_choice") {
    const picks = (hidden.workStyleMap ?? []).flatMap((m) => {
      const choice = parsed.picks[m.pairId];
      if (!choice) return [];
      const side = m[choice];
      return [{ style: side.style, pole: side.pole }];
    });
    await withModelLock(response.sessionId, async (model) => recordWorkStyle(model, picks));
    return;
  }

  const keys = rubricKeysForStage(stage, item.targetCompetencyKeys, hidden).filter((k) => role.skillKeys.includes(k));
  if (keys.length === 0) return;
  const words = candidateWords(parsed);
  const text = responseText(parsed, content);
  const allowed = new Set(keys);
  const highImpact = meta.purpose === "validate" || meta.purpose === "stress" || keys.some((k) => role.critical.includes(k) || role.critical.includes(role.domainOf[k] ?? ""));

  type Pass = { pass: number; scores: ScorerOutput["scores"]; noticed: boolean; version: string };
  const passes: Pass[] = [];

  if (getProvider() && words.trim().length > 0) {
    const input = {
      itemText: itemTextForScorer(content, stage),
      stage,
      rubric: rubricFor(keys, hidden, catalog),
      strongIndicators: hidden.strongIndicators.filter((s) => allowed.has(s.competencyKey)).map((s) => s.text),
      redFlags: hidden.redFlags.filter((s) => allowed.has(s.competencyKey)).map((s) => s.text),
      embeddedDetail: hidden.embeddedDetail ? `${hidden.embeddedDetail.description} (${hidden.embeddedDetail.location})` : null,
      communicationKeys: keys.filter((k) => k.startsWith("communication.")),
      response: text,
    };
    const ctx = { organizationId: session.organizationId, sessionId: session.id };
    const run = async (n: number) => {
      const { output } = await runAgent(scorer, input, ctx);
      const { kept } = enforceVerbatim(output, words || text, allowed);
      passes.push({ pass: n, scores: kept, noticed: output.embeddedDetailNoticed, version: scorer.version });
    };
    try {
      await Promise.all(highImpact ? [run(1), run(2)] : [run(1)]);
      if (highImpact && passes.length === 2) {
        const disagree = keys.some((k) => {
          const a = passes[0]!.scores.find((s) => s.competencyKey === k);
          const b = passes[1]!.scores.find((s) => s.competencyKey === k);
          return a && b && Math.abs(a.level - b.level) > 1;
        });
        if (disagree) await run(3);
      }
    } catch (e) {
      console.warn("[scoring] model scoring failed; using offline scorer", e);
      passes.length = 0;
    }
  }
  if (passes.length === 0) {
    const out = offlineScore({ hidden, rubricKeys: keys, stage, response: words || text });
    const { kept } = enforceVerbatim(out, words || text, allowed);
    passes.push({ pass: 1, scores: kept, noticed: out.embeddedDetailNoticed, version: SCORER_OFFLINE_VERSION });
  }

  // Final level per sub-skill: agreeing passes are averaged; a third pass decides disagreements.
  const final: (ScoreInput & { rationale: string; fromPass: number })[] = [];
  for (const k of keys) {
    const byPass = passes.map((p) => ({ p, s: p.scores.find((x) => x.competencyKey === k) })).filter((x) => x.s);
    if (byPass.length === 0) continue;
    const third = byPass.find((x) => x.p.pass === 3);
    let level: number;
    let chosen = byPass[0]!;
    if (third) {
      level = third.s!.level;
      chosen = third;
    } else {
      level = byPass.reduce((a, x) => a + x.s!.level, 0) / byPass.length;
      chosen = byPass.reduce((a, x) => (x.s!.confidence > a.s!.confidence ? x : a));
    }
    const confidence = byPass.reduce((a, x) => a + x.s!.confidence, 0) / byPass.length;
    final.push({ competencyKey: k, level, confidence, evidenceQuote: chosen.s!.evidenceQuote, rationale: chosen.s!.rationale, fromPass: chosen.p.pass });
  }

  const noticed = passes.some((p) => p.noticed);
  const rows = await systemDb.$transaction(async (tx) => {
    const created: { id: string; competencyKey: string; isFinal: boolean }[] = [];
    for (const p of passes) {
      for (const s of p.scores) {
        const f = final.find((x) => x.competencyKey === s.competencyKey);
        const isFinal = Boolean(f && f.fromPass === p.pass);
        const row = await tx.itemScore.create({
          data: {
            responseId: response.id,
            itemId: item.id,
            sessionId: response.sessionId,
            organizationId: response.organizationId,
            subjectUserId: response.subjectUserId,
            competencyKey: s.competencyKey,
            level: isFinal && f ? f.level : s.level,
            confidence: isFinal && f ? f.confidence : s.confidence,
            evidenceQuote: s.evidenceQuote,
            rationale: s.rationale,
            embeddedDetailNoticed: noticed,
            pass: p.pass,
            isFinal,
            scorerVersion: p.version,
          },
        });
        created.push({ id: row.id, competencyKey: s.competencyKey, isFinal });
      }
    }
    return created;
  });

  await withModelLock(response.sessionId, async (model) =>
    reviewHypotheses(
      updateModel(model, {
        item: { itemId: item.id, type: item.type, difficulty: item.difficulty, timed: meta.timed },
        stage,
        scores: final.map((f) => ({ ...f, scoreId: rows.find((r) => r.isFinal && r.competencyKey === f.competencyKey)?.id })),
      }),
      role,
    ),
  );
}

/** Serialise model updates per session with a Postgres advisory lock. */
export async function withModelLock(sessionId: string, fn: (m: CandidateModel) => CandidateModel | Promise<CandidateModel>) {
  await systemDb.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${sessionId}))`;
      const current = await latestModel(sessionId, tx);
      const next = await fn(current.model);
      await saveModel(sessionId, next, current.sequence + 1, tx);
      await syncHypotheses(sessionId, next, tx);
    },
    { timeout: 20_000 },
  );
}

export type { Prisma };
