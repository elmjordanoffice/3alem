"use client";
import * as React from "react";
import { Play } from "lucide-react";
import { startPracticeAction } from "@/app/actions/grow";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Starts a practice scenario (server action that redirects to it). */
export function PracticeLauncher({ skillKey, trackKey, trackIndex, twistOf, retryOf, label, variant, size, className }: { skillKey?: string; trackKey?: string; trackIndex?: number; twistOf?: string; retryOf?: string; label: string; variant?: ButtonProps["variant"]; size?: ButtonProps["size"]; className?: string }) {
  const [pending, start] = React.useTransition();
  return (
    <Button variant={variant} size={size} className={className} loading={pending} onClick={() => start(() => startPracticeAction({ skillKey, trackKey, trackIndex, twistOf, retryOf }))}>
      {!pending ? <Play aria-hidden /> : null}
      {label}
    </Button>
  );
}
