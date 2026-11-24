"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, CheckCircle2, ClipboardList, Gavel } from "lucide-react";
import type { DecisionState } from "@/lib/hire/review";
import { recordDecision } from "@/app/actions/decisions";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { useLocaleSettings } from "@/components/providers";
import { cn } from "@/lib/utils";

const OUTCOMES = ["ADVANCE", "HIRE", "HOLD", "DECLINE"] as const;
type Outcome = (typeof OUTCOMES)[number];
const TONE: Record<Outcome, "accent" | "success" | "neutral" | "warning"> = { ADVANCE: "accent", HIRE: "success", HOLD: "neutral", DECLINE: "warning" };

/**
 * The step after reading a report: prepare the interview, then record what the
 * team decided and why. People decide; the reason is kept so the decision can
 * be explained later.
 */
export function DecisionPanel({
  sessionId,
  candidateName,
  decision,
  scorecards,
  reviewPending,
}: {
  sessionId: string;
  candidateName: string;
  decision: DecisionState | null;
  scorecards: number;
  reviewPending: boolean;
}) {
  const t = useTranslations("report.decision");
  const tc = useTranslations("common");
  const router = useRouter();
  const { locale } = useLocaleSettings();
  const [open, setOpen] = React.useState(false);
  const [outcome, setOutcome] = React.useState<Outcome | null>(decision?.outcome ?? null);
  const [reason, setReason] = React.useState(decision?.reason ?? "");
  // Just recorded: the outcome lands like a stamp.
  const [justSaved, setJustSaved] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const blocked = reviewPending && (outcome === "HIRE" || outcome === "DECLINE");
  const date = (iso: string) => new Date(iso).toLocaleDateString(locale === "ar" ? "ar" : "en-GB", { day: "numeric", month: "long" });

  return (
    <section aria-labelledby="decision-title" className="mb-6 grid gap-3 rounded-[16px] bg-surface p-4 shadow-card sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-accent-subtle text-accent-text", justSaved && decision && "joy-pop")} aria-hidden>
          {decision ? <CheckCircle2 className="size-5" /> : <Gavel className="size-5" />}
        </span>
        <div className="min-w-0">
          <h2 id="decision-title" className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            {t("title")}
            {decision ? (
              <span key={`${decision.outcome}-${decision.at}`} className={cn("inline-flex", justSaved && "joy-stamp")}>
                <Badge tone={TONE[decision.outcome]}>{t(`outcome.${decision.outcome}`)}</Badge>
              </span>
            ) : (
              <span className="font-normal text-tertiary">{t("none")}</span>
            )}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-sm text-secondary" dir="auto">
            {decision ? t("by", { name: decision.byName, date: date(decision.at), reason: decision.reason }) : t("hint", { name: candidateName })}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href={`/app/reports/${sessionId}/interview`}>
            <ClipboardList aria-hidden />
            {t("kit")}
            {scorecards ? <span className="tabular rounded-full bg-accent-subtle px-1.5 text-xs text-accent-text">{scorecards}</span> : null}
            <ArrowRight className="flip-rtl" aria-hidden />
          </Link>
        </Button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">{decision ? t("change") : t("record")}</Button>
          </DialogTrigger>
          <DialogContent closeLabel={tc("close")}>
            <DialogHeader>
              <DialogTitle>{t("dialogTitle", { name: candidateName })}</DialogTitle>
              <DialogDescription>{t("dialogBody")}</DialogDescription>
            </DialogHeader>
            <fieldset className="grid grid-cols-2 gap-2">
              <legend className="sr-only">{t("title")}</legend>
              {OUTCOMES.map((o) => (
                <label
                  key={o}
                  className={cn(
                    "flex cursor-pointer flex-col gap-0.5 rounded-xl p-3 text-sm shadow-[inset_0_0_0_1px_var(--border)] transition-colors has-focus-visible:outline-2 has-focus-visible:outline-focus",
                    outcome === o ? "bg-accent-subtle shadow-[inset_0_0_0_2px_var(--accent)]" : "hover:bg-surface-subtle",
                  )}
                >
                  <input type="radio" name="outcome" value={o} checked={outcome === o} onChange={() => setOutcome(o)} className="sr-only" />
                  <span className="font-medium">{t(`outcome.${o}`)}</span>
                  <span className="text-xs text-secondary">{t(`outcomeHint.${o}`)}</span>
                </label>
              ))}
            </fieldset>
            {blocked ? <p className="text-sm text-warning">{t("reviewFirst")}</p> : null}
            <div className="flex flex-col gap-2">
              <Label htmlFor="decision-reason">{t("reasonLabel")}</Label>
              <Textarea id="decision-reason" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("reasonPlaceholder")} dir="auto" />
              <p className="text-xs text-tertiary">{t("reasonHelp")}</p>
              {error ? <p className="text-sm text-critical">{t(`error.${error === "reviewPending" ? "reviewPending" : "generic"}`)}</p> : null}
            </div>
            <DialogFooter>
              <Button
                loading={pending}
                disabled={!outcome || reason.trim().length < 10 || blocked}
                onClick={async () => {
                  if (!outcome) return;
                  setPending(true);
                  setError(null);
                  const res = await recordDecision({ sessionId, outcome, reason });
                  setPending(false);
                  if (!res.ok) return setError(res.error);
                  setOpen(false);
                  setJustSaved(true);
                  router.refresh();
                }}
              >
                {t("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
