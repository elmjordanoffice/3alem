"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { deleteOrganization } from "@/app/actions/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

/** Organisation settings: delete the organisation and all its data (admins only). */
export function DeleteOrganization({ name, inProgress }: { name: string; inProgress: number }) {
  const t = useTranslations("dataRights.org");
  const tc = useTranslations("common");
  const [confirm, setConfirm] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const matches = confirm.trim().toLocaleLowerCase() === name.trim().toLocaleLowerCase();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("body")}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-end">
        <Dialog onOpenChange={() => { setConfirm(""); setError(null); }}>
          <DialogTrigger asChild>
            <Button variant="secondary" className="text-critical"><Trash2 aria-hidden /> {t("action")}</Button>
          </DialogTrigger>
          <DialogContent closeLabel={tc("close")}>
            <form
              className="flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!matches) return;
                setPending(true);
                const res = await deleteOrganization(confirm);
                setPending(false);
                if (res && !res.ok) setError(t(`errors.${res.error}` as "errors.failed"));
              }}
            >
              <DialogHeader>
                <DialogTitle>{t("confirmTitle", { name })}</DialogTitle>
                <DialogDescription>{t("confirmBody")}</DialogDescription>
              </DialogHeader>
              {inProgress > 0 ? <Alert tone="warning">{t("inProgress", { n: inProgress })}</Alert> : null}
              {error ? <Alert tone="critical">{error}</Alert> : null}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t("confirmLabel", { name })}</span>
                <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" dir="auto" />
              </label>
              <DialogFooter>
                <Button type="submit" variant="destructive" loading={pending} disabled={!matches}>{t("confirmAction")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
