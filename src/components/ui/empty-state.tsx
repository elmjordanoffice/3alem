import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * An empty state with one clear action: a glowing violet disc over three
 * soft bands (nothing known yet). Spinners (Loader2) keep spinning.
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
          <span className="mb-2 inline-flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_12px_28px_-10px_var(--accent)]">
            <Icon className={cn("size-5", spinning && "animate-spin")} strokeWidth={2} />
          </span>
        ) : (
          <span className="mb-2 size-4 rounded-full bg-accent shadow-[0_8px_20px_-6px_var(--accent)]" />
        )}
        <span className="h-2 w-16 rounded-full bg-accent/25" />
        <span className="h-2 w-24 rounded-full bg-accent/15" />
        <span className="h-2 w-32 rounded-full bg-accent/10" />
      </div>
      <p className="text-lg font-bold tracking-[-0.01em] text-text">{title}</p>
      {description ? <p className="max-w-sm text-sm leading-relaxed text-secondary">{description}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
