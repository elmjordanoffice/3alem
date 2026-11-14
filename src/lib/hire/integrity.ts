import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { candidateWords, responseContentSchema } from "@/lib/assessment/response-schema";
import { sentences, wordCount } from "@/lib/ai/offline/text";
import { systemDb } from "@/lib/db";

/**
 * Consistency analysis across a session's written answers: sudden changes in
 * writing style (sentence length, word length, vocabulary range, punctuation)
 * and long answers produced implausibly fast. Results are context for the
 * reviewer; they never change a score.
 */

interface Features {
  sentenceLen: number;
  wordLen: number;
  ttr: number;
  punct: number;
}

export function styleFeatures(text: string): Features | null {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length < 40) return null;
  const sents = sentences(text);
  const unique = new Set(words.map((w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")));
  return {
    sentenceLen: words.length / Math.max(1, sents.length),
    wordLen: words.reduce((a, w) => a + w.length, 0) / words.length,
    ttr: unique.size / words.length,
    punct: (text.match(/[;:—–()]/g) ?? []).length / words.length,
  };
}

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 0;
}

export function styleShiftIndices(feats: (Features | null)[]): number[] {
  const valid = feats.map((f, i) => ({ f, i })).filter((x): x is { f: Features; i: number } => x.f !== null);
  if (valid.length < 4) return [];
  const keys: (keyof Features)[] = ["sentenceLen", "wordLen", "ttr", "punct"];
  const meds = Object.fromEntries(keys.map((k) => [k, median(valid.map((v) => v.f[k]))])) as unknown as Features;
  const mads = Object.fromEntries(keys.map((k) => [k, median(valid.map((v) => Math.abs(v.f[k] - meds[k]))) || 1e-6])) as unknown as Features;
  return valid.filter((v) => keys.filter((k) => Math.abs(v.f[k] - meds[k]) / mads[k] > 4).length >= 2).map((v) => v.i);
}

export async function analyseIntegrity(sessionId: string) {
  const session = await systemDb.assessmentSession.findUniqueOrThrow({ where: { id: sessionId } });
  const responses = await systemDb.response.findMany({ where: { sessionId, stage: { in: ["MAIN", "PROBE", "TWIST"] } }, orderBy: { submittedAt: "asc" } });
  const texts = responses.map((r) => {
    const p = responseContentSchema.safeParse(r.content);
    return p.success ? candidateWords(p.data) : "";
  });
  const shifts = styleShiftIndices(texts.map(styleFeatures));
  const events: Prisma.IntegrityEventCreateManyInput[] = [];
  for (const i of shifts) {
    const r = responses[i]!;
    const pasted = ((r.events as { type: string }[]) ?? []).some((e) => e.type === "paste");
    events.push({ sessionId, organizationId: session.organizationId, subjectUserId: session.subjectUserId, itemId: r.itemId, type: "STYLE_SHIFT", payload: { responseId: r.id, withPaste: pasted } });
  }
  responses.forEach((r, i) => {
    const words = wordCount(texts[i] ?? "");
    const seconds = (r.durationMs ?? 0) / 1000;
    const pasted = ((r.events as { type: string }[]) ?? []).some((e) => e.type === "paste");
    // Faster than ~120 words a minute of composed text, without pasting, is unusual.
    if (words >= 120 && seconds > 0 && words / (seconds / 60) > 120 && !pasted) {
      events.push({ sessionId, organizationId: session.organizationId, subjectUserId: session.subjectUserId, itemId: r.itemId, type: "TIMING_ANOMALY", payload: { responseId: r.id, words, seconds: Math.round(seconds) } });
    }
  });
  if (events.length) await systemDb.integrityEvent.createMany({ data: events });
  return events.length;
}
