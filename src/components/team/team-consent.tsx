"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { respondInviteAction, resumeTeamAssessmentAction } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/field";
import { Alert } from "@/components/ui/alert";

export function TeamConsent({ token, team, manager, status, memberId }: { token: string; team: string; manager: string; status: string; memberId: string }) {
  const t = useTranslations("teamInvite");
  const [agree, setAgree] = React.useState(false);
  const [shareRaw, setShareRaw] = React.useState(false);
  const [pending, start] = React.useTransition();
  if (status === "CONSENTED" || status === "ASSESSED") {
    return (
      <div className="mx-auto flex max-w-[680px] flex-col gap-5 px-4 py-16">
        <h1 className="text-2xl font-semibold text-text">{t("title", { team })}</h1>
        <Alert tone="success">{t("alreadyIn")}</Alert>
        {status === "CONSENTED" ? <Button className="self-start" loading={pending} onClick={() => start(() => resumeTeamAssessmentAction(memberId))}>{t("continue")}</Button> : null}
      </div>
    );
  }
  return (
    <div className="mx-auto flex max-w-[680px] flex-col gap-6 px-4 py-12 sm:py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-text">{t("title", { team })}</h1>
        <p className="text-lg leading-relaxed text-secondary">{t("intro", { manager })}</p>
      </div>
      <Alert tone="info" title={t("devToolTitle")}>{t("devToolBody")}</Alert>
      <section className="rounded-card bg-surface shadow-card p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-text"><ShieldCheck className="size-4 text-accent-text" aria-hidden />{t("whoSees")}</h2>
        <ul className="mt-3 flex list-disc flex-col gap-1.5 ps-5 text-sm text-secondary">
          <li>{t("sees.you")}</li>
          <li>{t("sees.small")}</li>
          <li>{t("sees.levels", { manager })}</li>
          <li>{t("sees.raw")}</li>
          <li>{t("sees.leave")}</li>
        </ul>
      </section>
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2.5">
          <Checkbox id="agree" checked={agree} onCheckedChange={(c) => setAgree(c === true)} className="mt-0.5" />
          <Label htmlFor="agree" className="font-normal leading-snug">{t("agree")}</Label>
        </div>
        <div className="flex items-start gap-2.5">
          <Checkbox id="raw" checked={shareRaw} onCheckedChange={(c) => setShareRaw(c === true)} className="mt-0.5" />
          <Label htmlFor="raw" className="font-normal leading-snug">{t("shareRaw", { manager })}</Label>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="lg" disabled={!agree} loading={pending} onClick={() => start(() => respondInviteAction(token, true, shareRaw))}>{t("accept")}</Button>
        <Button size="lg" variant="ghost" disabled={pending} onClick={() => start(() => respondInviteAction(token, false, false))}>{t("decline")}</Button>
      </div>
    </div>
  );
}
