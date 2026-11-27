"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/field";
import { PolicyLinks } from "@/components/legal/policy-links";

/**
 * "How AI is used in this assessment": what AI does, what it never does, who
 * decides, and (before starting) the candidate's choice to ask for a person to
 * review every score. Plain statements, no hedging.
 */
export function AiExplainer({
  org,
  trigger,
  humanReview,
  onHumanReviewChange,
}: {
  org: string;
  trigger: React.ReactNode;
  /** When given, the dialog offers the human-review choice. */
  humanReview?: boolean;
  onHumanReviewChange?: (v: boolean) => void;
}) {
  const t = useTranslations("candidate.ai");
  const tc = useTranslations("common");
  const tl = useTranslations("legal.links");
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent closeLabel={tc("close")} className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("intro")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6 text-sm leading-relaxed">
          <section>
            <h3 className="font-semibold text-text">{t("doesTitle")}</h3>
            <ul className="mt-2.5 flex flex-col gap-2">
              {(["world", "roleplay", "scoring", "report"] as const).map((k) => (
                <li key={k} className="flex gap-2.5 text-secondary">
                  <Check className="mt-0.5 size-4 shrink-0 text-accent-text" aria-hidden />
                  {t(`does.${k}`)}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-text">{t("neverTitle")}</h3>
            <ul className="mt-2.5 flex flex-col gap-2">
              {(["decide", "face", "style", "integrity"] as const).map((k) => (
                <li key={k} className="flex gap-2.5 text-secondary">
                  <X className="mt-0.5 size-4 shrink-0 text-tertiary" aria-hidden />
                  {t(`never.${k}`)}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="font-semibold text-text">{t("decideTitle")}</h3>
            <p className="mt-2 text-secondary">{t("decide", { org })}</p>
          </section>
          <section>
            <h3 className="font-semibold text-text">{tl("more")}</h3>
            <PolicyLinks policies={["ai", "privacy"]} className="mt-2" />
          </section>
          {onHumanReviewChange ? (
            <section className="rounded-card bg-surface-subtle p-4 shadow-[inset_0_0_0_1px_var(--border)]">
              <h3 className="font-semibold text-text">{t("choiceTitle")}</h3>
              <p className="mt-2 text-secondary">{t("choice", { org })}</p>
              <div className="mt-3 flex items-start gap-2.5">
                <Checkbox id="human-review" checked={Boolean(humanReview)} onCheckedChange={(c) => onHumanReviewChange(c === true)} className="mt-0.5" />
                <Label htmlFor="human-review" className="font-medium leading-snug">{t("choiceLabel")}</Label>
              </div>
            </section>
          ) : null}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button>{t("done")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
