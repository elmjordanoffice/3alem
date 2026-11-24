import * as React from "react";
import { cn } from "@/lib/utils";

export function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-6 lg:pt-2", className)} {...props} />;
}

/**
 * Every page opens the same way: a hairline rule with a vermilion tick, an
 * optional eyebrow, the title in Archivo (a little wide) and one line of
 * context. Actions sit at the end of the row.
 */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  eyebrow?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-9", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          {eyebrow ? <p className="eyebrow text-tertiary">{eyebrow}</p> : null}
          <h1 className="text-[1.875rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-text sm:text-[2.25rem]">{title}</h1>
          {description ? <p className="reading text-[15px] leading-relaxed text-secondary">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}
