"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronDown, RotateCw } from "lucide-react";
import type { CandidateView } from "@/lib/hire/candidate-state";
import type { ResponseContent } from "@/lib/assessment/response-schema";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ChapterProgress } from "@/components/assessment/chapter-progress";
import { AutosaveIndicator, type SaveState } from "@/components/assessment/autosave-indicator";
import { DocumentViewer } from "@/components/assessment/document-viewer";
import { QuietTimer } from "@/components/assessment/quiet-timer";
import { CandidateShell } from "./shell";
import { newClientId, store, useIntegrityCapture, useOnline } from "./hooks";
import { ChoiceTask } from "./tasks/choice-task";
import { AllocationTask, RankingTask } from "./tasks/ranking-task";
import { DesignTask, FollowUpTask, WrittenTask } from "./tasks/written-task";
import { InboxTask } from "./tasks/inbox-task";
import { RoleplayTask } from "./tasks/roleplay-task";
import { ChainTask } from "./tasks/chain-task";
import { ForcedChoiceTask } from "./tasks/forced-choice-task";
import { cn } from "@/lib/utils";

type ItemView = Extract<CandidateView, { view: "item" }>;

export interface SubmitPayload {
  itemId: string;
  stage: "MAIN" | "PROBE" | "TWIST";
  clientId: string;
  content: ResponseContent;
  durationMs: number;
  events: unknown[];
}

const WIDE_TASKS = new Set(["inbox", "roleplay", "forced_choice"]);

interface ItemScreenProps {
  v: ItemView;
  token: string;
  submit: (p: SubmitPayload) => Promise<{ ok: boolean; error?: string }>;
  sendTurn: (text: string, clientId: string) => Promise<{ ok: boolean; reply?: string; ended?: boolean }>;
}

/** Each item stage is its own instance, so its state starts fresh. */
export function ItemScreen(props: ItemScreenProps) {
  return <ItemStage key={`${props.v.item.id}:${props.v.item.stage}`} {...props} />;
}

function ItemStage({ v, token, submit, sendTurn }: ItemScreenProps) {
  const t = useTranslations("candidate.item");
  const { item } = v;
  const content = item.content;
  const kind = content.task.kind;
  const stage = item.stage;
  const online = useOnline();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const integrity = useIntegrityCapture(containerRef);
  const [value, setValue] = React.useState<ResponseContent | null>(null);
  const [save, setSave] = React.useState<SaveState>("saved");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [timeUp, setTimeUp] = React.useState(false);
  const [showScenario, setShowScenario] = React.useState(stage === "MAIN");
  const outboxKey = `aalim:outbox:${token}`;

  // Move focus to the scene title when a new stage appears.
  React.useEffect(() => {
    containerRef.current?.querySelector("h1")?.focus();
  }, []);

  const onChange = React.useCallback((x: ResponseContent | null) => setValue(x), []);
  const deadline = React.useMemo(
    () => (item.timed && content.timeLimitSeconds ? new Date(item.presentedAt).getTime() + content.timeLimitSeconds * 1000 : null),
    [item.timed, item.presentedAt, content.timeLimitSeconds],
  );

  const doSubmit = async () => {
    if (!value) return;
    const payload: SubmitPayload = { itemId: item.id, stage, clientId: newClientId(), content: value, durationMs: integrity.elapsedMs(), events: integrity.take() };
    // Saved on the device first: if the network fails, nothing is lost.
    store.set(outboxKey, payload);
    setSubmitting(true);
    setError(null);
    try {
      const res = await submit(payload);
      if (!res.ok && res.error !== "wrong_stage" && res.error !== "not_current") throw new Error(res.error);
      store.remove(outboxKey);
      store.remove(`aalim:draft:${item.id}:${stage}`);
    } catch {
      setError(online ? t("submitError") : t("offline"));
      setSave(online ? "error" : "offline");
      setSubmitting(false);
    }
  };

  // Retry a submission that was saved on the device while offline.
  React.useEffect(() => {
    if (!online) return;
    const pending = store.get<SubmitPayload>(outboxKey);
    if (pending && pending.itemId === item.id && pending.stage === stage) {
      submit(pending)
        .then(() => {
          store.remove(outboxKey);
          store.remove(`aalim:draft:${item.id}:${stage}`);
        })
        .catch(() => undefined);
    } else if (pending) store.remove(outboxKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [online]);

  const taskProps = { itemId: item.id, content, onChange, onSaveState: setSave, disabled: submitting };
  const task =
    stage !== "MAIN" ? (
      <FollowUpTask itemId={item.id} stage={stage} onChange={onChange} onSaveState={setSave} disabled={submitting} label={stage === "PROBE" ? content.probe!.prompt : content.twist!.prompt} />
    ) : kind === "choice" ? (
      <ChoiceTask {...taskProps} />
    ) : kind === "ranking" ? (
      <RankingTask {...taskProps} />
    ) : kind === "allocation" ? (
      <AllocationTask {...taskProps} />
    ) : kind === "written" ? (
      <WrittenTask {...taskProps} />
    ) : kind === "design" ? (
      <DesignTask {...taskProps} />
    ) : kind === "inbox" ? (
      <InboxTask {...taskProps} timeUp={timeUp} />
    ) : kind === "chain" ? (
      <ChainTask {...taskProps} />
    ) : kind === "forced_choice" ? (
      <ForcedChoiceTask {...taskProps} />
    ) : kind === "roleplay" ? (
      <RoleplayTask content={content} onChange={onChange} transcript={item.roleplay?.transcript ?? []} candidateName={t("you")} sendTurn={sendTurn} onEnded={() => undefined} disabled={submitting} />
    ) : null;

  const wide = stage === "MAIN" && WIDE_TASKS.has(kind);
  const label = stage === "MAIN" ? t("yourTask") : stage === "PROBE" ? t("followUp") : t("changed");

  const scenario = (
    <section aria-labelledby="scenario-title" className="flex min-w-0 flex-col gap-5">
      <h1 id="scenario-title" tabIndex={-1} className="text-xl font-semibold text-text outline-none" dir="auto">
        {content.title}
      </h1>
      <div className="reading whitespace-pre-line text-[15px] leading-relaxed text-text" dir="auto">
        {content.scenario}
      </div>
      {content.materials.length ? <DocumentViewer materials={content.materials} label={t("materials")} /> : null}
    </section>
  );

  return (
    <CandidateShell
      branding={v.branding}
      center={<ChapterProgress chapters={v.world.chapters.map((c) => c.title)} current={v.chapterIndex} />}
      end={
        <span className="flex items-center gap-3">
          {deadline ? <QuietTimer deadline={deadline} onExpire={() => setTimeUp(true)} /> : null}
          <AutosaveIndicator state={online ? save : "offline"} className="hidden sm:inline-flex" />
        </span>
      }
    >
      <div ref={containerRef} className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {stage !== "MAIN" ? (
          <div className="mb-6 lg:hidden">
            <button type="button" onClick={() => setShowScenario((s) => !s)} aria-expanded={showScenario} className="flex items-center gap-1.5 text-sm font-medium text-accent-text">
              <ChevronDown className={cn("size-4 transition-transform", showScenario && "rotate-180")} aria-hidden />
              {showScenario ? t("hideScenario") : t("showScenario")}
            </button>
          </div>
        ) : null}
        <div className={cn("grid gap-10", wide ? "grid-cols-1" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
          <div className={cn(stage !== "MAIN" && !showScenario && "hidden lg:block")}>{scenario}</div>
          <section aria-labelledby="task-label" className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-24 lg:self-start" key={`${item.id}-${stage}`}>
            <div className="flex flex-col gap-2 animate-slide-up">
              <p id="task-label" className="text-xs font-medium uppercase tracking-wide text-accent-text">
                {label}
              </p>
              {stage === "TWIST" && content.twist?.change ? (
                <div className="rounded-card border border-warning/30 bg-warning-subtle p-4 text-[15px] leading-relaxed text-text" dir="auto">
                  {content.twist.change}
                </div>
              ) : null}
              {stage === "MAIN" ? (
                <p className="text-[15px] font-medium leading-relaxed text-text" dir="auto">
                  {content.task.prompt}
                </p>
              ) : null}
            </div>
            {timeUp && kind === "inbox" ? <Alert tone="info">{t("timeUp")}</Alert> : null}
            {task}
            {error ? (
              <Alert
                tone={online ? "critical" : "warning"}
                action={
                  <Button size="sm" variant="secondary" onClick={doSubmit}>
                    <RotateCw aria-hidden />
                    {t("retry")}
                  </Button>
                }
              >
                {error}
              </Alert>
            ) : null}
            <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
              <p className="text-xs text-tertiary">{value ? t("readyHint") : t("incompleteHint")}</p>
              <Button size="lg" onClick={doSubmit} disabled={!value} loading={submitting}>
                {stage === "MAIN" && content.probe ? t("continue") : t("submit")}
                <ArrowRight className="flip-rtl" aria-hidden />
              </Button>
            </div>
          </section>
        </div>
      </div>
    </CandidateShell>
  );
}
