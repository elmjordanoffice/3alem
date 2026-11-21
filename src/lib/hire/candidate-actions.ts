import "server-only";
import { z } from "zod";
import { candidateContext, startSession, beginAssessment, submitResponse, roleplayTurn, acknowledgeChapter, pauseSession, resumeSession, recordFeedback, completeSession } from "./session";
import { candidateView, type CandidateView } from "./candidate-state";
import { saveFairnessResponse } from "@/lib/fairness";

/**
 * What a candidate can do, by invitation token. The token is the credential;
 * every call re-validates it and works only on that invitation's session.
 * Shared by the web app's server actions and the mobile API
 * (src/app/api/m/[token]/route.ts), so both behave identically.
 */

async function sessionIdFor(token: string): Promise<string> {
  const ctx = await candidateContext(token);
  if (ctx.state !== "valid" || !ctx.session) throw new CandidateError("no_session");
  return ctx.session.id;
}

export class CandidateError extends Error {}

export const startSchema = z.object({
  locale: z.enum(["en", "ar"]),
  extraTime: z.union([z.literal(1), z.literal(1.25), z.literal(1.5)]),
  untimed: z.boolean(),
  largerText: z.boolean(),
  consent: z.literal(true),
  humanReview: z.boolean().default(false),
});

export const submitSchema = z.object({
  itemId: z.string(),
  stage: z.enum(["MAIN", "PROBE", "TWIST"]),
  clientId: z.string().min(8).max(64),
  content: z.unknown(),
  durationMs: z.number().min(0),
  events: z.array(z.unknown()).max(500),
});

export const roleplaySchema = z.object({ itemId: z.string(), clientId: z.string().min(8).max(64), text: z.string().trim().min(1).max(4000) });
export const feedbackSchema = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().max(2000) });
export const fairnessSchema = z.object({
  gender: z.enum(["woman", "man", "another", "prefer_not"]).optional(),
  ageBand: z.enum(["under25", "25_34", "35_44", "45_54", "55plus", "prefer_not"]).optional(),
  disability: z.enum(["yes", "no", "prefer_not"]).optional(),
  firstLanguage: z.enum(["arabic", "english", "other", "prefer_not"]).optional(),
});

export const candidate = {
  view: (token: string): Promise<CandidateView> => candidateView(token),

  async start(token: string, input: unknown): Promise<CandidateView> {
    const p = startSchema.parse(input);
    await startSession(token, { locale: p.locale, accommodations: { extraTime: p.extraTime, untimed: p.untimed, largerText: p.largerText }, consent: p.consent, humanReview: p.humanReview });
    return candidateView(token);
  },

  async begin(token: string): Promise<CandidateView> {
    await beginAssessment(await sessionIdFor(token));
    return candidateView(token);
  },

  async submit(token: string, input: unknown): Promise<{ ok: boolean; error?: string; view: CandidateView }> {
    const p = submitSchema.parse(input);
    const res = await submitResponse(await sessionIdFor(token), p);
    return { ok: res.ok, error: res.ok ? undefined : res.error, view: await candidateView(token) };
  },

  async roleplay(token: string, input: unknown) {
    return roleplayTurn(await sessionIdFor(token), roleplaySchema.parse(input));
  },

  async continueChapter(token: string): Promise<CandidateView> {
    await acknowledgeChapter(await sessionIdFor(token));
    return candidateView(token);
  },

  async pause(token: string): Promise<CandidateView> {
    const id = await sessionIdFor(token);
    await acknowledgeChapter(id);
    await pauseSession(id);
    return candidateView(token);
  },

  async resume(token: string): Promise<CandidateView> {
    await resumeSession(await sessionIdFor(token));
    return candidateView(token);
  },

  async finish(token: string): Promise<CandidateView> {
    await completeSession(await sessionIdFor(token));
    return candidateView(token);
  },

  async feedback(token: string, input: unknown): Promise<void> {
    const ctx = await candidateContext(token);
    if (!ctx.session) return;
    await recordFeedback(ctx.session.id, feedbackSchema.parse(input));
  },

  /**
   * Voluntary equal-opportunity answers. Stored apart from the assessment,
   * never shown to reviewers, and used only for aggregate fairness monitoring.
   */
  async fairness(token: string, input: unknown): Promise<void> {
    const ctx = await candidateContext(token);
    if (ctx.state !== "valid" || !ctx.session) return;
    await saveFairnessResponse(ctx.session.id, ctx.inv.organizationId, fairnessSchema.parse(input));
  },
};
