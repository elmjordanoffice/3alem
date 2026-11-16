import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface PipelineRole {
  id: string;
  title: string;
  status: string;
  durationMinutes?: number;
  counts: { invited: number; inProgress: number; completed: number; awaitingReview: number };
}

export interface PipelineLabels {
  status: (s: string) => string;
  completedOf: (done: string, total: string) => string;
  segment: (k: "completed" | "inProgress" | "notStarted", n: string) => string;
  noCandidates: string;
  minutes?: (n: string) => string;
}

/**
 * Each role as a row with its candidate pipeline: finished, in progress and
 * not started, on the level ramp. Used on Home and the assessments list.
 */
export function RolePipelineList({ roles, labels, n }: { roles: PipelineRole[]; labels: PipelineLabels; n: (v: number) => string }) {
  return (
    <ul className="flex flex-col gap-3">
      {roles.map((r) => {
        const notStarted = Math.max(0, r.counts.invited - r.counts.inProgress - r.counts.completed);
        const total = Math.max(1, r.counts.invited);
        const seg = [
          { k: "completed" as const, v: r.counts.completed, c: "bg-level-4" },
          { k: "inProgress" as const, v: r.counts.inProgress, c: "bg-level-2" },
          { k: "notStarted" as const, v: notStarted, c: "bg-level-empty" },
        ];
        return (
          <li key={r.id}>
            <Link href={r.status === "DRAFT" ? `/app/assessments/${r.id}/setup` : `/app/assessments/${r.id}`} className="block rounded-card bg-surface shadow-card p-4 transition-[box-shadow,background-color,color] hover:shadow-card-hover focus-visible:outline-2 focus-visible:outline-focus sm:p-5">
              <span className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
                  <span className="truncate font-medium text-text">{r.title}</span>
                  <Badge tone={r.status === "PUBLISHED" ? "success" : r.status === "DRAFT" ? "neutral" : "warning"}>{labels.status(r.status)}</Badge>
                  {labels.minutes && r.durationMinutes ? <span className="text-xs text-tertiary">{labels.minutes(n(r.durationMinutes))}</span> : null}
                </span>
                <span className="text-sm text-secondary tabular">{labels.completedOf(n(r.counts.completed), n(r.counts.invited))}</span>
              </span>
              {r.counts.invited ? (
                <>
                  <span className="mt-4 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
                    {seg.filter((s) => s.v).map((s) => <span key={s.k} className={s.c} style={{ width: `${(s.v / total) * 100}%` }} />)}
                  </span>
                  <span className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-secondary">
                    {seg.map((s) => (
                      <span key={s.k} className="flex items-center gap-1.5">
                        <span className={cn("size-2 rounded-full", s.c, s.k === "notStarted" && "ring-1 ring-inset ring-border-strong")} aria-hidden />
                        {labels.segment(s.k, n(s.v))}
                      </span>
                    ))}
                  </span>
                </>
              ) : (
                <span className="mt-2 block text-sm text-tertiary">{labels.noCandidates}</span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
