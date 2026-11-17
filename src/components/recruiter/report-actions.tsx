"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Check, Copy, Download, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import { revokeShareLink, shareReport } from "@/app/actions/assessments";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/ui/field";

export function ReportActions({
  sessionId,
  canShare,
  shareLinks,
  sharedWithCandidate,
  reviewPending = false,
}: {
  sessionId: string;
  canShare: boolean;
  /** The candidate asked for a human review that nobody has confirmed yet. */
  reviewPending?: boolean;
  shareLinks: { id: string; audience: string; expiresAt: string; expired: boolean }[];
  sharedWithCandidate: boolean;
}) {
  const t = useTranslations("report.actions");
  const tc = useTranslations("common");
  const router = useRouter();
  const [open, setOpen] = React.useState<"team" | "candidate" | null>(null);
  const [days, setDays] = React.useState<"7" | "14" | "30">("14");
  const [link, setLink] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [pdfPending, setPdfPending] = React.useState(false);

  return (
    <>
      <Button
        variant="secondary"
        loading={pdfPending}
        disabled={reviewPending}
        title={reviewPending ? t("reviewPending") : undefined}
        onClick={async () => {
          setPdfPending(true);
          try {
            const res = await fetch(`/api/reports/${sessionId}/pdf`);
            if (!res.ok) throw new Error();
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `aalim-report-${sessionId.slice(-6)}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
          } catch {
            toast.error(t("pdfError"));
          } finally {
            setPdfPending(false);
          }
        }}
      >
        {!pdfPending ? <Download aria-hidden /> : null}
        {t("pdf")}
      </Button>
      {canShare ? (
        <>
          <Dialog open={open !== null} onOpenChange={(o) => (o ? null : (setOpen(null), setLink(null)))}>
            <DialogTrigger asChild>
              <Button variant="secondary" onClick={() => setOpen("team")} disabled={reviewPending} title={reviewPending ? t("reviewPending") : undefined}>
                <Share2 aria-hidden />
                {t("share")}
              </Button>
            </DialogTrigger>
            <DialogContent closeLabel={tc("close")}>
              <DialogHeader>
                <DialogTitle>{open === "candidate" ? t("candidateTitle") : t("shareTitle")}</DialogTitle>
                <DialogDescription>{open === "candidate" ? t("candidateBody") : t("shareBody")}</DialogDescription>
              </DialogHeader>
              {link ? (
                <div className="flex items-center gap-2 rounded-control border border-border p-2">
                  <code className="min-w-0 flex-1 truncate text-xs" dir="ltr">{link}</code>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label={t("copy")}
                    onClick={async () => {
                      await navigator.clipboard.writeText(link);
                      setCopied(true);
                    }}
                  >
                    {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                  </Button>
                </div>
              ) : (
                <Field label={t("expires")}>
                  {({ id }) => (
                    <Select value={days} onValueChange={(v) => setDays(v as typeof days)}>
                      <SelectTrigger id={id} className="max-w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["7", "14", "30"] as const).map((d) => (
                          <SelectItem key={d} value={d}>
                            {t("days", { n: Number(d) })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </Field>
              )}
              {shareLinks.filter((l) => !l.expired).length && !link ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-secondary">{t("active")}</span>
                  {shareLinks
                    .filter((l) => !l.expired)
                    .map((l) => (
                      <div key={l.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-secondary">{t(`audience.${l.audience}`)} · {t("until", { date: l.expiresAt.slice(0, 10) })}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await revokeShareLink(l.id);
                            toast.success(t("revoked"));
                            router.refresh();
                          }}
                        >
                          {t("revoke")}
                        </Button>
                      </div>
                    ))}
                </div>
              ) : null}
              {open === "candidate" && !link ? <Alert tone="neutral">{t("candidateNote")}</Alert> : null}
              <DialogFooter>
                {link ? (
                  <Button onClick={() => (setOpen(null), setLink(null))}>{tc("close")}</Button>
                ) : (
                  <Button
                    loading={pending}
                    onClick={async () => {
                      setPending(true);
                      const res = await shareReport({ sessionId, days: Number(days) as 7 | 14 | 30, audience: open ?? "team" });
                      setPending(false);
                      if (!res.ok) return toast.error(t("shareError"));
                      if (open === "candidate") {
                        toast.success(t("sentToCandidate"));
                        setOpen(null);
                      } else setLink(res.link);
                      router.refresh();
                    }}
                  >
                    {open === "candidate" ? t("sendToCandidate") : t("createLink")}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" onClick={() => setOpen("candidate")} disabled={reviewPending} title={reviewPending ? t("reviewPending") : undefined}>
            <Send aria-hidden />
            {sharedWithCandidate ? t("resendCandidate") : t("toCandidate")}
          </Button>
        </>
      ) : null}
    </>
  );
}
