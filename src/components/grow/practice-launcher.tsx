"use client";
import * as React from "react";
import { Play } from "lucide-react";
import { startPracticeAction } from "@/app/actions/grow";
import { Button, type ButtonProps } from "@/components/ui/button";

/** Starts a practice scenario (server action that redirects to it). */
export function PracticeLauncher({ skillKey, trackKey, trackIndex, twistOf, label, variant }: { skillKey?: string; trackKey?: string; trackIndex?: number; twistOf?: string; label: string; variant?: ButtonProps["variant"] }) {
  const [pending, start] = React.useTransition();
  return (
    <Button variant={variant} loading={pending} onClick={() => start(() => startPracticeAction({ skillKey, trackKey, trackIndex, twistOf }))}>
      {!pending ? <Play aria-hidden /> : null}
      {label}
    </Button>
  );
}
