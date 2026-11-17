"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/field";
import { Person } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * One untimed practice scene before the real assessment: the same shape as a
 * real scene (a message, a choice, a reason), entirely in the browser. Nothing
 * is scored, sent or saved.
 */
export function PracticeScene({ trigger }: { trigger: React.ReactNode }) {
  const t = useTranslations("candidate.practice");
  const tc = useTranslations("common");
  const [choice, setChoice] = React.useState<string | null>(null);
  const [why, setWhy] = React.useState("");
  const [done, setDone] = React.useState(false);
  const reset = () => {
    setChoice(null);
    setWhy("");
    setDone(false);
  };

  return (
    <Dialog onOpenChange={(o) => (o ? null : reset())}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel={tc("close")} className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>{t("title")}</DialogTitle>
            <Badge tone="neutral">{t("badge")}</Badge>
          </div>
          <DialogDescription className="sr-only">{t("badge")}</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col gap-2 py-2" role="status">
            <p className="font-display text-xl font-semibold text-text">{t("doneTitle")}</p>
            <p className="text-sm leading-relaxed text-secondary">{t("doneBody")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="rounded-card bg-surface-subtle p-4 shadow-[inset_0_0_0_1px_var(--border)]">
              <Person name={t("from")} role={t("fromRole")} />
              <p className="mt-3 text-[15px] leading-relaxed text-text">{t("message")}</p>
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-medium text-text">{t("choose")}</legend>
              {(["a", "b", "c"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={choice === k}
                  onClick={() => setChoice(k)}
                  className={cn(
                    "rounded-card border px-4 py-3 text-start text-sm leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-focus",
                    "flex items-center gap-3",
                    choice === k ? "border-accent bg-accent-subtle text-text ring-1 ring-accent" : "border-border-strong bg-surface text-text hover:bg-surface-subtle",
                  )}
                >
                  <span className={cn("inline-flex size-4 shrink-0 items-center justify-center rounded-full border", choice === k ? "border-accent bg-accent" : "border-border-strong")} aria-hidden>
                    {choice === k ? <span className="size-1.5 rounded-full bg-accent-foreground" /> : null}
                  </span>
                  {t(`options.${k}`)}
                </button>
              ))}
            </fieldset>
            <div className="flex flex-col gap-2">
              <Label htmlFor="practice-why">{t("why")}</Label>
              <Textarea id="practice-why" rows={3} value={why} onChange={(e) => setWhy(e.target.value)} dir="auto" />
            </div>
          </div>
        )}

        <DialogFooter>
          {done ? (
            <>
              <Button variant="secondary" onClick={reset}>
                {t("again")}
              </Button>
              <DialogClose asChild>
                <Button>{t("close")}</Button>
              </DialogClose>
            </>
          ) : (
            <Button disabled={!choice || why.trim().length < 3} onClick={() => setDone(true)}>
              {t("finish")}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
