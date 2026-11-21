import type { ReportContent } from "./report-types";
import { TRACK_FOR_DOMAIN } from "@/lib/grow/track-for";
import { DOMAIN_HABITS, type Habit } from "@/lib/ai/offline/signals";

/**
 * If you hire them: the first 90 days, from the same evidence. Where their
 * strengths can carry work early, and where to support them (the gaps the
 * role cares about), each with the Grow track that builds it and one habit to
 * look for at the check-in. Suggestions for a manager, not a verdict.
 */
export interface FirstDays {
  useEarly: { key: string; name: string }[];
  support: { key: string; name: string; track: string | null; habit: Habit | null }[];
}

export function firstDays(content: ReportContent): FirstDays | null {
  if (content.kind !== "HIRE") return null;
  const useEarly = [...content.domains]
    .filter((d) => d.estimate >= 3.5 && d.confidence >= 0.4)
    .sort((a, b) => Number(b.importance === "MUST_HAVE") - Number(a.importance === "MUST_HAVE") || b.estimate - a.estimate)
    .slice(0, 2)
    .map((d) => ({ key: d.key, name: d.name }));
  const gaps = content.fit.gaps.length
    ? content.fit.gaps.map((g) => ({ key: g.key, name: g.name }))
    : [...content.domains]
        .filter((d) => (d.importance === "MUST_HAVE" || d.importance === "NICE_TO_HAVE") && d.estimate < 3.25)
        .sort((a, b) => a.estimate - b.estimate)
        .map((d) => ({ key: d.key, name: d.name }));
  const support = gaps.slice(0, 2).map((g) => ({ ...g, track: TRACK_FOR_DOMAIN[g.key] ?? null, habit: DOMAIN_HABITS[g.key]?.[0] ?? null }));
  if (!useEarly.length && !support.length) return null;
  return { useEarly, support };
}
