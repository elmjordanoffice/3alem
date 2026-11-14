"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useDraft } from "../hooks";
import { MIN_REASON, type TaskProps } from "./types";

export function ChoiceTask({ itemId, content, onChange, onSaveState, disabled }: TaskProps) {
  const t = useTranslations("candidate.tasks");
  const options = content.task.options ?? [];
  const [draft, setDraft] = useDraft(`aalim:draft:${itemId}:MAIN`, { optionId: "", justification: "" }, onSaveState);

  React.useEffect(() => {
    const ok = draft.optionId && (!content.task.requireJustification || draft.justification.trim().length >= MIN_REASON);
    onChange(ok ? { kind: "choice", optionId: draft.optionId, justification: draft.justification } : null);
  }, [draft, content.task.requireJustification, onChange]);

  return (
    <div className="flex flex-col gap-5">
      <div role="radiogroup" aria-label={content.task.prompt} className="flex flex-col gap-2">
        {options.map((o, i) => {
          const checked = draft.optionId === o.id;
          return (
            <label
              key={o.id}
              className={cn(
                "flex cursor-pointer gap-3 rounded-card border bg-surface p-4 transition-colors duration-150 hover:border-border-strong has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                checked ? "border-accent ring-1 ring-accent" : "border-border",
                disabled && "pointer-events-none opacity-60",
              )}
            >
              <input
                type="radio"
                name={`choice-${itemId}`}
                value={o.id}
                checked={checked}
                disabled={disabled}
                onChange={() => setDraft((d) => ({ ...d, optionId: o.id }))}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  checked ? "border-accent bg-accent text-accent-foreground" : "border-border-strong text-secondary",
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-[15px] font-medium leading-snug text-text" dir="auto">
                  {o.label}
                </span>
                {o.detail ? (
                  <span className="text-sm text-secondary" dir="auto">
                    {o.detail}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
      {content.task.requireJustification ? (
        <Field label={t("justificationLabel")} hint={t("justificationHint")}>
          {({ id, describedBy }) => (
            <Textarea
              id={id}
              aria-describedby={describedBy}
              value={draft.justification}
              disabled={disabled}
              onChange={(e) => setDraft((d) => ({ ...d, justification: e.target.value }))}
              className="min-h-32"
            />
          )}
        </Field>
      ) : null}
    </div>
  );
}
