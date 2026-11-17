"use client";
import type * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { confidenceBand } from "@/lib/levels";
import { Badge } from "@/components/ui/badge";

/**
 * A verbatim quote from the person's own answer that supports a score.
 * Every score in every report links to at least one of these.
 */
export function EvidenceCard({
  quote,
  context,
  skill,
  confidence,
  rationale,
  action,
  className,
}: {
  quote: string;
  /** Where it came from, e.g. "Chapter 2 · Reply to Lina". */
  context: string;
  skill?: string;
  confidence: number;
  rationale?: string;
  /** e.g. "Read the full answer", shown in the caption. */
  action?: React.ReactNode;
  className?: string;
}) {
  const t = useTranslations("components.evidence");
  const band = confidenceBand(confidence);
  return (
    <figure className={cn("flex flex-col gap-3 rounded-card bg-surface shadow-card p-4 sm:p-5", className)}>
      {/* The candidate's own words, highlighted: this is what the score rests on. */}
      <blockquote className="text-[15px] leading-[1.75] text-text" dir="auto">
        <mark className="evidence-mark">{quote}</mark>
      </blockquote>
      {rationale ? <p className="text-sm text-secondary">{rationale}</p> : null}
      <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-tertiary">
        <span>{context}</span>
        {skill ? <span className="text-secondary">{skill}</span> : null}
        {action}
        <Badge tone={band === "high" ? "accent" : "neutral"} className="ms-auto">
          {t(`confidence.${band}`)}
        </Badge>
      </figcaption>
    </figure>
  );
}
