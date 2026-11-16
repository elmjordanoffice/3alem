"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useNumbers } from "@/components/providers";
import { useDraft } from "../hooks";
import type { TaskProps } from "./types";

/** A consequence chain: each decision shapes the next round. */
export function ChainTask({ itemId, content, onChange, onSaveState, disabled }: TaskProps) {
  const t = useTranslations("candidate.tasks.chain");
  const n = useNumbers();
  const rounds = content.task.chain!.rounds;
  const [draft, setDraft] = useDraft(`aalim:draft:${itemId}:MAIN`, { round: 0, choices: [] as { roundId: string; optionId: string; reason: string }[] }, onSaveState);
  const round = rounds[draft.round]!;
  const current = draft.choices.find((c) => c.roundId === round.id);
  const prev = draft.round > 0 ? draft.choices.find((c) => c.roundId === rounds[draft.round - 1]!.id) : null;
  const consequence = prev ? rounds[draft.round - 1]!.consequences.find((c) => c.optionId === prev.optionId)?.text : null;

  React.useEffect(() => {
    onChange(draft.choices.length === rounds.length ? { kind: "chain", choices: draft.choices } : null);
  }, [draft, rounds.length, onChange]);

  const setChoice = (patch: Partial<{ optionId: string; reason: string }>) =>
    setDraft((d) => {
      const others = d.choices.filter((c) => c.roundId !== round.id);
      const existing = d.choices.find((c) => c.roundId === round.id) ?? { roundId: round.id, optionId: "", reason: "" };
      const next = { ...existing, ...patch };
      // Changing an earlier decision clears later rounds, which depended on it.
      const idx = rounds.findIndex((r) => r.id === round.id);
      const kept = others.filter((c) => rounds.findIndex((r) => r.id === c.roundId) < idx);
      return { ...d, choices: next.optionId ? [...kept, next] : kept };
    });

  return (
    <div className="flex flex-col gap-5">
      <ol className="flex gap-1" aria-label={t("rounds")}>
        {rounds.map((r, i) => (
          <li key={r.id} className={cn("h-1 flex-1 rounded-full", i < draft.round ? "bg-accent" : i === draft.round ? "bg-accent/50" : "bg-surface-sunken")}>
            <span className="sr-only">{t("roundOf", { n: n.number(i + 1), total: n.number(rounds.length) })}</span>
          </li>
        ))}
      </ol>
      {consequence ? (
        <div className="rounded-card bg-surface shadow-card-subtle p-4 animate-slide-up">
          <p className="text-[13px] font-medium text-tertiary">{t("whatHappened")}</p>
          <p className="mt-1.5 text-[15px] leading-relaxed text-text" dir="auto">
            {consequence}
          </p>
        </div>
      ) : null}
      <div key={round.id} className="flex flex-col gap-4 animate-fade-in">
        <p className="text-sm font-medium text-secondary">{t("roundOf", { n: n.number(draft.round + 1), total: n.number(rounds.length) })}</p>
        <p className="text-[15px] leading-relaxed text-text" dir="auto">
          {round.situation}
        </p>
        <div role="radiogroup" aria-label={round.situation} className="flex flex-col gap-2">
          {round.options.map((o) => (
            <label key={o.id} className={cn("flex cursor-pointer gap-3 rounded-card border bg-surface p-3.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus", current?.optionId === o.id ? "border-accent ring-1 ring-accent" : "border-border hover:border-border-strong")}>
              <input type="radio" className="sr-only" name={`chain-${round.id}`} checked={current?.optionId === o.id} disabled={disabled} onChange={() => setChoice({ optionId: o.id })} />
              <span aria-hidden className={cn("mt-1 size-3.5 shrink-0 rounded-full border-2", current?.optionId === o.id ? "border-accent bg-accent" : "border-border-strong")} />
              <span className="flex flex-col gap-0.5">
                <span className="text-[15px] font-medium text-text" dir="auto">{o.label}</span>
                {o.detail ? <span className="text-sm text-secondary" dir="auto">{o.detail}</span> : null}
              </span>
            </label>
          ))}
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-text">{t("reason")}</span>
          <Textarea value={current?.reason ?? ""} disabled={disabled || !current} onChange={(e) => setChoice({ reason: e.target.value })} className="min-h-20" />
        </label>
      </div>
      <div className="flex justify-between gap-3">
        <Button variant="ghost" disabled={draft.round === 0} onClick={() => setDraft((d) => ({ ...d, round: d.round - 1 }))}>
          {t("back")}
        </Button>
        {draft.round < rounds.length - 1 ? (
          <Button variant="secondary" disabled={!current?.optionId} onClick={() => setDraft((d) => ({ ...d, round: d.round + 1 }))}>
            {t("next")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
