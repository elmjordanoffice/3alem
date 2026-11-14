"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteCandidateData, recordOutcome } from "@/app/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNumbers } from "@/components/providers";
import { cn } from "@/lib/utils";

/** After the hiring decision: record job performance (validity) and, for admins, erase the data. */
export function AfterHire({ sessionId, candidateName, outcomes, canDelete }: { sessionId: string; candidateName: string; outcomes: { period: number; rating: number }[]; canDelete: boolean }) {
  const t = useTranslations("outcomes");
  const tc = useTranslations("common");
  const n = useNumbers();
  const router = useRouter();
  const [confirm, setConfirm] = React.useState("");
  const [pending, setPending] = React.useState(false);
  return (
    <div className="mt-10 grid gap-4 border-t border-border pt-8 print:hidden lg:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {[6, 12].map((period) => {
            const current = outcomes.find((o) => o.period === period)?.rating ?? 0;
            return (
              <fieldset key={period}>
                <legend className="text-sm font-medium text-text">{t("period", { months: period })}</legend>
                <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={t("period", { months: period })}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      role="radio"
                      aria-checked={current === r}
                      onClick={async () => {
                        const res = await recordOutcome({ sessionId, period: period as 6 | 12, rating: r });
                        if (res.ok) { toast.success(t("saved")); router.refresh(); }
                      }}
                      className={cn("flex h-auto min-w-24 flex-col items-start rounded-control border px-3 py-2 text-start text-xs", current === r ? "border-accent bg-accent-subtle text-accent-text" : "border-border-strong text-secondary hover:bg-surface-subtle")}
                    >
                      <span className="text-sm font-semibold tabular">{n.number(r)}</span>
                      <span>{t(`scale.${r}` as "scale.1")}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            );
          })}
          <p className="text-xs text-tertiary">{t("privacy")}</p>
        </CardContent>
      </Card>
      {canDelete ? (
        <Card className="self-start">
          <CardHeader>
            <CardTitle>{t("deleteTitle")}</CardTitle>
            <CardDescription>{t("deleteBody")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog onOpenChange={() => setConfirm("")}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="text-critical"><Trash2 aria-hidden /> {t("deleteAction")}</Button>
              </DialogTrigger>
              <DialogContent closeLabel={tc("close")}>
                <DialogHeader>
                  <DialogTitle>{t("confirmTitle", { name: candidateName })}</DialogTitle>
                  <DialogDescription>{t("confirmBody")}</DialogDescription>
                </DialogHeader>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">{t("confirmLabel")}</span>
                  <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" />
                </label>
                <DialogFooter>
                  <Button variant="destructive" loading={pending} disabled={confirm.trim() !== candidateName.trim()} onClick={async () => { setPending(true); await deleteCandidateData(sessionId); setPending(false); }}>
                    {t("confirmAction")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
