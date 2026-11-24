"use client";
import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("flex w-fit max-w-full items-center gap-1 overflow-x-auto rounded-full bg-surface p-1 shadow-card [scrollbar-width:none]", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium text-secondary transition-colors duration-150 hover:bg-surface-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus data-[state=active]:bg-accent data-[state=active]:font-semibold data-[state=active]:text-accent-foreground data-[state=active]:shadow-[0_6px_16px_-6px_var(--accent)] [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("pt-4 focus-visible:outline-none", className)}
      {...props}
    />
  );
}

/** Segmented control: a compact tabs variant for switching views. */
export function SegmentedList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex items-center gap-0.5 rounded-full bg-surface p-1 shadow-card", className)}
      {...props}
    />
  );
}

export function SegmentedTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium text-secondary transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:outline-focus data-[state=active]:bg-accent data-[state=active]:text-accent-foreground [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}
