"use server";
import { z } from "zod";
import { candidateContext, startSession, beginAssessment, submitResponse, roleplayTurn, acknowledgeChapter, pauseSession, resumeSession, recordFeedback, completeSession } from "@/lib/hire/session";
import { candidateView, type CandidateView } from "@/lib/hire/candidate-state";
import { saveFairnessResponse } from "@/lib/fairness";

/**
 * Candidate actions. The token in the URL is the credential; every action
 * re-validates it and works only on that invitation's session.
 */

async function sessionIdFor(token: string): Promise<string> {
  const ctx = await candidateContext(token);
  if (ctx.state !== "valid" || !ctx.session) throw new Error("No active session");
  return ctx.session.id;
}

const startSchema = z.object({
  locale: z.enum(["en", "ar"]),
  extraTime: z.union([z.literal(1), z.literal(1.25), z.literal(1.5)]),
  untimed: z.boolean(),
  largerText: z.boolean(),
  consent: z.literal(true),
});

export async function startAction(token: string, input: z.input<typeof startSchema>): Promise<CandidateView> {
  const p = startSchema.parse(input);
  await startSession(token, { locale: p.locale, accommodations: { extraTime: p.extraTime, untimed: p.untimed, largerText: p.largerText }, consent: p.consent });
  return candidateView(token);
}

export async function beginAction(token: string): Promise<CandidateView> {
  await beginAssessment(await sessionIdFor(token));
  return candidateView(token);
}

const submitSchema = z.object({
  itemId: z.string(),
  stage: z.enum(["MAIN", "PROBE", "TWIST"]),
  clientId: z.string().min(8).max(64),
  content: z.unknown(),
  durationMs: z.number().min(0),
  events: z.array(z.unknown()).max(500),
});

export async function submitAction(token: string, input: z.input<typeof submitSchema>): Promise<{ ok: boolean; error?: string; view: CandidateView }> {
  const p = submitSchema.parse(input);
  const res = await submitResponse(await sessionIdFor(token), p);
  return { ok: res.ok, error: res.ok ? undefined : res.error, view: await candidateView(token) };
}

export async function roleplayAction(token: string, input: { itemId: string; clientId: string; text: string }) {
  const p = z.object({ itemId: z.string(), clientId: z.string().min(8).max(64), text: z.string().trim().min(1).max(4000) }).parse(input);
  return roleplayTurn(await sessionIdFor(token), p);
}

export async function continueChapterAction(token: string): Promise<CandidateView> {
  await acknowledgeChapter(await sessionIdFor(token));
  return candidateView(token);
}

export async function pauseAction(token: string): Promise<CandidateView> {
  const id = await sessionIdFor(token);
  await acknowledgeChapter(id);
  await pauseSession(id);
  return candidateView(token);
}

export async function resumeAction(token: string): Promise<CandidateView> {
  await resumeSession(await sessionIdFor(token));
  return candidateView(token);
}

export async function finishEarlyAction(token: string): Promise<CandidateView> {
  await completeSession(await sessionIdFor(token));
  return candidateView(token);
}

export async function refreshAction(token: string): Promise<CandidateView> {
  return candidateView(token);
}

export async function feedbackAction(token: string, input: { rating: number; comment: string }) {
  const ctx = await candidateContext(token);
  if (!ctx.session) return;
  const p = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(2000) }).parse(input);
  await recordFeedback(ctx.session.id, p);
}

const fairnessSchema = z.object({
  gender: z.enum(["woman", "man", "another", "prefer_not"]).optional(),
  ageBand: z.enum(["under25", "25_34", "35_44", "45_54", "55plus", "prefer_not"]).optional(),
  disability: z.enum(["yes", "no", "prefer_not"]).optional(),
  firstLanguage: z.enum(["arabic", "english", "other", "prefer_not"]).optional(),
});

/**
 * Voluntary equal-opportunity answers. Stored apart from the assessment,
 * never shown to reviewers, and used only for aggregate fairness monitoring.
 */
export async function fairnessAction(token: string, input: Record<string, string>) {
  const ctx = await candidateContext(token);
  if (ctx.state !== "valid" || !ctx.session) return;
  const p = fairnessSchema.parse(input);
  await saveFairnessResponse(ctx.session.id, ctx.inv.organizationId, p);
}
