"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Download, Trash2 } from "lucide-react";
import { deleteMyAccount } from "@/app/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** Data portability and erasure for the signed-in person. */
export function DataRights({ email }: { email: string }) {
  const t = useTranslations("dataRights");
  const tc = useTranslations("common");
  const [confirm, setConfirm] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
          <div className="max-w-md">
            <p className="text-sm font-medium text-text">{t("exportTitle")}</p>
            <p className="text-sm text-secondary">{t("exportBody")}</p>
          </div>
          <a href="/api/me/export" className={buttonVariants({ variant: "secondary" })} download>
            <Download aria-hidden /> {t("exportAction")}
          </a>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div className="max-w-md">
            <p className="text-sm font-medium text-text">{t("deleteTitle")}</p>
            <p className="text-sm text-secondary">{t("deleteBody")}</p>
          </div>
          <Dialog onOpenChange={() => { setConfirm(""); setError(null); }}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="text-critical"><Trash2 aria-hidden /> {t("deleteAction")}</Button>
            </DialogTrigger>
            <DialogContent closeLabel={tc("close")}>
              <form
                className="flex flex-col gap-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setPending(true);
                  const res = await deleteMyAccount(confirm);
                  setPending(false);
                  if (res && !res.ok) setError(t(`errors.${res.error}` as "errors.confirmMismatch"));
                }}
              >
                <DialogHeader>
                  <DialogTitle>{t("confirmTitle")}</DialogTitle>
                  <DialogDescription>{t("confirmBody")}</DialogDescription>
                </DialogHeader>
                {error ? <Alert tone="critical">{error}</Alert> : null}
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">{t("confirmLabel", { email })}</span>
                  <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" dir="ltr" />
                </label>
                <DialogFooter>
                  <Button type="submit" variant="destructive" loading={pending} disabled={confirm.trim().toLowerCase() !== email.toLowerCase()}>{t("confirmAction")}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
