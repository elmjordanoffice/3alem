"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { RankingList } from "@/components/assessment/ranking-list";
import { Allocation } from "@/components/assessment/allocation";
import { Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useDraft } from "../hooks";
import { MIN_REASON, type TaskProps } from "./types";

export function RankingTask({ itemId, content, onChange, onSaveState, disabled }: TaskProps) {
  const t = useTranslations("candidate.tasks");
  const items = content.task.rankItems ?? [];
  const [draft, setDraft] = useDraft(`aalim:draft:${itemId}:MAIN`, { order: items.map((i) => i.id), reasoning: "" }, onSaveState);
  const ordered = draft.order.map((id) => items.find((i) => i.id === id)).filter((x): x is (typeof items)[number] => Boolean(x));

  React.useEffect(() => {
    onChange(draft.reasoning.trim().length >= MIN_REASON ? { kind: "ranking", order: draft.order, reasoning: draft.reasoning } : null);
  }, [draft, onChange]);

  return (
    <div className="flex flex-col gap-5">
      <RankingList items={ordered} onChange={(next) => setDraft((d) => ({ ...d, order: next.map((n) => n.id) }))} label={content.task.prompt} disabled={disabled} />
      <Field label={t("rankingReasonLabel")} hint={t("rankingReasonHint")}>
        {({ id, describedBy }) => (
          <Textarea id={id} aria-describedby={describedBy} value={draft.reasoning} disabled={disabled} onChange={(e) => setDraft((d) => ({ ...d, reasoning: e.target.value }))} />
        )}
      </Field>
    </div>
  );
}

export function AllocationTask({ itemId, content, onChange, onSaveState, disabled }: TaskProps) {
  const t = useTranslations("candidate.tasks");
  const alloc = content.task.allocation!;
  const [draft, setDraft] = useDraft(`aalim:draft:${itemId}:MAIN`, { values: {} as Record<string, number>, reasoning: "" }, onSaveState);
  const used = alloc.rows.reduce((s, r) => s + (draft.values[r.id] ?? 0), 0);

  React.useEffect(() => {
    const ok = used === alloc.total && draft.reasoning.trim().length >= MIN_REASON;
    onChange(ok ? { kind: "allocation", values: Object.fromEntries(alloc.rows.map((r) => [r.id, draft.values[r.id] ?? 0])), reasoning: draft.reasoning } : null);
  }, [draft, used, alloc, onChange]);

  return (
    <div className="flex flex-col gap-5">
      <Allocation rows={alloc.rows} total={alloc.total} value={draft.values} onChange={(values) => setDraft((d) => ({ ...d, values }))} label={content.task.prompt} disabled={disabled} />
      <Field label={t("allocationReasonLabel")} hint={t("allocationReasonHint")}>
        {({ id, describedBy }) => (
          <Textarea id={id} aria-describedby={describedBy} value={draft.reasoning} disabled={disabled} onChange={(e) => setDraft((d) => ({ ...d, reasoning: e.target.value }))} />
        )}
      </Field>
    </div>
  );
}
