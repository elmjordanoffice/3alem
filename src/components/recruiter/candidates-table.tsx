"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FitPill } from "@/components/report/fit";
import { ArrowDownUp, Columns3, Link2, MoreHorizontal, ShieldAlert, Users } from "lucide-react";
import { toast } from "sonner";
import type { CandidateRow } from "@/lib/hire/recruiter";
import { renewInvitationLink, revokeInvitation } from "@/app/actions/assessments";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Person } from "@/components/ui/avatar";
import { Tooltip, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/menu";
import { SegmentedList, SegmentedTrigger, Tabs } from "@/components/ui/tabs";
import { useNumbers } from "@/components/providers";

const FIT_ORDER = { STRONG: 4, GOOD: 3, PARTIAL: 2, WEAK: 1 } as const;
const STATUS_TONE: Record<CandidateRow["status"], "neutral" | "accent" | "success" | "warning" | "critical" | "info"> = {
  invited: "neutral",
  opened: "neutral",
  in_progress: "accent",
  paused: "info",
  completed: "info",
  report_ready: "success",
  expired: "warning",
  revoked: "critical",
};

type Sort = "fit" | "recent" | "name";

const DECISION_TONE = { ADVANCE: "accent", HIRE: "success", HOLD: "neutral", DECLINE: "warning" } as const;

export function CandidatesTable({ templateId, rows, canInvite }: { templateId: string; rows: CandidateRow[]; canInvite: boolean }) {
  const t = useTranslations("role");
  const td = useTranslations("report.decision");
  const n = useNumbers();
  const router = useRouter();
  const [filter, setFilter] = React.useState<"all" | "ready" | "active">("all");
  const [sort, setSort] = React.useState<Sort>("fit");
  const [selected, setSelected] = React.useState<string[]>([]);

  const visible = rows
    .filter((r) => (filter === "ready" ? r.status === "report_ready" : filter === "active" ? ["invited", "opened", "in_progress", "paused"].includes(r.status) : true))
    .sort((a, b) =>
      sort === "fit" ? (FIT_ORDER[b.fit ?? "WEAK"] ?? 0) * (b.fit ? 1 : 0) - (FIT_ORDER[a.fit ?? "WEAK"] ?? 0) * (a.fit ? 1 : 0) || (b.fitConfidence ?? 0) - (a.fitConfidence ?? 0) : sort === "recent" ? (b.completedAt ?? b.invitedAt).localeCompare(a.completedAt ?? a.invitedAt) : a.name.localeCompare(b.name),
    );

  if (rows.length === 0) {
    return <EmptyState icon={Users} title={t("emptyTitle")} description={canInvite ? t("emptyBody") : t("emptyBodyDraft")} />;
  }

  const toggle = (sessionId: string) => setSelected((s) => (s.includes(sessionId) ? s.filter((x) => x !== sessionId) : s.length >= 4 ? s : [...s, sessionId]));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SegmentedList aria-label={t("filter")}>
            <SegmentedTrigger value="all">{t("filters.all", { n: n.number(rows.length) })}</SegmentedTrigger>
            <SegmentedTrigger value="ready">{t("filters.ready", { n: n.number(rows.filter((r) => r.status === "report_ready").length) })}</SegmentedTrigger>
            <SegmentedTrigger value="active">{t("filters.active")}</SegmentedTrigger>
          </SegmentedList>
        </Tabs>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <ArrowDownUp aria-hidden />
                {t(`sort.${sort}`)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["fit", "recent", "name"] as Sort[]).map((s) => (
                <DropdownMenuItem key={s} onSelect={() => setSort(s)}>
                  {t(`sort.${s}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="secondary" disabled={selected.length < 2} asChild={selected.length >= 2}>
            {selected.length >= 2 ? (
              <Link href={`/app/assessments/${templateId}/compare?ids=${selected.join(",")}`}>
                <Columns3 aria-hidden />
                {t("compare", { n: n.number(selected.length) })}
              </Link>
            ) : (
              <>
                <Columns3 aria-hidden />
                {t("compareHint")}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-card bg-surface shadow-card">
        <table className="w-full min-w-[760px] text-sm">
          <caption className="sr-only">{t("candidates")}</caption>
          <thead className="bg-surface-subtle text-xs text-secondary">
            <tr>
              <th scope="col" className="w-10 px-3 py-2.5"><span className="sr-only">{t("select")}</span></th>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">{t("col.candidate")}</th>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">{t("col.status")}</th>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">{t("col.fit")}</th>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">{t("col.strengths")}</th>
              <th scope="col" className="px-3 py-2.5 text-start font-medium">{t("col.context")}</th>
              <th scope="col" className="w-12 px-3 py-2.5"><span className="sr-only">{t("actions")}</span></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.invitationId} className="border-t border-border align-top hover:bg-surface-subtle/50">
                <td className="px-3 py-3">
                  {r.status === "report_ready" && r.sessionId ? (
                    <Checkbox checked={selected.includes(r.sessionId)} onCheckedChange={() => toggle(r.sessionId!)} aria-label={t("selectFor", { name: r.name })} />
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  {r.status === "report_ready" && r.sessionId ? (
                    <Link href={`/app/reports/${r.sessionId}`} className="group inline-flex rounded-control focus-visible:outline-2 focus-visible:outline-focus">
                      <Person name={r.name} role={r.email} />
                    </Link>
                  ) : (
                    <Person name={r.name} role={r.email} />
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className="flex flex-col items-start gap-1">
                    <Badge tone={STATUS_TONE[r.status]}>{t(`status.${r.status}`)}</Badge>
                    {r.decision ? <Badge tone={DECISION_TONE[r.decision]}>{td(`outcome.${r.decision}`)}</Badge> : null}
                    {r.scorecards ? <span className="text-xs text-tertiary">{t("scorecards", { n: r.scorecards })}</span> : null}
                  </span>
                </td>
                <td className="px-3 py-3">
                  {r.fit ? (
                    <span className="flex flex-col items-start gap-1">
                      <FitPill fit={r.fit} label={t(`fit.${r.fit}`)} />
                      <span className="text-xs text-tertiary">{t(`confidence.${(r.fitConfidence ?? 0) >= 0.75 ? "high" : (r.fitConfidence ?? 0) >= 0.5 ? "moderate" : "low"}`)}</span>
                    </span>
                  ) : (
                    <span className="text-tertiary">—</span>
                  )}
                </td>
                <td className="max-w-64 px-3 py-3 text-secondary">{r.topStrengths.length ? <ul className="flex flex-col gap-0.5">{r.topStrengths.map((s) => <li key={s}>{s}</li>)}</ul> : <span className="text-tertiary">—</span>}</td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-2 text-xs text-secondary">
                    {r.minutes !== null ? t("minutes", { n: n.number(r.minutes) }) : null}
                    {r.flags > 0 ? (
                      <Tooltip content={t("integrityTip", { n: r.flags })}>
                        <span className="inline-flex items-center gap-1 text-warning">
                          <ShieldAlert className="size-3.5" aria-hidden />
                          <span className="tabular">{n.number(r.flags)}</span>
                          <span className="sr-only">{t("integrityTip", { n: r.flags })}</span>
                        </span>
                      </Tooltip>
                    ) : null}
                  </span>
                </td>
                <td className="px-3 py-3 text-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label={t("actionsFor", { name: r.name })}>
                        <MoreHorizontal aria-hidden />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {r.sessionId && r.status === "report_ready" ? (
                        <DropdownMenuItem onSelect={() => router.push(`/app/reports/${r.sessionId}`)}>{t("viewReport")}</DropdownMenuItem>
                      ) : null}
                      {canInvite && !r.sessionId && r.status !== "revoked" ? (
                        <>
                          <DropdownMenuItem
                            onSelect={async () => {
                              const res = await renewInvitationLink(r.invitationId, false);
                              if (res.ok) {
                                await navigator.clipboard.writeText(res.link).catch(() => undefined);
                                toast.success(t("linkCopied"));
                              }
                            }}
                          >
                            <Link2 aria-hidden />
                            {t("copyNewLink")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={async () => {
                              const res = await renewInvitationLink(r.invitationId, true);
                              if (res.ok) toast.success(t("resent"));
                            }}
                          >
                            {t("resend")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            destructive
                            onSelect={async () => {
                              const res = await revokeInvitation(r.invitationId);
                              if (res.ok) toast.success(t("revoked"));
                            }}
                          >
                            {t("revoke")}
                          </DropdownMenuItem>
                        </>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-tertiary">{t("decisionNote")}</p>
    </div>
  );
}
