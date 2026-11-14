import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva("flex gap-3 rounded-card border p-4 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0", {
  variants: {
    tone: {
      info: "border-info/25 bg-info-subtle text-text [&>svg]:text-info",
      success: "border-success/25 bg-success-subtle text-text [&>svg]:text-success",
      warning: "border-warning/25 bg-warning-subtle text-text [&>svg]:text-warning",
      critical: "border-critical/25 bg-critical-subtle text-text [&>svg]:text-critical",
      neutral: "border-border bg-surface-subtle text-text [&>svg]:text-secondary",
    },
  },
  defaultVariants: { tone: "info" },
});

const ICONS = { info: Info, success: CheckCircle2, warning: AlertTriangle, critical: XCircle, neutral: Info };

export function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: VariantProps<typeof alertVariants> & {
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const Icon = ICONS[tone ?? "info"];
  return (
    <div role={tone === "critical" ? "alert" : "status"} className={cn(alertVariants({ tone }), className)}>
      <Icon aria-hidden strokeWidth={1.75} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {title ? <p className="font-medium">{title}</p> : null}
        {children ? <div className="text-secondary">{children}</div> : null}
      </div>
      {action ? <div className="shrink-0 self-center">{action}</div> : null}
    </div>
  );
}
