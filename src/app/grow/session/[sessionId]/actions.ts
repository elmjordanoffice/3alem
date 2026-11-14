"use server";
import { z } from "zod";
import { requireViewer } from "@/lib/auth/session";
import { systemDb } from "@/lib/db";
import { viewForSession } from "@/lib/hire/candidate-state";
import { beginAssessment, submitResponse, roleplayTurn, acknowledgeChapter, pauseSession, resumeSession } from "@/lib/hire/session";

/** Grow session actions: the signed-in person may act only on their own Grow sessions. */
async function own(sessionId: string) {
  const viewer = await requireViewer();
  const s = await systemDb.assessmentSession.findFirst({ where: { id: sessionId, subjectUserId: viewer.user.id, mode: "GROW" } });
  if (!s) throw new Error("Not found");
  return s;
}

export async function growView(sessionId: string) {
  const s = await own(sessionId);
  const fresh = await systemDb.assessmentSession.findUniqueOrThrow({ where: { id: s.id } });
  return viewForSession(fresh, { orgName: "Aalim Grow", logoUrl: null, brandColor: null }, "Grow");
}

export async function growBegin(sessionId: string) {
  await beginAssessment((await own(sessionId)).id);
  return growView(sessionId);
}

export async function growSubmit(sessionId: string, input: { itemId: string; stage: "MAIN" | "PROBE" | "TWIST"; clientId: string; content: unknown; durationMs: number; events: unknown[] }) {
  const p = z.object({ itemId: z.string(), stage: z.enum(["MAIN", "PROBE", "TWIST"]), clientId: z.string().min(8).max(64), content: z.unknown(), durationMs: z.number().min(0), events: z.array(z.unknown()).max(500) }).parse(input);
  const res = await submitResponse((await own(sessionId)).id, p);
  return { ok: res.ok, error: res.ok ? undefined : res.error, view: await growView(sessionId) };
}

export async function growRoleplay(sessionId: string, input: { itemId: string; clientId: string; text: string }) {
  return roleplayTurn((await own(sessionId)).id, input);
}

export async function growContinue(sessionId: string) {
  await acknowledgeChapter((await own(sessionId)).id);
  return growView(sessionId);
}

export async function growPause(sessionId: string) {
  const s = await own(sessionId);
  await acknowledgeChapter(s.id);
  await pauseSession(s.id);
  return growView(sessionId);
}

export async function growResume(sessionId: string) {
  await resumeSession((await own(sessionId)).id);
  return growView(sessionId);
}

export async function growFeedback() {
  return;
}
