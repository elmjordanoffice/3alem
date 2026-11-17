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
        primary:
          "btn-lit bg-accent text-accent-foreground hover:bg-accent-hover active:bg-accent-active disabled:bg-surface-sunken disabled:text-tertiary disabled:opacity-100",
        secondary:
          "border border-border-strong bg-surface text-text hover:bg-surface-subtle active:bg-surface-sunken",
        ghost: "text-secondary hover:bg-surface-subtle hover:text-text active:bg-surface-sunken",
        destructive: "bg-critical text-white hover:opacity-90 active:opacity-80 dark:text-[#1c0a0a]",
        link: "h-auto px-0 text-accent-text underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-sm [&_svg]:size-4",
        md: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-12 px-5 text-base [&_svg]:size-5",
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
