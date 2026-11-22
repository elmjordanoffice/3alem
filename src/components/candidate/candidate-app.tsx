"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, Link2Off } from "lucide-react";
import type { CandidateView } from "@/lib/hire/candidate-state";
import type { SubmitPayload } from "./item-screen";
import { Briefing, Complete, Landing, Paused, StateScreen, Transition } from "./screens";
import { ItemScreen } from "./item-screen";
import { CandidateShell } from "./shell";
import { SentToast } from "./delight";
import { StoryLoading } from "./story";

/** Server actions the app drives, already bound to a candidate token or a Grow session. */
export interface CandidateApi {
  start?: (o: { locale: "en" | "ar"; extraTime: 1 | 1.25 | 1.5; untimed: boolean; largerText: boolean; consent: true; humanReview: boolean }) => Promise<CandidateView>;
  begin: () => Promise<CandidateView>;
  submit: (p: SubmitPayload) => Promise<{ ok: boolean; error?: string; view: CandidateView }>;
  roleplay: (input: { itemId: string; clientId: string; text: string }) => Promise<{ ok: boolean; reply?: string; ended?: boolean }>;
  continueChapter: () => Promise<CandidateView>;
  pause: () => Promise<CandidateView>;
  resume: () => Promise<CandidateView>;
  refresh: () => Promise<CandidateView>;
  feedback: (f: { rating: number; comment: string }) => Promise<void>;
  /** Voluntary equal-opportunity questions (Hire only). */
  fairness?: (a: Record<string, string>) => Promise<void>;
}

/** The candidate experience: one client app driven by server actions. */
export function CandidateApp({ token, initial, api, completeSlot }: { token: string; initial: CandidateView; api: CandidateApi; completeSlot?: React.ReactNode }) {
  const t = useTranslations("candidate");
  const router = useRouter();
  const [view, setView] = React.useState<CandidateView>(initial);
  // Each sent answer gets a brief "Sent" (never blocking the next scene).
  const [sent, setSent] = React.useState(0);

  // Keep the URL free of history noise; scroll to the top on each new screen.
  const key = view.view === "item" ? `${view.item.id}:${view.item.stage}` : view.view;
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [key]);

  // While the first scene is being prepared, check back quietly.
  React.useEffect(() => {
    if (view.view !== "preparing") return;
    const id = window.setInterval(async () => setView(await api.refresh()), 1500);
    return () => window.clearInterval(id);
  }, [view.view, api]);

  const screen = renderView();
  return (
    <>
      {screen}
      {sent ? <SentToast key={sent} onDone={() => setSent(0)} /> : null}
    </>
  );

  function renderView() {
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
            <StoryLoading />
          </CandidateShell>
        );
      case "landing":
        return (
          <Landing
            v={view}
            onStart={async (o) => {
              if (api.start) setView(await api.start({ ...o, consent: true }));
              router.refresh();
            }}
          />
        );
      case "briefing":
        return <Briefing v={view} onBegin={async () => setView(await api.begin())} />;
      case "transition":
        return <Transition v={view} onContinue={async () => setView(await api.continueChapter())} onPause={async () => setView(await api.pause())} />;
      case "paused":
        return <Paused v={view} onResume={async () => setView(await api.resume())} />;
      case "complete":
        return completeSlot ?? <Complete v={view} onFeedback={api.feedback} onFairness={api.fairness} />;
      case "item":
        return (
          <ItemScreen
            v={view}
            token={token}
            submit={async (p) => {
              const res = await api.submit(p);
              if (res.ok) setSent((n) => n + 1);
              setView(res.view);
              return { ok: res.ok, error: res.error };
            }}
            sendTurn={async (text, clientId) => {
              const r = await api.roleplay({ itemId: view.item.id, clientId, text });
              return r.ok ? { ok: true, reply: r.reply, ended: r.ended } : { ok: false };
            }}
          />
        );
    }
  }
}
