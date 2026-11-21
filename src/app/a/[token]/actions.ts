"use server";
import type { z } from "zod";
import { candidate, type startSchema, type submitSchema } from "@/lib/hire/candidate-actions";
import type { CandidateView } from "@/lib/hire/candidate-state";

/**
 * Candidate server actions for the web app. The logic lives in
 * src/lib/hire/candidate-actions.ts, shared with the mobile API.
 */

export async function startAction(token: string, input: z.input<typeof startSchema>): Promise<CandidateView> {
  return candidate.start(token, input);
}
export async function beginAction(token: string): Promise<CandidateView> {
  return candidate.begin(token);
}
export async function submitAction(token: string, input: z.input<typeof submitSchema>): Promise<{ ok: boolean; error?: string; view: CandidateView }> {
  return candidate.submit(token, input);
}
export async function roleplayAction(token: string, input: { itemId: string; clientId: string; text: string }) {
  return candidate.roleplay(token, input);
}
export async function continueChapterAction(token: string): Promise<CandidateView> {
  return candidate.continueChapter(token);
}
export async function pauseAction(token: string): Promise<CandidateView> {
  return candidate.pause(token);
}
export async function resumeAction(token: string): Promise<CandidateView> {
  return candidate.resume(token);
}
export async function finishEarlyAction(token: string): Promise<CandidateView> {
  return candidate.finish(token);
}
export async function refreshAction(token: string): Promise<CandidateView> {
  return candidate.view(token);
}
export async function feedbackAction(token: string, input: { rating: number; comment: string }) {
  return candidate.feedback(token, input);
}
export async function fairnessAction(token: string, input: Record<string, string>) {
  return candidate.fairness(token, input);
}
