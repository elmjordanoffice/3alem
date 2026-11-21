"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle, Check, Eye, EyeOff, PencilLine, Printer } from "lucide-react";
import type { InterviewKit, KitFocus, Recommendation, ScorecardRating } from "@/lib/hire/interview";
import { submitScorecard } from "@/app/actions/decisions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { RangeScale } from "@/components/report/range-scale";
import { LevelLabel } from "@/components/report/level";
import { useNumbers } from "@/components/providers";
import { cn } from "@/lib/utils";

const RECS: Recommendation[] = ["STRONG_YES", "YES", "NO", "STRONG_NO"];
const REASON_TONE = { gap: "warning", hypothesis: "info", uncertain: "neutral", strength: "success" } as const;

/** Same rule as the server's `disagrees`: a full level outside the assessment's range. */
const apart = (rating: number | null, range: [number, number]) => rating != null && (rating <= range[0] - 1 || rating >= range[1] + 1);

export function InterviewKitView({ kit }: { kit: InterviewKit }) {
  const t = useTranslations("interview");
  const router = useRouter();
  const revealed = Boolean(kit.mine);
  const [editing, setEditing] = React.useState(!kit.mine);
  const [ratings, setRatings] = React.useState<Record<string, ScorecardRating>>(() =>
    Object.fromEntries(kit.focus.map((f) => [f.skillKey, kit.mine?.ratings.find((r) => r.skillKey === f.skillKey) ?? { skillKey: f.skillKey, rating: null, note: "" }])),
  );
  const [rec, setRec] = React.useState<Recommendation | null>(kit.mine?.recommendation ?? null);
  const [summary, setSummary] = React.useState(kit.mine?.summary ?? "");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState(false);
  const rated = Object.values(ratings).filter((r) => r.rating != null).length;
  const canSubmit = rated > 0 && rec && summary.trim().length >= 10;

  const others = kit.scorecards.filter((s) => !s.mine);
  const disagreements = kit.focus.filter((f) => kit.scorecards.some((s) => apart(s.ratings.find((r) => r.skillKey === f.skillKey)?.rating ?? null, f.assessment.range)));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="flex items-center gap-2 text-sm text-secondary">
          {revealed ? <Eye className="size-4 text-accent" aria-hidden /> : <EyeOff className="size-4 text-accent" aria-hidden />}
          {revealed ? t("revealed") : t("blind", { n: kit.scorecardCount })}
        </p>
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Printer aria-hidden />
          {t("print")}
        </Button>
      </div>

      {revealed ? <Debrief kit={kit} disagreements={disagreements} others={others.length} /> : null}

      <ol className="flex flex-col gap-4">
        {kit.focus.map((f, i) => (
          <li key={f.skillKey}>
            <FocusCard
              n={i + 1}
              f={f}
              revealed={revealed}
              editing={editing}
              value={ratings[f.skillKey]!}
              onChange={(v) => setRatings((r) => ({ ...r, [f.skillKey]: v }))}
              others={kit.scorecards}
            />
          </li>
        ))}
      </ol>

      <section aria-labelledby="overall" className="rounded-[20px] bg-surface p-5 shadow-card sm:p-6 print:shadow-none">
        <h2 id="overall" className="font-display text-lg font-semibold">{t("overallTitle")}</h2>
        <p className="mt-1 text-sm text-secondary">{t("overallBody")}</p>
        {editing ? (
          <div className="mt-4 flex flex-col gap-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">{t("recommendation")}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RECS.map((r) => (
                  <label
                    key={r}
                    className={cn(
                      "flex cursor-pointer items-center justify-center rounded-[12px] px-3 py-2.5 text-sm font-medium shadow-[inset_0_0_0_1px_var(--border)] has-focus-visible:outline-2 has-focus-visible:outline-focus",
                      rec === r ? "bg-accent text-accent-foreground shadow-none" : "hover:bg-surface-subtle",
                    )}
                  >
                    <input type="radio" name="rec" value={r} checked={rec === r} onChange={() => setRec(r)} className="sr-only" />
                    {t(`rec.${r}`)}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col gap-2">
              <Label htmlFor="summary">{t("summaryLabel")}</Label>
              <Textarea id="summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder={t("summaryPlaceholder")} dir="auto" />
            </div>
            {error ? <p className="text-sm text-critical">{t("error")}</p> : null}
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <Button
                loading={pending}
                disabled={!canSubmit}
                onClick={async () => {
                  if (!rec) return;
                  setPending(true);
                  setError(false);
                  const res = await submitScorecard({ sessionId: kit.sessionId, ratings: Object.values(ratings), recommendation: rec, summary });
                  setPending(false);
                  if (!res.ok) return setError(true);
                  setEditing(false);
                  router.refresh();
                  // The debrief appears at the top: take the interviewer there.
                  window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
                }}
              >
                <Check aria-hidden />
                {kit.mine ? t("update") : t("submit")}
              </Button>
              <span className="text-sm text-tertiary">{t("ratedOf", { n: rated, total: kit.focus.length })}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            <p className="text-sm">
              <span className="text-secondary">{t("yourRecommendation")}</span> <Badge tone="accent">{rec ? t(`rec.${rec}`) : ""}</Badge>
            </p>
            <p className="whitespace-pre-line text-sm" dir="auto">{summary}</p>
            <div className="print:hidden">
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <PencilLine aria-hidden />
                {t("edit")}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function FocusCard({
  n,
  f,
  revealed,
  editing,
  value,
  onChange,
  others,
}: {
  n: number;
  f: KitFocus;
  revealed: boolean;
  editing: boolean;
  value: ScorecardRating;
  onChange: (v: ScorecardRating) => void;
  others: InterviewKit["scorecards"];
}) {
  const t = useTranslations("interview");
  const tl = useTranslations("levels");
  const num = useNumbers();
  const id = `focus-${n}`;
  return (
    <article aria-labelledby={id} className="rounded-[20px] bg-surface p-5 shadow-card sm:p-6 print:break-inside-avoid print:shadow-none">
      <header className="flex flex-wrap items-center gap-2">
        <span className="tabular grid size-7 place-items-center rounded-full bg-accent-subtle text-xs font-semibold text-accent-text" aria-hidden>
          {num.number(n)}
        </span>
        <h2 id={id} className="font-display text-lg font-semibold">{f.name}</h2>
        <Badge tone={REASON_TONE[f.reason]}>{t(`reason.${f.reason}`)}</Badge>
        {f.importance === "MUST_HAVE" ? <Badge tone="accent">{t("mustHave")}</Badge> : null}
      </header>

      <p className="mt-4 text-[17px] font-medium leading-relaxed" dir="auto">“{f.question}”</p>
      {f.situational ? (
        <p className="mt-2 text-sm text-secondary" dir="auto">
          <span className="font-medium text-text">{t("situational")}</span> {f.situational}
        </p>
      ) : null}

      {f.followUps.length ? (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-tertiary">{t("followUps")}</h3>
          <ul className="mt-1.5 flex list-disc flex-col gap-1 ps-5 text-sm marker:text-mark-muted">
            {f.followUps.map((q) => (
              <li key={q} dir="auto">{q}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {f.listenFor.length || f.watchFor.length ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SignalList title={t("listenFor")} items={f.listenFor} tone="good" />
          <SignalList title={t("watchFor")} items={f.watchFor} tone="watch" />
        </div>
      ) : null}

      {f.anchors.length ? (
        <details className="group mt-4 rounded-[14px] bg-surface-subtle p-3 text-sm shadow-[inset_0_0_0_1px_var(--border)]">
          <summary className="cursor-pointer font-medium marker:text-mark-muted">{t("levels")}</summary>
          <dl className="mt-2 flex flex-col gap-2">
            {f.anchors.map((a) => (
              <div key={a.level} className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2">
                <dt className="text-secondary">
                  <span className="tabular">{num.number(a.level)}</span> · {tl(String(a.level))}
                </dt>
                <dd dir="auto">{a.text}</dd>
              </div>
            ))}
          </dl>
        </details>
      ) : null}

      <div className="mt-5 border-t border-border pt-4">
        <fieldset disabled={!editing}>
          <legend className="mb-2 text-sm font-medium">{t("yourRating")}</legend>
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t("yourRating")}>
            {[1, 2, 3, 4, 5].map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={value.rating === l}
                onClick={() => onChange({ ...value, rating: value.rating === l ? null : l })}
                className={cn(
                  "flex h-11 min-w-11 flex-col items-center justify-center rounded-[12px] px-3 text-sm shadow-[inset_0_0_0_1px_var(--border)] focus-visible:outline-2 focus-visible:outline-focus disabled:cursor-default",
                  value.rating === l ? "bg-accent font-semibold text-accent-foreground shadow-none" : "enabled:hover:bg-surface-subtle",
                )}
              >
                <span className="tabular">{num.number(l)}</span>
                <span className={cn("hidden text-[10px] sm:block", value.rating === l ? "text-accent-foreground/85" : "text-tertiary")}>{tl(String(l))}</span>
              </button>
            ))}
            <span className="self-center ps-2 text-xs text-tertiary">{value.rating == null ? t("notRated") : null}</span>
          </div>
          <Label htmlFor={`${id}-note`} className="sr-only">
            {t("noteLabel")}
          </Label>
          <Textarea
            id={`${id}-note`}
            rows={2}
            className="mt-3"
            value={value.note}
            onChange={(e) => onChange({ ...value, note: e.target.value })}
            placeholder={t("notePlaceholder")}
            dir="auto"
          />
        </fieldset>
      </div>

      {revealed ? (
        <div className="mt-4 rounded-[14px] bg-surface-subtle p-3 shadow-[inset_0_0_0_1px_var(--border)]">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="font-medium">{t("assessmentSaid")}</span>
            <LevelLabel estimate={f.assessment.estimate} confidence={f.assessment.confidence} range={f.assessment.range} />
          </div>
          <RangeScale low={f.assessment.range[0]} high={f.assessment.range[1]} estimate={f.assessment.estimate} size="sm" className="mt-2" />
          <ul className="mt-3 flex flex-col gap-1 text-sm">
            {others.map((s) => {
              const r = s.ratings.find((x) => x.skillKey === f.skillKey)?.rating ?? null;
              return (
                <li key={s.interviewerName + s.submittedAt} className="flex flex-wrap items-center gap-2">
                  <span className="text-secondary">{s.mine ? t("you") : s.interviewerName}</span>
                  <span className="tabular font-medium">{r == null ? "—" : num.number(r)}</span>
                  {apart(r, f.assessment.range) ? (
                    <span className="inline-flex items-center gap-1 text-xs text-warning">
                      <AlertTriangle className="size-3.5" aria-hidden />
                      {t("apart")}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function SignalList({ title, items, tone }: { title: string; items: string[]; tone: "good" | "watch" }) {
  if (!items.length) return null;
  return (
    <div className={cn("rounded-[14px] p-3", tone === "good" ? "bg-success-subtle" : "bg-warning-subtle")}>
      <h3 className={cn("text-xs font-semibold uppercase tracking-wide", tone === "good" ? "text-success" : "text-warning")}>{title}</h3>
      <ul className="mt-1.5 flex flex-col gap-1 text-sm">
        {items.map((x) => (
          <li key={x} className="flex gap-2" dir="auto">
            <span aria-hidden className={tone === "good" ? "text-success" : "text-warning"}>
              {tone === "good" ? "✓" : "!"}
            </span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Debrief({ kit, disagreements, others }: { kit: InterviewKit; disagreements: KitFocus[]; others: number }) {
  const t = useTranslations("interview");
  return (
    <section aria-labelledby="debrief" className="hero-card rounded-[24px] p-5 sm:p-6">
      <h2 id="debrief" className="font-display text-lg font-semibold">{t("debriefTitle")}</h2>
      <p className="mt-1 text-sm text-hero-secondary">{others ? t("debriefBody", { n: kit.scorecards.length }) : t("debriefSolo")}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RECS.map((r) => (
          <div key={r} className="hero-tile rounded-[14px] p-3">
            <dt className="text-xs text-hero-secondary">{t(`rec.${r}`)}</dt>
            <dd className="tabular mt-1 text-xl font-semibold">{kit.scorecards.filter((s) => s.recommendation === r).length}</dd>
          </div>
        ))}
      </dl>
      {disagreements.length ? (
        <Alert tone="warning" title={t("disagreeTitle", { n: disagreements.length })} className="mt-4">
          {t("disagreeBody", { skills: disagreements.map((d) => d.name).join(t("listSep")) })}
        </Alert>
      ) : (
        <p className="mt-4 text-sm text-hero-secondary">{t("agree")}</p>
      )}
      {kit.scorecards.length > 1 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {kit.scorecards.map((s) => (
            <li key={s.interviewerName + s.submittedAt} className="hero-tile rounded-[14px] p-3 text-sm">
              <span className="font-medium">{s.mine ? t("you") : s.interviewerName}</span> · {t(`rec.${s.recommendation}`)}
              <p className="mt-1 text-hero-secondary" dir="auto">{s.summary}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
