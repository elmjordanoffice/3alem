"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { BookOpenText, PencilLine, UserRoundSearch } from "lucide-react";
import type { Adjustment, AnswerContext, ReviewState } from "@/lib/hire/review";
import { adjustSkillLevel, clearAdjustment, confirmHumanReview, getAnswerContext } from "@/app/actions/review";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useLocaleSettings, useNumbers } from "@/components/providers";
import { cn } from "@/lib/utils";

export interface ReviewInfo {
  sessionId: string;
  state: ReviewState | null;
  adjustments: Adjustment[];
  /** The hiring team's own view: reviewers can adjust levels and open answers. */
  editable: boolean;
}

const Ctx = React.createContext<ReviewInfo | null>(null);
export const ReviewProvider = Ctx.Provider;
export function useReview() {
  return React.useContext(Ctx);
}

function useDate() {
  const { locale } = useLocaleSettings();
  return (iso: string) => new Date(iso).toLocaleDateString(locale === "ar" ? "ar" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** The candidate asked for a person to review every score: what's needed, or who did it. */
export function ReviewBanner({ candidateName }: { candidateName: string }) {
  const r = useReview();
  const t = useTranslations("report.review");
  const tc = useTranslations("common");
  const date = useDate();
  const router = useRouter();
  const [note, setNote] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState(false);
  if (!r?.state?.requested) return null;
  if (r.state.reviewedAt) {
    return (
      <Alert tone="neutral" title={t("doneTitle")}>
        {t("doneBody", { name: r.state.reviewerName ?? "", date: date(r.state.reviewedAt), note: r.state.note ?? "" })}
      </Alert>
    );
  }
  return (
    <Alert
      tone="warning"
      title={t("pendingTitle", { name: candidateName })}
      action={
        r.editable ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserRoundSearch aria-hidden />
                {t("confirm")}
              </Button>
            </DialogTrigger>
            <DialogContent closeLabel={tc("close")}>
              <DialogHeader>
                <DialogTitle>{t("confirmTitle")}</DialogTitle>
                <DialogDescription>{t("confirmBody")}</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <Label htmlFor="review-note">{t("noteLabel")}</Label>
                <Textarea id="review-note" rows={4} value={note} onChange={(e) => setNote(e.target.value)} dir="auto" />
                {error ? <p className="text-sm text-critical">{t("error")}</p> : null}
              </div>
              <DialogFooter>
                <Button
                  loading={pending}
                  disabled={note.trim().length < 10}
                  onClick={async () => {
                    setPending(true);
                    setError(false);
                    const res = await confirmHumanReview({ sessionId: r.sessionId, note });
                    setPending(false);
                    if (!res.ok) return setError(true);
                    router.refresh();
                  }}
                >
                  {t("confirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : undefined
      }
    >
      {t("pendingBody")}
    </Alert>
  );
}

const LEVELS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

/** A reviewer's level for a skill area: shown when set; editable in the team's own view. */
export function AdjustControl({ skillKey, skillName, range }: { skillKey: string; skillName: string; range: [number, number] }) {
  const r = useReview();
  const t = useTranslations("report.adjust");
  const tl = useTranslations("levels");
  const tc = useTranslations("common");
  const n = useNumbers();
  const date = useDate();
  const router = useRouter();
  const current = r?.adjustments.find((a) => a.skillKey === skillKey);
  const [open, setOpen] = React.useState(false);
  const [level, setLevel] = React.useState<number>(current?.level ?? Math.round(((range[0] + range[1]) / 2) * 2) / 2);
  const [note, setNote] = React.useState(current?.note ?? "");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState(false);
  if (!r || (!current && !r.editable)) return null;
  const levelName = (v: number) => (Number.isInteger(v) ? tl(String(v) as "1") : `${tl(String(Math.floor(v)) as "1")}+`);

  return (
    <>
      {current ? (
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 px-4 pb-3 text-sm sm:px-5">
          <Badge tone="accent">{t("tag")}</Badge>
          <span className="font-medium text-text">
            {levelName(current.level)} <bdi dir="ltr" className="tabular text-secondary">{n.level(current.level)}</bdi>
          </span>
          <span className="text-secondary" dir="auto">“{current.note}”</span>
          <span className="text-xs text-tertiary">{t("by", { name: current.byName, date: date(current.at) })}</span>
        </p>
      ) : null}
      {r.editable ? (
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            setError(false);
          }}
        >
          <DialogTrigger asChild>
            {/* Sits beside the row's chevron; the row itself is the expand button. */}
            <Button variant="ghost" size="icon-sm" className="absolute end-10 top-3 sm:end-11 print:hidden" aria-label={t("title", { skill: skillName })} title={t("button")}>
              <PencilLine aria-hidden />
            </Button>
          </DialogTrigger>
          <DialogContent closeLabel={tc("close")}>
            <DialogHeader>
              <DialogTitle>{t("title", { skill: skillName })}</DialogTitle>
              <DialogDescription>{t("body", { range: n.range(range[0], range[1]) })}</DialogDescription>
            </DialogHeader>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-text">{t("level")}</legend>
              <div className="grid grid-cols-9 gap-1" role="radiogroup" aria-label={t("level")}>
                {LEVELS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    role="radio"
                    aria-checked={level === v}
                    aria-label={`${levelName(v)} ${v}`}
                    onClick={() => setLevel(v)}
                    className={cn(
                      "h-10 rounded-control border text-sm tabular transition-colors focus-visible:outline-2 focus-visible:outline-focus",
                      level === v ? "border-accent bg-accent text-accent-foreground" : "border-border-strong bg-surface text-secondary hover:bg-surface-subtle",
                    )}
                  >
                    {n.level(v)}
                  </button>
                ))}
              </div>
              <p className="text-sm text-secondary">{levelName(level)}</p>
            </fieldset>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`adjust-note-${skillKey}`}>{t("note")}</Label>
              <Textarea id={`adjust-note-${skillKey}`} rows={3} value={note} onChange={(e) => setNote(e.target.value)} dir="auto" aria-describedby={`adjust-hint-${skillKey}`} />
              <p id={`adjust-hint-${skillKey}`} className="text-xs text-tertiary">{t("noteHint")}</p>
              {error ? <p className="text-sm text-critical">{t("error")}</p> : null}
            </div>
            <DialogFooter className="sm:justify-between">
              {current ? (
                <Button
                  variant="ghost"
                  onClick={async () => {
                    setPending(true);
                    await clearAdjustment({ sessionId: r.sessionId, skillKey });
                    setPending(false);
                    setOpen(false);
                    router.refresh();
                  }}
                >
                  {t("restore")}
                </Button>
              ) : (
                <span />
              )}
              <Button
                loading={pending}
                disabled={note.trim().length < 10}
                onClick={async () => {
                  setPending(true);
                  setError(false);
                  const res = await adjustSkillLevel({ sessionId: r.sessionId, skillKey, level, note });
                  setPending(false);
                  if (!res.ok) return setError(true);
                  setOpen(false);
                  router.refresh();
                }}
              >
                {t("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

/** "Read the full answer": the scene and everything the candidate wrote, with the quoted words marked. */
export function OpenAnswer({ scoreId }: { scoreId: string }) {
  const r = useReview();
  const t = useTranslations("report.answer");
  const tc = useTranslations("common");
  const [state, setState] = React.useState<{ status: "idle" | "loading" | "error" } | { status: "ready"; answer: AnswerContext }>({ status: "idle" });
  if (!r?.editable) return null;

  const load = async () => {
    if (state.status === "ready" || state.status === "loading") return;
    setState({ status: "loading" });
    const res = await getAnswerContext(r.sessionId, scoreId);
    setState(res.ok ? { status: "ready", answer: res.answer } : { status: "error" });
  };

  return (
    <Dialog onOpenChange={(o) => (o ? load() : null)}>
      <DialogTrigger asChild>
        <button type="button" className="inline-flex items-center gap-1 text-xs font-medium text-accent-text underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-focus print:hidden">
          <BookOpenText className="size-3.5" aria-hidden />
          {t("open")}
        </button>
      </DialogTrigger>
      <DialogContent closeLabel={tc("close")} className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{state.status === "ready" && state.answer.title ? state.answer.title : t("title")}</DialogTitle>
          <DialogDescription className="sr-only">{t("title")}</DialogDescription>
        </DialogHeader>
        {state.status === "loading" || state.status === "idle" ? <p className="text-sm text-secondary" role="status">…</p> : null}
        {state.status === "error" ? <Alert tone="critical">{t("error")}</Alert> : null}
        {state.status === "ready" ? <AnswerBody a={state.answer} /> : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">{tc("close")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AnswerBody({ a }: { a: AnswerContext }) {
  const t = useTranslations("report.answer");
  return (
    <div className="flex flex-col gap-5 text-sm leading-relaxed">
      {a.scenario ? (
        <section>
          <h3 className="text-xs font-medium text-tertiary">{t("scene")}</h3>
          <p className="mt-1.5 whitespace-pre-line text-secondary" dir="auto">{a.scenario}</p>
        </section>
      ) : null}
      {a.chosen ? (
        <section>
          <h3 className="text-xs font-medium text-tertiary">{t("chosen")}</h3>
          <p className="mt-1.5 whitespace-pre-line font-medium text-text" dir="auto">{a.chosen}</p>
        </section>
      ) : null}
      <section>
        <h3 className="text-xs font-medium text-tertiary">{t("answer")}</h3>
        <div className="mt-1.5 flex flex-col gap-3">
          {a.parts.map((p, i) => (
            <div key={i} className={cn(p.who === "stakeholder" && "text-secondary")}>
              {p.who ? <p className="text-xs font-medium text-tertiary">{p.who === "candidate" ? t("candidate") : t("stakeholder")}</p> : null}
              {p.label ? <p className="text-xs font-medium text-tertiary" dir="auto">{p.label}</p> : null}
              <p className="whitespace-pre-line text-text" dir="auto">
                <Highlighted text={p.text} quote={a.quote} />
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Marks the quoted words inside the full answer, if they appear verbatim. */
function Highlighted({ text, quote }: { text: string; quote: string }) {
  const q = quote.trim();
  const i = q ? text.indexOf(q) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="evidence-mark">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}
