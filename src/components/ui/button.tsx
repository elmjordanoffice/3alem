import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium transition-[color,background-color,border-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Night: violet, lit from above, with a soft glow. */
        primary:
          "bg-accent text-accent-foreground font-semibold shadow-[0_12px_26px_-12px_rgb(108_92_231/0.8),inset_0_1px_0_rgb(255_255_255/0.18)] hover:bg-accent-hover active:scale-[0.98] active:bg-accent-active disabled:bg-surface-sunken disabled:text-tertiary disabled:opacity-100 disabled:shadow-none",
        /** The signal: one per screen at most (the hero call to action). Coral, glowing. */
        signal: "bg-[var(--signal)] text-[var(--signal-foreground)] hover:bg-[var(--signal-hover)] active:scale-[0.98] font-semibold shadow-[0_12px_26px_-12px_rgb(255_92_124/0.8)]",
        secondary:
          "bg-surface-subtle text-text shadow-[inset_0_0_0_1px_var(--border-strong)] hover:bg-surface hover:shadow-[inset_0_0_0_1px_var(--accent-text)] active:bg-surface-sunken",
        ghost: "text-secondary hover:bg-surface-subtle hover:text-text active:bg-surface-sunken",
        destructive: "bg-critical text-white hover:opacity-90 active:opacity-80 dark:text-[#1c0a0a]",
        link: "h-auto px-0 text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5 text-sm [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-4",
        lg: "h-12 px-6 text-[15px] [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-5",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows a spinner, keeps the width and disables the button. */
  loading?: boolean;
}

export function Button({ className, variant, size, asChild, loading, disabled, children, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
          {children}
        </>
      )}
    </Comp>
  );
}

export { buttonVariants };
