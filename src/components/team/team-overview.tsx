"use client";
import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { AlertTriangle, ArrowRightLeft, Crown, Lock, Route, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import type { TeamAnalytics } from "@/lib/team";
import { TRACKS } from "@/lib/grow/tracks";
import { assignTrackAction } from "@/app/actions/team";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Person } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { SkillHeatmap } from "@/components/report/charts";
import { LevelLegend } from "@/components/report/level";
import { useLocaleSettings, useNumbers } from "@/components/providers";
import { cn } from "@/lib/utils";

const STATUS_TONE: Record<string, "neutral" | "accent" | "success" | "warning" | "critical"> = { INVITED: "neutral", CONSENTED: "accent", DECLINED: "warning", ASSESSED: "success", REMOVED: "critical" };

export function TeamOverview({ a, canManage }: { a: TeamAnalytics; canManage: boolean }) {
  const t = useTranslations("team");
  const td = useTranslations("domainsShort");
  const n = useNumbers();
  const { locale } = useLocaleSettings();
  const [assigning, setAssigning] = React.useState<string | null>(null);
  const columns = a.domains.map((d) => ({ key: d.key, label: d.name, short: td(d.key) }));

  return (
    <div className="flex flex-col gap-8">
      <TeamBrief a={a} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="size-4 text-accent-text" aria-hidden />{t("heatmap")}</CardTitle>
          <CardDescription>{a.named ? t("heatmapNamed") : t("heatmapAnon", { min: 5, n: a.assessedCount })}</CardDescription>
        </CardHeader>
        <CardContent>
          {a.assessedCount === 0 ? (
            <EmptyState icon={Users} title={t("noneAssessedTitle")} description={t("noneAssessedBody")} />
          ) : a.named ? (
            <>
              <SkillHeatmap rows={a.heatmap} columns={columns} label={t("heatmap")} />
              <LevelLegend className="mt-4 border-t border-border pt-3" />
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-secondary"><Lock className="size-4" aria-hidden />{t("anonNote")}</div>
              <ul className="flex flex-col divide-y divide-border">
                {a.aggregates.map((g) => (
                  <li key={g.key} className="grid grid-cols-[minmax(8rem,14rem)_1fr_auto] items-center gap-4 py-2.5 text-sm">
                    <span className="text-text">{g.name}</span>
                    <span className="relative h-2 rounded-full bg-level-empty" aria-hidden>
                      {g.min !== null && g.max !== null ? <span className="absolute inset-y-0 rounded-full bg-level-3" style={{ insetInlineStart: `${((g.min - 1) / 4) * 100}%`, width: `${Math.max(2, ((g.max - g.min) / 4) * 100)}%` }} /> : null}
                    </span>
                    <span className="text-secondary tabular">{g.mean !== null ? t("meanRange", { mean: n.level(g.mean), min: n.level(g.min!), max: n.level(g.max!) }) : "—"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="size-4 text-warning" aria-hidden />{t("gaps")}</CardTitle>
            <CardDescription>{t("gapsNote")}</CardDescription>
          </CardHeader>
          <CardContent>
            {a.gaps.length ? (
              <ul className="flex flex-col gap-3">
                {a.gaps.map((g) => (
                  <li key={g.key} className="flex flex-col gap-0.5 rounded-control border border-border p-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-text">
                      {g.name}
                      {a.team.goals.includes(g.key) ? <Badge tone="accent">{t("goal")}</Badge> : null}
                    </span>
                    <span className="text-sm text-secondary">{t(`gap.${g.reason}`, { level: n.level(g.detail) })}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-secondary">{a.assessedCount ? t("noGaps") : t("needData")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Crown className="size-4 text-accent-text" aria-hidden />{t("pipeline")}</CardTitle>
            <CardDescription>{t("pipelineNote")}</CardDescription>
          </CardHeader>
          <CardContent>
            {!a.named ? (
              <p className="flex items-center gap-2 text-sm text-secondary"><Lock className="size-4" aria-hidden />{t("namedOnly")}</p>
            ) : a.pipeline.length ? (
              <ul className="flex flex-col gap-3">
                {a.pipeline.map((p) => (
                  <li key={p.memberId} className="flex items-center justify-between gap-3">
                    <Link href={`/app/teams/${a.team.id}/members/${p.memberId}`} className="hover:underline"><Person name={p.name} role={t("pipelineLevels", { lead: n.level(p.leadership), manage: n.level(p.management) })} /></Link>
                    <Badge tone={p.readiness === "ready" ? "success" : "neutral"}>{t(`readiness.${p.readiness}`)}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-secondary">{t("noPipeline")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ArrowRightLeft className="size-4 text-accent-text" aria-hidden />{t("pairings")}</CardTitle>
            <CardDescription>{t("pairingsNote")}</CardDescription>
          </CardHeader>
          <CardContent>
            {!a.named ? (
              <p className="flex items-center gap-2 text-sm text-secondary"><Lock className="size-4" aria-hidden />{t("namedOnly")}</p>
            ) : a.pairings.length ? (
              <ul className="flex flex-col gap-2">
                {a.pairings.map((p) => (
                  <li key={`${p.domain}-${p.mentor}`} className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-control border border-border p-3 text-sm">
                    <span className="font-medium text-text">{p.mentor}</span>
                    <span className="text-tertiary">→</span>
                    <span className="font-medium text-text">{p.learner}</span>
                    <span className="ms-auto text-secondary">{p.domainName}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-secondary">{t("noPairings")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Route className="size-4 text-accent-text" aria-hidden />{t("plan")}</CardTitle>
            <CardDescription>{t("planNote")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(a.suggestedTracks.length ? a.suggestedTracks : TRACKS.slice(0, 2).map((x) => ({ key: x.key, reasonDomain: "" }))).map((s) => {
              const track = TRACKS.find((x) => x.key === s.key)!;
              const assigned = a.assignedTracks.includes(s.key);
              return (
                <div key={s.key} className="flex items-center justify-between gap-3 rounded-control border border-border p-3">
                  <span className="flex flex-col">
                    <span className="text-sm font-medium text-text">{track.name[locale]}</span>
                    <span className="text-xs text-secondary">{s.reasonDomain ? t("forGap", { domain: s.reasonDomain }) : track.description[locale]}</span>
                  </span>
                  {canManage ? (
                    <Button
                      size="sm"
                      variant={assigned ? "ghost" : "secondary"}
                      disabled={assigned}
                      loading={assigning === s.key}
                      onClick={async () => {
                        setAssigning(s.key);
                        const r = await assignTrackAction(a.team.id, s.key);
                        setAssigning(null);
                        toast.success(t("assigned", { n: r.n }));
                      }}
                    >
                      {assigned ? t("isAssigned") : t("assign")}
                    </Button>
                  ) : null}
                </div>
              );
            })}
            <p className="text-xs text-tertiary">{t("planPrivacy")}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("members")}</CardTitle>
        </CardHeader>
        <CardContent>
          {a.members.length === 0 ? (
            <p className="text-sm text-secondary">{t("noMembers")}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {a.members.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  {a.named && m.counted ? (
                    <Link href={`/app/teams/${a.team.id}/members/${m.id}`} className="hover:underline"><Person name={m.name} role={m.email} /></Link>
                  ) : (
                    <Person name={m.name} role={m.email} />
                  )}
                  <span className="flex items-center gap-2">
                    {m.shareRawAnswers ? <span className="flex items-center gap-1 text-xs text-secondary"><ShieldCheck className="size-3.5" aria-hidden />{t("sharesAnswers")}</span> : null}
                    <Badge tone={STATUS_TONE[m.status] ?? "neutral"}>{t(`status.${m.status}`)}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <p className={cn("text-xs text-tertiary")}>{t("footer")}</p>
    </div>
  );
}

/** The one filled object on the page: what the reports suggest doing next. */
function TeamBrief({ a }: { a: TeamAnalytics }) {
  const t = useTranslations("team.brief");
  const tt = useTranslations("team");
  const n = useNumbers();
  const { locale } = useLocaleSettings();
  const waiting = a.members.filter((m) => m.status === "INVITED" || m.status === "CONSENTED").length;
  const steps: string[] = [];
  if (waiting) steps.push(t("notAssessed", { n: waiting }));
  if (!a.named && a.assessedCount > 0) steps.push(t("anon", { n: a.assessedCount }));
  const gap = a.gaps[0];
  const track = gap ? a.suggestedTracks.find((s) => s.reasonDomain === gap.name) : undefined;
  const trackDef = track ? TRACKS.find((x) => x.key === track.key) : undefined;
  if (gap && trackDef && !a.assignedTracks.includes(trackDef.key)) steps.push(t("gap", { track: trackDef.name[locale], domain: gap.name }));
  const pair = a.pairings[0];
  if (pair) steps.push(t("pair", { mentor: pair.mentor, learner: pair.learner, domain: pair.domainName, gap: n.level(pair.gap) }));
  const ready = a.pipeline.find((p) => p.readiness === "ready");
  if (ready) steps.push(t("ready", { name: ready.name }));
  return (
    <section aria-labelledby="team-brief" className="hero-card rounded-[20px] p-6 sm:p-8">
      <h2 id="team-brief" className="font-display text-2xl font-semibold tracking-[-0.02em]">{t("title", { team: a.team.name })}</h2>
      <p className="mt-1 text-sm text-hero-secondary">{t("body")}</p>
      <ol className="mt-5 grid gap-2 sm:grid-cols-2">
        {(steps.length ? steps : [t("none")]).slice(0, 4).map((s, i) => (
          <li key={s} className="hero-tile flex gap-3 rounded-[12px] p-4 text-sm">
            <span className="tabular grid size-6 shrink-0 place-items-center rounded-full bg-saffron text-xs font-semibold text-[#15163a]" aria-hidden>{n.number(i + 1)}</span>
            <span dir="auto">{s}</span>
          </li>
        ))}
      </ol>
      <p className="mt-5 max-w-3xl text-xs leading-relaxed text-hero-secondary">
        <span className="font-semibold text-hero-foreground">{tt("devToolTitle")}.</span> {tt("devTool")}
      </p>
    </section>
  );
}
