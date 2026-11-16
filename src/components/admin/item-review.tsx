"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { reviewBankItem } from "@/app/actions/admin";
import type { BankItemStats } from "@/lib/itembank/stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import { useNumbers } from "@/components/providers";

export function ItemReviewTable({ items }: { items: BankItemStats[] }) {
  const t = useTranslations("itemReview");
  const tc = useTranslations("common");
  const n = useNumbers();
  const router = useRouter();
  const [retiring, setRetiring] = React.useState<BankItemStats | null>(null);
  const [note, setNote] = React.useState("");
  const fmt = (x: number | null, d = 2) => (x === null ? "—" : n.number(x, { minimumFractionDigits: d, maximumFractionDigits: d }));

  return (
    <>
      <div className="overflow-x-auto rounded-card bg-surface shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-subtle text-xs text-secondary">
            <tr>
              <th scope="col" className="px-4 py-2.5 text-start font-medium">{t("item")}</th>
              <th scope="col" className="px-4 py-2.5 text-start font-medium">{t("measures")}</th>
              <th scope="col" className="px-4 py-2.5 text-end font-medium">{t("uses")}</th>
              <th scope="col" className="px-4 py-2.5 text-end font-medium">{t("mean")}</th>
              <th scope="col" className="px-4 py-2.5 text-end font-medium">{t("spread")}</th>
              <th scope="col" className="px-4 py-2.5 text-end font-medium">{t("tieBreaks")}</th>
              <th scope="col" className="px-4 py-2.5 text-start font-medium">{t("flags")}</th>
              <th scope="col" className="px-4 py-2.5"><span className="sr-only">{t("actions")}</span></th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className={s.status === "retired" ? "border-t border-border bg-surface-subtle/60" : "border-t border-border"}>
                <td className="px-4 py-2.5">
                  <code className="font-mono text-xs text-text" dir="ltr">{s.id}</code>
                  <span className="mt-0.5 block text-xs text-tertiary">{t(`types.${s.type}` as "types.TRADE_OFF_DILEMMA")} · {t("difficulty", { d: s.difficulty })}</span>
                  {s.note ? <span className="mt-0.5 block text-xs text-secondary">{s.note}</span> : null}
                </td>
                <td className="max-w-56 px-4 py-2.5"><span className="line-clamp-2 font-mono text-[11px] text-secondary" dir="ltr">{s.targets.join(", ")}</span></td>
                <td className="px-4 py-2.5 text-end tabular">{n.number(s.uses)}</td>
                <td className="px-4 py-2.5 text-end tabular">{fmt(s.meanLevel, 1)}</td>
                <td className="px-4 py-2.5 text-end tabular">{fmt(s.sdLevel)}</td>
                <td className="px-4 py-2.5 text-end tabular">{s.tieBreakRate === null ? "—" : `${n.number(Math.round(s.tieBreakRate * 100))}%`}</td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {s.status === "retired" ? <Badge tone="neutral">{t("retired")}</Badge> : null}
                    {s.flags.map((f) => <Badge key={f} tone="warning">{t(`flag.${f}`)}</Badge>)}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-end">
                  {s.status === "retired" ? (
                    <Button size="sm" variant="ghost" onClick={async () => { await reviewBankItem({ itemKey: s.id, status: "active" }); toast.success(t("restored")); router.refresh(); }}>{t("restore")}</Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => { setRetiring(s); setNote(""); }}>{t("retire")}</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={!!retiring} onOpenChange={(o) => !o && setRetiring(null)}>
        <DialogContent closeLabel={tc("close")}>
          <DialogHeader>
            <DialogTitle>{t("retireTitle", { id: retiring?.id ?? "" })}</DialogTitle>
            <DialogDescription>{t("retireBody")}</DialogDescription>
          </DialogHeader>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">{t("note")}</span>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("notePlaceholder")} />
          </label>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRetiring(null)}>{tc("cancel")}</Button>
            <Button variant="destructive" onClick={async () => { if (!retiring) return; await reviewBankItem({ itemKey: retiring.id, status: "retired", note }); setRetiring(null); toast.success(t("retiredToast")); router.refresh(); }}>{t("retire")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
