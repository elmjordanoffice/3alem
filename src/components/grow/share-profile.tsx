"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, ShieldCheck } from "lucide-react";
import { shareProfileAction } from "@/app/actions/grow";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ShareProfile() {
  const t = useTranslations("grow.share");
  const tc = useTranslations("common");
  const [link, setLink] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  return (
    <Dialog onOpenChange={(o) => !o && setLink(null)}>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <ShieldCheck aria-hidden />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={tc("close")}>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("body")}</DialogDescription>
        </DialogHeader>
        {link ? (
          <div className="flex items-center gap-2 rounded-control border border-border p-2">
            <code className="min-w-0 flex-1 truncate text-xs" dir="ltr">{link}</code>
            <Button size="icon-sm" variant="ghost" aria-label={t("copy")} onClick={async () => (await navigator.clipboard.writeText(link), setCopied(true))}>
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            </Button>
          </div>
        ) : null}
        <DialogFooter>
          {!link ? (
            <Button
              loading={pending}
              onClick={async () => {
                setPending(true);
                const r = await shareProfileAction(14);
                setPending(false);
                if (r.ok) setLink(r.link);
              }}
            >
              {t("create")}
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
