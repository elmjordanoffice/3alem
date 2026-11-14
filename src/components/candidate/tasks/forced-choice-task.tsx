"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useNumbers } from "@/components/providers";
import { useDraft } from "../hooks";
import type { TaskProps } from "./types";

/** Pairs of equally attractive statements: "Which is more like you?" Hard to fake. */
export function ForcedChoiceTask({ itemId, content, onChange, onSaveState, disabled }: TaskProps) {
  const t = useTranslations("candidate.tasks.forced");
  const n = useNumbers();
  const pairs = content.task.forcedChoice!.pairs;
  const [picks, setPicks] = useDraft<Record<string, "a" | "b">>(`aalim:draft:${itemId}:MAIN`, {}, onSaveState);
  React.useEffect(() => {
    onChange(pairs.every((p) => picks[p.id]) ? { kind: "forced_choice", picks } : null);
  }, [picks, pairs, onChange]);
  return (
    <ol className="flex flex-col gap-4">
      {pairs.map((p, i) => (
        <li key={p.id}>
          <fieldset disabled={disabled}>
            <legend className="mb-2 text-sm text-secondary">{t("pair", { n: n.number(i + 1), total: n.number(pairs.length) })}</legend>
            <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
              {(["a", "b"] as const).map((side) => (
                <label key={side} className={cn("flex min-h-16 cursor-pointer items-center rounded-card border bg-surface p-3.5 text-[15px] leading-snug has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus", picks[p.id] === side ? "border-accent ring-1 ring-accent" : "border-border hover:border-border-strong")}>
                  <input type="radio" className="sr-only" name={`fc-${p.id}`} checked={picks[p.id] === side} onChange={() => setPicks((x) => ({ ...x, [p.id]: side }))} />
                  <span dir="auto">{p[side].text}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </li>
      ))}
    </ol>
  );
}
