"use client";
import { Check, CloudOff, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type SaveState = "saved" | "saving" | "offline" | "error";

/** Quiet autosave status. Offline answers are kept on the device and synced. */
export function AutosaveIndicator({ state, className }: { state: SaveState; className?: string }) {
  const t = useTranslations("components.autosave");
  const Icon = { saved: Check, saving: Loader2, offline: CloudOff, error: AlertCircle }[state];
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs",
        state === "error" ? "text-warning" : "text-tertiary",
        className,
      )}
    >
      <Icon className={cn("size-3.5", state === "saving" && "animate-spin")} strokeWidth={2} aria-hidden />
      {t(state)}
    </span>
  );
}
