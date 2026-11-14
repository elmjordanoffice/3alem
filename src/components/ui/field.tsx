"use client";
import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return <LabelPrimitive.Root className={cn("text-sm font-medium text-text", className)} {...props} />;
}

interface FieldProps {
  label: React.ReactNode;
  /** Help text under the label. */
  hint?: React.ReactNode;
  /** Error text: says what to do next. */
  error?: React.ReactNode;
  optionalLabel?: React.ReactNode;
  className?: string;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => React.ReactNode;
}

/** Label + control + hint + error, wired up for screen readers. */
export function Field({ label, hint, error, optionalLabel, className, children }: FieldProps) {
  const id = React.useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {optionalLabel ? <span className="text-xs text-tertiary">{optionalLabel}</span> : null}
      </div>
      {hint ? (
        <p id={hintId} className="-mt-0.5 text-sm text-secondary">
          {hint}
        </p>
      ) : null}
      {children({ id, describedBy, invalid: Boolean(error) })}
      {error ? (
        <p id={errorId} className="text-sm text-critical" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
