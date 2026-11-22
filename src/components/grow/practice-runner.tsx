"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, Lightbulb, Repeat, Sparkles, TrendingUp } from "lucide-react";
import type { PracticeItem, StoredFeedback } from "@/lib/grow/practice";
import type { Coaching } from "@/lib/grow/coaching";
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
import { PracticeCelebration, type CelebrationView } from "./momentum";
import { PageContainer } from "@/components/app/page-header";
import { DOMAINS } from "@/lib/framework/data";
import { useLocaleSettings } from "@/components/providers";
import { cn } from "@/lib/utils";

export function PracticeRunner({ id, item, feedback, reflection, answerText, celebration = null }: { id: string; item: PracticeItem; feedback: StoredFeedback | null; response: unknown; reflection: string; answerText: string | null; celebration?: CelebrationView | null }) {
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
      {item.why && !feedback ? <WhyThisOne why={item.why} /> : null}
      <div className="grid gap-10 lg:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-5">
          <p className="text-[13px] font-medium text-tertiary">{twist ? t("twistRound") : item.quick ? t("quickRep") : t("scenario")}</p>
          <h1 className="text-xl font-semibold text-text" dir="auto">{c.title}</h1>
          <p className="reading whitespace-pre-line text-[15px] leading-relaxed text-text" dir="auto">{c.scenario}</p>
          {c.materials.length ? <DocumentViewer materials={c.materials} label={ti("materials")} /> : null}
        </section>
        <section className="flex min-w-0 flex-col gap-5">
          {item.previous && !feedback ? (
            <div className="rounded-[12px] bg-accent-subtle p-4 text-sm">
              <p className="font-semibold text-accent-text">{t("retryTitle")}</p>
              <ul className="mt-2 flex list-disc flex-col gap-1 ps-5 text-text marker:text-accent-text">
                {item.previous.tips.map((x) => (
                  <li key={x} dir="auto">{x}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {twist ? <div className="rounded-card border border-warning/30 bg-warning-subtle p-4 text-[15px] text-text" dir="auto">{c.twist!.change}</div> : <p className="text-[15px] font-medium text-text" dir="auto">{c.task.prompt}</p>}
          {feedback && answerText ? (
            <div className="flex flex-col gap-2 rounded-card bg-surface-subtle shadow-[inset_0_0_0_1px_var(--border)] p-4">
              <span className="text-[13px] font-medium text-tertiary">{t("yourAnswer")}</span>
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
          {celebration ? <PracticeCelebration c={celebration} /> : null}
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
                  <li key={i} className="rounded-card bg-surface shadow-card p-3 text-sm text-text" dir="auto">{x}</li>
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
          {feedback.coaching ? <CoachingPanel coaching={feedback.coaching} previous={item.previous} /> : null}
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
            {!item.retryOf ? <PracticeLauncher retryOf={id} label={t("retry")} /> : null}
            {!item.twistOf && c.twist ? <PracticeLauncher twistOf={id} label={t("tryTwist")} variant={item.retryOf ? "primary" : "secondary"} /> : null}
            <PracticeLauncher skillKey={item.targets[0]} label={t("another")} variant="secondary" />
          </div>
          <div className="flex flex-col gap-2 rounded-card bg-surface shadow-card p-5">
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

/** Two concrete habits to try next time, and what the next level up looks like for each skill. */
function CoachingPanel({ coaching, previous }: { coaching: Coaching; previous?: PracticeItem["previous"] }) {
  const t = useTranslations("grow.practice");
  const tl = useTranslations("levels");
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {coaching.tips.length ? (
        <div className="flex flex-col gap-3 rounded-[16px] bg-surface p-5 shadow-card">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-text">
            <TrendingUp className="size-4 text-accent-text" aria-hidden />
            {t("tipsTitle")}
          </h3>
          <ul className="flex flex-col gap-2">
            {coaching.tips.map((x) => (
              <li key={x} className="rounded-[10px] bg-accent-subtle px-3 py-2.5 text-sm text-text" dir="auto">{x}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="flex flex-col gap-3 rounded-[16px] bg-surface p-5 shadow-card">
        <h3 className="text-sm font-semibold text-text">{t("nextTitle")}</h3>
        <ul className="flex flex-col gap-3">
          {coaching.next.map((n) => {
            const before = previous?.scores.find((p) => p.competencyKey === n.competencyKey)?.level;
            return (
              <li key={n.competencyKey} className="flex flex-col gap-1 text-sm">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-text">{n.name}</span>
                  <span className="text-secondary">
                    {before != null && before !== n.level ? (
                      <>
                        {tl(String(Math.round(before)))} <ArrowRight className="inline size-3.5 flip-rtl" aria-hidden /> {tl(String(n.level))}
                      </>
                    ) : (
                      tl(String(n.level))
                    )}
                  </span>
                </span>
                {n.looksLike && n.nextLevel ? (
                  <span className="text-secondary" dir="auto">
                    <span className="text-tertiary">{t("nextLooksLike", { level: tl(String(n.nextLevel)) })} </span>
                    {n.looksLike}
                  </span>
                ) : (
                  <span className="text-secondary">{t("topLevel")}</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/** Why this scenario, for this person: their industry, the role they want, the roadmap step it serves. */
function WhyThisOne({ why }: { why: NonNullable<PracticeItem["why"]> }) {
  const t = useTranslations("grow.practice.why");
  const { locale } = useLocaleSettings();
  const skill = DOMAINS.flatMap((d) => d.subSkills).find((x) => x.key === why.skillKey)?.name[locale] ?? why.skillKey;
  const lines = [
    why.step ? t("step", { step: why.step, steps: why.steps, goal: why.goal }) : t("skill", { skill: locale === "en" ? skill.toLowerCase() : skill }),
    t("role", { role: why.role }),
    why.industry ? t("industry", { industry: locale === "en" ? why.industry.toLowerCase() : why.industry }) : null,
  ].filter((x): x is string => Boolean(x));
  return (
    <section aria-labelledby="why-h" className="mb-8 flex flex-col gap-2 rounded-card border border-border bg-surface p-4 sm:flex-row sm:items-center sm:gap-5">
      <h2 id="why-h" className="eyebrow shrink-0 text-tertiary">{t("title")}</h2>
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-text">
        {lines.map((l, i) => (
          <li key={l} className="flex items-center gap-2" dir="auto">
            <span className={cn("size-1.5 shrink-0 rounded-full", i === 0 ? "bg-saffron" : "bg-text/30")} aria-hidden />
            {l}
          </li>
        ))}
      </ul>
    </section>
  );
}
