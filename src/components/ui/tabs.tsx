"use client";
import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("flex items-center gap-1 overflow-x-auto border-b border-border", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative -mb-px inline-flex h-10 shrink-0 items-center gap-2 border-b-2 border-transparent px-3 text-sm font-medium text-secondary transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus data-[state=active]:border-accent data-[state=active]:text-text [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("pt-4 focus-visible:outline-none data-[state=active]:animate-fade-in", className)}
      {...props}
    />
  );
}

/** Segmented control: a compact tabs variant for switching views. */
export function SegmentedList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex items-center gap-0.5 rounded-control bg-surface-sunken p-0.5", className)}
      {...props}
    />
  );
}

export function SegmentedTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-[6px] px-3 text-sm font-medium text-secondary transition-colors duration-150 hover:text-text focus-visible:outline-2 focus-visible:outline-focus data-[state=active]:bg-surface data-[state=active]:text-text data-[state=active]:shadow-[0_1px_2px_rgb(0_0_0/0.06)] [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}
