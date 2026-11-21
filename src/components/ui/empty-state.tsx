import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * An empty state with one clear action. Range: the bands of the mark, wide
 * and unresolved (nothing known yet), with the icon where the estimate will
 * land. Spinners (Loader2) keep spinning.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const spinning = Icon?.displayName === "Loader2" || Icon?.displayName === "LoaderCircle";
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3 rounded-card bg-surface px-6 py-14 text-center shadow-card", className)}>
      <div className="mb-3 flex flex-col items-center gap-1.5" aria-hidden>
        {Icon ? (
          <span className="mb-1 inline-flex size-9 items-center justify-center rounded-full bg-text text-background">
            <Icon className={cn("size-[18px]", spinning && "animate-spin")} strokeWidth={1.75} />
          </span>
        ) : (
          <span className="mb-1 size-3 rounded-full bg-saffron" />
        )}
        <span className="h-2 w-16 rounded-full bg-surface-sunken" />
        <span className="h-2 w-24 rounded-full bg-surface-sunken" />
        <span className="h-2 w-32 rounded-full bg-surface-sunken" />
      </div>
      <p className="font-display text-lg font-bold text-text [font-stretch:112%]">{title}</p>
      {description ? <p className="max-w-sm text-sm leading-relaxed text-secondary">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
