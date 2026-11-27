"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Copy, UserPlus, Upload } from "lucide-react";
import { toast } from "sonner";
import { inviteCandidates } from "@/app/actions/assessments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllowanceHint, BillingGateNotice } from "@/components/billing/gate-notice";
import type { BillingBlock } from "@/lib/billing/core";

/** `allowance`: invitations left on the plan this month, when billing is on and the plan has a limit. */
export function InviteDialog({ templateId, allowance }: { templateId: string; allowance?: { remaining: number; allowance: number; trial: boolean } | null }) {
  const t = useTranslations("invite");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"email" | "csv" | "link">("email");
  const [list, setList] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [blocked, setBlocked] = React.useState<BillingBlock | null>(null);
  const [links, setLinks] = React.useState<{ email: string; link: string }[] | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);

  const reset = () => {
    setList("");
    setLinks(null);
    setError(null);
    setBlocked(null);
  };

  const submit = async () => {
    setPending(true);
    setError(null);
    setBlocked(null);
    const res = await inviteCandidates({ templateId, list, send: mode !== "link" });
    setPending(false);
    if (!res.ok) return res.error === "billing" ? setBlocked(res as BillingBlock) : setError(t(`errors.${res.error}`));
    if (mode === "link") setLinks(res.created);
    else {
      toast.success(t("sent", { count: res.created.length }));
      setOpen(false);
      reset();
    }
    if (res.skipped) toast.message(t("skipped", { count: res.skipped }));
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (setOpen(o), o || reset())}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus aria-hidden />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={tc("close")} className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {links ? (
          <div className="flex flex-col gap-3">
            <Alert tone="success">{t("linksReady")}</Alert>
            <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {links.map((l) => (
                <li key={l.email} className="flex items-center gap-2 rounded-control border border-border p-2 text-sm">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-text">{l.email}</span>
                    <span className="block truncate font-mono text-xs text-tertiary" dir="ltr">{l.link}</span>
                  </span>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t("copyFor", { email: l.email })}
                    onClick={async () => {
                      await navigator.clipboard.writeText(l.link);
                      setCopied(l.email);
                    }}
                  >
                    {copied === l.email ? <Check aria-hidden /> : <Copy aria-hidden />}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <Tabs value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
            <TabsList>
              <TabsTrigger value="email">{t("tabs.email")}</TabsTrigger>
              <TabsTrigger value="csv">{t("tabs.csv")}</TabsTrigger>
              <TabsTrigger value="link">{t("tabs.link")}</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="flex flex-col gap-2">
              <label htmlFor="emails" className="text-sm font-medium text-text">{t("emailsLabel")}</label>
              <Textarea id="emails" value={list} onChange={(e) => setList(e.target.value)} placeholder={t("emailsPlaceholder")} className="min-h-36 font-mono text-sm" dir="ltr" />
              <p className="text-xs text-secondary">{t("emailsHint")}</p>
            </TabsContent>
            <TabsContent value="csv" className="flex flex-col gap-3">
              <p className="text-sm text-secondary">{t("csvHint")}</p>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-card border border-dashed border-border-strong p-6 text-sm text-secondary hover:bg-surface-subtle">
                <Upload className="size-4" aria-hidden />
                {t("csvChoose")}
                <input type="file" accept=".csv,text/csv,text/plain" className="sr-only" onChange={async (e) => setList(await (e.target.files?.[0]?.text() ?? Promise.resolve("")))} />
              </label>
              {list ? <Textarea value={list} onChange={(e) => setList(e.target.value)} className="min-h-28 font-mono text-xs" dir="ltr" aria-label={t("csvPreview")} /> : null}
            </TabsContent>
            <TabsContent value="link" className="flex flex-col gap-2">
              <label htmlFor="link-emails" className="text-sm font-medium text-text">{t("linkLabel")}</label>
              <Textarea id="link-emails" value={list} onChange={(e) => setList(e.target.value)} placeholder={t("emailsPlaceholder")} className="min-h-28 font-mono text-sm" dir="ltr" />
              <p className="text-xs text-secondary">{t("linkHint")}</p>
            </TabsContent>
          </Tabs>
        )}
        {error ? <Alert tone="critical">{error}</Alert> : null}
        {blocked ? <BillingGateNotice reason={blocked.reason} remaining={blocked.remaining} canManage={blocked.canManage} /> : null}
        {!links && allowance ? <AllowanceHint allowance={allowance} /> : null}
        <DialogFooter>
          {links ? (
            <Button onClick={() => (setOpen(false), reset())}>{tc("close")}</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>{tc("cancel")}</Button>
              <Button onClick={submit} loading={pending} disabled={!list.trim()}>
                {mode === "link" ? t("createLinks") : t("send")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
