"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check, Lightbulb, Repeat, Sparkles } from "lucide-react";
import type { PracticeItem, StoredFeedback } from "@/lib/grow/practice";
import type { ResponseContent } from "@/lib/assessment/response-schema";
import { submitPracticeAction, saveReflectionAction } from "@/app/actions/grow";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentViewer } from "@/components/assessment/document-viewer";
import { AutosaveIndicator, type SaveState } from "@/components/assessment/autosave-indicator";
import { ChoiceTask } from "@/components/candidate/tasks/choice-task";
import { AllocationTask, RankingTask } from "@/components/candidate/tasks/ranking-task";
import { DesignTask, FollowUpTask, WrittenTask } from "@/components/candidate/tasks/written-task";
import { InboxTask } from "@/components/candidate/tasks/inbox-task";
import { ChainTask } from "@/components/candidate/tasks/chain-task";
import { EvidenceCard } from "@/components/report/evidence-card";
import { LevelLabel } from "@/components/report/level";
import { PracticeLauncher } from "./practice-launcher";
import { PageContainer } from "@/components/app/page-header";

export function PracticeRunner({ id, item, feedback, reflection, answerText }: { id: string; item: PracticeItem; feedback: StoredFeedback | null; response: unknown; reflection: string; answerText: string | null }) {
  const t = useTranslations("grow.practice");
  const ti = useTranslations("candidate.item");
  const router = useRouter();
  const [value, setValue] = React.useState<ResponseContent | null>(null);
  const [save, setSave] = React.useState<SaveState>("saved");
  const [pending, setPending] = React.useState(false);
  const [note, setNote] = React.useState(reflection);
  const [noteSaved, setNoteSaved] = React.useState(Boolean(reflection));
  const onChange = React.useCallback((v: ResponseContent | null) => setValue(v), []);
  const c = item.content;
  const twist = Boolean(item.twistOf && c.twist);
  const kind = c.task.kind;
  const props = { itemId: `practice-${id}`, content: c, onChange, onSaveState: setSave, disabled: pending || Boolean(feedback) };
  // Role-play needs a live partner; practice it as a written opening message instead.
  const task = twist ? (
    <FollowUpTask itemId={`practice-${id}`} stage="TWIST" onChange={onChange} onSaveState={setSave} label={c.twist!.prompt} disabled={Boolean(feedback)} />
  ) : kind === "choice" ? <ChoiceTask {...props} /> : kind === "ranking" ? <RankingTask {...props} /> : kind === "allocation" ? <AllocationTask {...props} /> : kind === "design" ? <DesignTask {...props} /> : kind === "inbox" ? <InboxTask {...props} /> : kind === "chain" ? <ChainTask {...props} /> : kind === "roleplay" ? (
    <FollowUpTask itemId={`practice-${id}`} stage="PROBE" onChange={onChange} onSaveState={setSave} label={t("roleplayAsWritten", { name: c.task.roleplay?.stakeholder.name ?? "" })} disabled={Boolean(feedback)} />
  ) : <WrittenTask {...props} />;

  return (
    <PageContainer className="max-w-6xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link href="/app/grow/practice" className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-text">
          <ArrowLeft className="size-4 flip-rtl" aria-hidden />
          {t("back")}
        </Link>
        {!feedback ? <AutosaveIndicator state={save} /> : null}
      </div>
      <div className="grid gap-10 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-5">
          <p className="text-xs font-medium uppercase tracking-wide text-tertiary">{twist ? t("twistRound") : t("scenario")}</p>
          <h1 className="text-xl font-semibold text-text" dir="auto">{c.title}</h1>
          <p className="reading whitespace-pre-line text-[15px] leading-relaxed text-text" dir="auto">{c.scenario}</p>
          {c.materials.length ? <DocumentViewer materials={c.materials} label={ti("materials")} /> : null}
        </section>
        <section className="flex min-w-0 flex-col gap-5">
          {twist ? <div className="rounded-card border border-warning/30 bg-warning-subtle p-4 text-[15px] text-text" dir="auto">{c.twist!.change}</div> : <p className="text-[15px] font-medium text-text" dir="auto">{c.task.prompt}</p>}
          {feedback && answerText ? (
            <div className="flex flex-col gap-2 rounded-card border border-border bg-surface-subtle p-4">
              <span className="text-xs font-medium uppercase tracking-wide text-tertiary">{t("yourAnswer")}</span>
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-text" dir="auto">{answerText}</p>
            </div>
          ) : (
            task
          )}
          {!feedback ? (
            <div className="flex justify-end border-t border-border pt-4">
              <Button
                size="lg"
                disabled={!value}
                loading={pending}
                onClick={async () => {
                  if (!value) return;
                  setPending(true);
                  await submitPracticeAction(id, value);
                  router.refresh();
                }}
              >
                {t("getFeedback")}
              </Button>
            </div>
          ) : null}
        </section>
      </div>

      {feedback ? (
        <section aria-labelledby="fb" className="mt-12 flex flex-col gap-6 border-t border-border pt-10 animate-slide-up">
          <h2 id="fb" className="text-lg font-semibold text-text">{t("feedbackTitle")}</h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text"><Check className="size-4 text-success" aria-hidden />{t("didWell")}</h3>
              {feedback.didWell.length ? feedback.didWell.map((d, i) => <EvidenceCard key={i} quote={d.quote} context={d.point} confidence={0.8} />) : <p className="text-sm text-secondary">{t("didWellNone")}</p>}
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text"><Lightbulb className="size-4 text-warning" aria-hidden />{t("expert")}</h3>
              <ul className="flex flex-col gap-2">
                {feedback.expertWouldConsider.map((x, i) => (
                  <li key={i} className="rounded-card border border-border bg-surface p-3 text-sm text-text" dir="auto">{x}</li>
                ))}
              </ul>
            </div>
          </div>
          <Card>
            <CardContent className="flex flex-col gap-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text"><Sparkles className="size-4 text-accent-text" aria-hidden />{t("approach")}</h3>
              <p className="reading text-[15px] leading-relaxed text-text" dir="auto">{feedback.oneStrongApproach}</p>
              <p className="text-xs text-tertiary">{t("approachNote")}</p>
            </CardContent>
          </Card>
          {feedback.scores.length ? (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span className="text-secondary">{t("thisTime")}</span>
              {feedback.scores.map((s) => (
                <span key={s.competencyKey} className="flex items-center gap-1.5">
                  <LevelLabel estimate={s.level} confidence={s.confidence} />
                </span>
              ))}
              <span className="w-full text-xs text-tertiary">{t("scoresNote")}</span>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {!item.twistOf && c.twist ? <PracticeLauncher twistOf={id} label={t("tryTwist")} /> : null}
            <PracticeLauncher skillKey={item.targets[0]} label={t("another")} variant="secondary" />
          </div>
          <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-5">
            <label htmlFor="reflection" className="text-sm font-semibold text-text">{t("reflectionTitle")}</label>
            <p className="text-sm text-secondary">{t("reflectionHint")}</p>
            <Textarea id="reflection" value={note} onChange={(e) => (setNote(e.target.value), setNoteSaved(false))} className="min-h-24" />
            <Button
              variant="secondary"
              size="sm"
              className="self-start"
              disabled={!note.trim() || noteSaved}
              onClick={async () => {
                await saveReflectionAction(id, note);
                setNoteSaved(true);
              }}
            >
              {noteSaved ? <Check aria-hidden /> : <Repeat aria-hidden />}
              {noteSaved ? t("noteSaved") : t("saveNote")}
            </Button>
          </div>
          {feedback.mode === "offline" ? <Alert tone="neutral">{t("offlineNote")}</Alert> : null}
        </section>
      ) : null}
    </PageContainer>
  );
}
