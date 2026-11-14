import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/auth/session";
import { systemDb } from "@/lib/db";
import { CandidateApp } from "@/components/candidate/candidate-app";
import { GrowComplete } from "@/components/grow/grow-complete";
import * as a from "./actions";

export const dynamic = "force-dynamic";

export default async function GrowSessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const viewer = await requireViewer();
  const { sessionId } = await params;
  const s = await systemDb.assessmentSession.findFirst({ where: { id: sessionId, subjectUserId: viewer.user.id, mode: "GROW" } });
  if (!s) notFound();
  const view = await a.growView(sessionId);
  const api = {
    begin: a.growBegin.bind(null, sessionId),
    submit: a.growSubmit.bind(null, sessionId),
    roleplay: a.growRoleplay.bind(null, sessionId),
    continueChapter: a.growContinue.bind(null, sessionId),
    pause: a.growPause.bind(null, sessionId),
    resume: a.growResume.bind(null, sessionId),
    refresh: a.growView.bind(null, sessionId),
    feedback: a.growFeedback,
  };
  return <CandidateApp token={sessionId} initial={view} api={api} completeSlot={<GrowComplete />} />;
}
