"use client";
import * as React from "react";
import { Slider } from "radix-ui";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useNumbers } from "@/components/providers";

export interface AllocationRow {
  id: string;
  label: string;
  detail?: string;
}

interface AllocationProps {
  rows: AllocationRow[];
  value: Record<string, number>;
  onChange: (value: Record<string, number>) => void;
  /** Total points to split. Default 100. */
  total?: number;
  label: string;
  disabled?: boolean;
}

/**
 * Split a fixed budget across options. Each row has a slider and a number
 * input; a row can never take more than what is left, so the total is always
 * valid and the person never sees an error for over-allocating.
 */
export function Allocation({ rows, value, onChange, total = 100, label, disabled }: AllocationProps) {
  const t = useTranslations("components.allocation");
  const n = useNumbers();
  const used = rows.reduce((sum, r) => sum + (value[r.id] ?? 0), 0);
  const remaining = total - used;

  const set = (id: string, raw: number) => {
    const others = used - (value[id] ?? 0);
    const next = Math.max(0, Math.min(Math.round(Number.isFinite(raw) ? raw : 0), total - others));
    onChange({ ...value, [id]: next });
  };

  return (
    <fieldset className="flex flex-col gap-4" disabled={disabled}>
      <legend className="sr-only">{label}</legend>
      <div className="flex items-center justify-between rounded-control bg-surface-subtle px-3 py-2 text-sm">
        <span className="text-secondary">{t("total", { total: n.number(total) })}</span>
        <span
          className={cn("font-medium tabular", remaining === 0 ? "text-text" : "text-accent-text")}
          aria-live="polite"
        >
          {remaining === 0 ? t("allAllocated") : t("remaining", { count: remaining, formatted: n.number(remaining) })}
        </span>
      </div>
      {rows.map((row) => {
        const v = value[row.id] ?? 0;
        const inputId = `alloc-${row.id}`;
        return (
          <div key={row.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2">
            <label htmlFor={inputId} className="flex min-w-0 flex-col">
              <span className="text-sm font-medium text-text">{row.label}</span>
              {row.detail ? <span className="text-xs text-secondary">{row.detail}</span> : null}
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id={inputId}
                type="number"
                inputMode="numeric"
                min={0}
                max={total}
                value={v}
                onChange={(e) => set(row.id, Number(e.target.value))}
                className="h-9 w-16 rounded-control border border-border-strong bg-surface px-2 text-end text-sm tabular focus-visible:border-accent focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-focus"
              />
              <span className="text-xs text-tertiary">{t("points")}</span>
            </div>
            <Slider.Root
              className="relative col-span-2 flex h-5 touch-none select-none items-center"
              value={[v]}
              max={total}
              step={1}
              onValueChange={([next]) => set(row.id, next ?? 0)}
            >
              <Slider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-surface-sunken">
                <Slider.Range className="absolute h-full bg-accent" />
              </Slider.Track>
              <Slider.Thumb aria-label={row.label} className="block size-4 rounded-full border-2 border-accent bg-surface shadow-sm transition-transform duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus" />
            </Slider.Root>
          </div>
        );
      })}
    </fieldset>
  );
}
