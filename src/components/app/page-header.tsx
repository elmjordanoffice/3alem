import * as React from "react";
import { cn } from "@/lib/utils";

export function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-12", className)} {...props} />;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="flex min-w-0 flex-col gap-2">
        <h1 className="text-[1.75rem] font-semibold leading-tight text-text sm:text-[2rem]">{title}</h1>
        {description ? <p className="reading text-[15px] leading-relaxed text-secondary">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
