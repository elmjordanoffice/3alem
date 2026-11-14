import type { Metadata } from "next";
import { candidateView } from "@/lib/hire/candidate-state";
import { CandidateApp } from "@/components/candidate/candidate-app";
import * as actions from "./actions";

export const metadata: Metadata = { title: "Assessment", referrer: "no-referrer", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CandidatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const view = await candidateView(token);
  const api = {
    start: actions.startAction.bind(null, token),
    begin: actions.beginAction.bind(null, token),
    submit: actions.submitAction.bind(null, token),
    roleplay: actions.roleplayAction.bind(null, token),
    continueChapter: actions.continueChapterAction.bind(null, token),
    pause: actions.pauseAction.bind(null, token),
    resume: actions.resumeAction.bind(null, token),
    refresh: actions.refreshAction.bind(null, token),
    feedback: actions.feedbackAction.bind(null, token),
    fairness: actions.fairnessAction.bind(null, token),
  };
  return <CandidateApp token={token} initial={view} api={api} />;
}
