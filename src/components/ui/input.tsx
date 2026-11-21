import * as React from "react";
import { cn } from "@/lib/utils";

export const controlBase =
  "w-full rounded-control border border-border-strong bg-surface text-text shadow-[0_1px_2px_rgb(23_24_74/0.04)] placeholder:text-tertiary transition-colors duration-150 hover:border-mark-muted focus-visible:border-accent focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-focus disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:opacity-60 aria-invalid:border-critical aria-invalid:focus-visible:outline-critical";

export function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn(controlBase, "h-11 px-3.5 text-base sm:text-sm", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(controlBase, "min-h-24 px-3 py-2.5 text-base leading-relaxed sm:text-sm", className)}
      dir="auto"
      {...props}
    />
  );
}
