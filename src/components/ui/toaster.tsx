"use client";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

export function Toaster({ dir }: { dir: "ltr" | "rtl" }) {
  const { resolvedTheme } = useTheme();
  return (
    <Sonner
      theme={(resolvedTheme as "light" | "dark") ?? "light"}
      dir={dir}
      position={dir === "rtl" ? "bottom-left" : "bottom-right"}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-card !border !border-border !bg-surface !text-text !shadow-popover !font-sans !text-sm",
          description: "!text-secondary",
          actionButton: "!bg-accent !text-accent-foreground",
        },
      }}
    />
  );
}
