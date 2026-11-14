import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** An empty state with one clear action. No illustrations. */
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
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-card border border-dashed border-border-strong px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="mb-1 inline-flex size-10 items-center justify-center rounded-full bg-surface-subtle text-secondary">
          <Icon className="size-5" strokeWidth={1.5} aria-hidden />
        </span>
      ) : null}
      <p className="text-base font-medium text-text">{title}</p>
      {description ? <p className="max-w-sm text-sm text-secondary">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
