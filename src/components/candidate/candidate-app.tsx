"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, Link2Off, Loader2 } from "lucide-react";
import type { CandidateView } from "@/lib/hire/candidate-state";
import {
  beginAction,
  continueChapterAction,
  feedbackAction,
  pauseAction,
  refreshAction,
  resumeAction,
  roleplayAction,
  startAction,
  submitAction,
} from "@/app/a/[token]/actions";
import { Briefing, Complete, Landing, Paused, StateScreen, Transition } from "./screens";
import { ItemScreen } from "./item-screen";
import { CandidateShell } from "./shell";

/** The candidate experience: one client app driven by server actions. */
export function CandidateApp({ token, initial }: { token: string; initial: CandidateView }) {
  const t = useTranslations("candidate");
  const router = useRouter();
  const [view, setView] = React.useState<CandidateView>(initial);

  // Keep the URL free of history noise; scroll to the top on each new screen.
  const key = view.view === "item" ? `${view.item.id}:${view.item.stage}` : view.view;
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [key]);

  // While the first scene is being prepared, check back quietly.
  React.useEffect(() => {
    if (view.view !== "preparing") return;
    const id = window.setInterval(async () => setView(await refreshAction(token)), 1500);
    return () => window.clearInterval(id);
  }, [view.view, token]);

  switch (view.view) {
    case "invalid":
      return <StateScreen icon={Link2Off} title={t("invalid.title")} body={t("invalid.body")} />;
    case "expired":
      return <StateScreen branding={view.branding} icon={Clock} title={t("expired.title")} body={t("expired.body", { org: view.branding.orgName })} />;
    case "revoked":
      return <StateScreen branding={view.branding} icon={Link2Off} title={t("revoked.title")} body={t("revoked.body", { org: view.branding.orgName })} />;
    case "preparing":
      return (
        <CandidateShell branding={view.branding}>
          <div className="flex flex-col items-center gap-3 py-32 text-secondary" role="status">
            <Loader2 className="size-5 animate-spin" aria-hidden />
            {t("preparing")}
          </div>
        </CandidateShell>
      );
    case "landing":
      return (
        <Landing
          v={view}
          onStart={async (o) => {
            setView(await startAction(token, { ...o, consent: true }));
            router.refresh();
          }}
        />
      );
    case "briefing":
      return <Briefing v={view} onBegin={async () => setView(await beginAction(token))} />;
    case "transition":
      return <Transition v={view} onContinue={async () => setView(await continueChapterAction(token))} onPause={async () => setView(await pauseAction(token))} />;
    case "paused":
      return <Paused v={view} onResume={async () => setView(await resumeAction(token))} />;
    case "complete":
      return <Complete v={view} onFeedback={(f) => feedbackAction(token, f)} />;
    case "item":
      return (
        <ItemScreen
          v={view}
          token={token}
          submit={async (p) => {
            const res = await submitAction(token, p);
            setView(res.view);
            return { ok: res.ok, error: res.error };
          }}
          sendTurn={async (text, clientId) => {
            const r = await roleplayAction(token, { itemId: view.item.id, clientId, text });
            return r.ok ? { ok: true, reply: r.reply, ended: r.ended } : { ok: false };
          }}
        />
      );
  }
}
