"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Info, Lightbulb, ShieldCheck, Sparkles, TrendingUp, MessageSquareQuote, Compass } from "lucide-react";
import { Collapsible } from "radix-ui";
import type { ReportContent, ReportDomain, ReportSkill } from "@/lib/hire/report-types";
import { WORK_STYLES } from "@/lib/framework/data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Tabs, TabsContent, SegmentedList, SegmentedTrigger } from "@/components/ui/tabs";
import { LevelLegend, LevelMeter, SkillChip } from "./level";
import { EvidenceCard } from "./evidence-card";
import { SkillBars, SkillRadar } from "./charts";
import { useLocaleSettings, useNumbers } from "@/components/providers";

export type ReportAudience = "team" | "candidate" | "print";

const FIT_TONE = { STRONG: "accent", GOOD: "accent", PARTIAL: "warning", WEAK: "neutral" } as const;

/** Framework work-style keys → the style keys items record. */
const STYLE_KEY: Record<string, string> = { "risk-appetite": "workstyle.risk", pace: "workstyle.pace", focus: "workstyle.focus", "working-mode": "workstyle.mode" };

function Section({ id, icon: Icon, title, children, note }: { id: string; icon?: typeof Info; title: string; children: React.ReactNode; note?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 break-inside-avoid-page">
      <div className="mb-4 flex flex-col gap-1">
        <h2 id={`${id}-h`} className="flex items-center gap-2 text-lg font-semibold text-text">
          {Icon ? <Icon className="size-4 text-accent-text" strokeWidth={1.75} aria-hidden /> : null}
          {title}
        </h2>
        {note ? <p className="text-sm text-secondary">{note}</p> : null}
      </div>
      {children}
    </section>
  );
}

function evidenceContext(t: ReturnType<typeof useTranslations>, e: ReportContent["evidence"][string], n: ReturnType<typeof useNumbers>) {
  return t("evidenceContext", { chapter: n.number(e.chapter), title: e.itemTitle, stage: t(`stage.${e.stage}`) });
}

function EvidenceList({ ids, content, skillNames, max = 3 }: { ids: string[]; content: ReportContent; skillNames: Record<string, string>; max?: number }) {
  const t = useTranslations("report");
  const n = useNumbers();
  const list = ids.map((id) => content.evidence[id]).filter((e): e is NonNullable<typeof e> => Boolean(e)).slice(0, max);
  if (!list.length) return <p className="text-sm text-tertiary">{t("noEvidence")}</p>;
  return (
    <div className="flex flex-col gap-2">
      {list.map((e) => (
        <EvidenceCard key={e.id} quote={e.quote} context={evidenceContext(t, e, n)} skill={skillNames[e.skillKey]} confidence={e.confidence} rationale={e.rationale.startsWith("Offline scoring") ? undefined : e.rationale} />
      ))}
    </div>
  );
}

function SkillRow({ s, content, skillNames, print }: { s: ReportSkill; content: ReportContent; skillNames: Record<string, string>; print: boolean }) {
  const t = useTranslations("report");
  const n = useNumbers();
  return (
    <Collapsible.Root className="group border-t border-border first:border-t-0" defaultOpen={print}>
      <div className="flex items-start gap-3 py-3">
        <LevelMeter label={s.name} estimate={s.estimate} confidence={s.confidence} range={s.range} className="flex-1" />
        <Collapsible.Trigger
          disabled={s.evidenceIds.length === 0}
          className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-control px-2 py-1 text-xs font-medium text-accent-text hover:bg-accent-subtle focus-visible:outline-2 focus-visible:outline-focus disabled:text-tertiary disabled:hover:bg-transparent print:hidden"
        >
          {s.evidenceIds.length ? t("evidenceCount", { count: s.evidenceIds.length, n: n.number(s.evidenceIds.length) }) : t("inferred")}
          {s.evidenceIds.length ? <ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" aria-hidden /> : null}
        </Collapsible.Trigger>
      </div>
      <Collapsible.Content className="pb-4">
        <EvidenceList ids={s.evidenceIds} content={content} skillNames={skillNames} />
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function DomainCard({ d, content, skillNames, print }: { d: ReportDomain; content: ReportContent; skillNames: Record<string, string>; print: boolean }) {
  const t = useTranslations("report");
  return (
    <Collapsible.Root className="group rounded-card border border-border bg-surface" defaultOpen={print}>
      <Collapsible.Trigger className="flex w-full items-center gap-4 p-4 text-start focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus">
        <LevelMeter label={d.name} estimate={d.estimate} confidence={d.confidence} range={d.range} className="flex-1" />
        {d.importance === "MUST_HAVE" ? <Badge tone="accent" className="hidden sm:inline-flex">{t("mustHave")}</Badge> : null}
        <ChevronDown className="size-4 shrink-0 text-tertiary transition-transform group-data-[state=open]:rotate-180 print:hidden" aria-hidden />
      </Collapsible.Trigger>
      <Collapsible.Content className="border-t border-border px-4">
        {d.subSkills.length ? d.subSkills.map((s) => <SkillRow key={s.key} s={s} content={content} skillNames={skillNames} print={print} />) : <p className="py-3 text-sm text-tertiary">{t("domainBaselineOnly")}</p>}
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function ClaimList({ claims, content, skillNames, empty }: { claims: ReportContent["narrative"]["strengths"]; content: ReportContent; skillNames: Record<string, string>; empty: string }) {
  if (!claims.length) return <p className="text-sm text-secondary">{empty}</p>;
  return (
    <div className="flex flex-col gap-6">
      {claims.map((c) => (
        <article key={`${c.skillKey}-${c.headline}`} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-text" dir="auto">{c.headline}</h3>
            <p className="reading text-[15px] leading-relaxed text-secondary" dir="auto">{c.explanation}</p>
          </div>
          <EvidenceList ids={c.evidenceIds} content={content} skillNames={skillNames} max={2} />
        </article>
      ))}
    </div>
  );
}

export function HireReport({ content, audience, actions }: { content: ReportContent; audience: ReportAudience; actions?: React.ReactNode }) {
  const t = useTranslations("report");
  const n = useNumbers();
  const { locale } = useLocaleSettings();
  const print = audience === "print";
  const forCandidate = audience === "candidate";
  const skillNames = React.useMemo(() => Object.fromEntries(content.domains.flatMap((d) => [[d.key, d.name], ...d.subSkills.map((s) => [s.key, s.name])])), [content]);
  const radar = content.domains.map((d) => ({ key: d.key, label: t(`domainShort.${d.key}`), values: { c: d.estimate } }));
  const bars = content.domains.map((d) => ({ key: d.key, label: d.name, estimate: d.estimate, confidence: d.confidence, range: d.range }));

  const toc = [
    ["summary", t("toc.summary")],
    ["profile", t("toc.profile")],
    ["strengths", t("toc.strengths")],
    ["potential", t("toc.potential")],
    ["development", t("toc.development")],
    ["style", t("toc.style")],
    ["decisions", t("toc.decisions")],
    ...(forCandidate ? [] : [["interview", t("toc.interview")], ["integrity", t("toc.integrity")]]),
    ["method", t("toc.method")],
  ];

  return (
    <div className={cn("grid gap-10", !print && "lg:grid-cols-[12rem_minmax(0,1fr)]")}>
      {!print ? (
        <nav aria-label={t("contents")} className="hidden lg:block print:hidden">
          <ul className="sticky top-24 flex flex-col gap-0.5 text-sm">
            {toc.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`} className="block rounded-control px-2.5 py-1.5 text-secondary hover:bg-surface-subtle hover:text-text">{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="flex min-w-0 flex-col gap-12">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-secondary">{forCandidate ? t("yourReport") : t("candidateReport")} · {content.role.title}</p>
              <h1 className="text-2xl font-semibold text-text">{content.candidate.name}</h1>
              <p className="text-sm text-tertiary">{t("generated", { date: new Date(content.generatedAt).toLocaleDateString(locale === "ar" ? "ar" : "en-GB", { year: "numeric", month: "long", day: "numeric" }) })}</p>
            </div>
            {actions ? <div className="flex flex-wrap gap-2 print:hidden">{actions}</div> : null}
          </div>
          {content.earlyVersion ? <Alert tone="info" title={t("earlyTitle")}>{t("earlyBody")}</Alert> : null}
        </header>

        <Section id="summary" title={t("toc.summary")}>
          <div className={cn("grid gap-4", !forCandidate && "md:grid-cols-[minmax(0,1fr)_16rem]")}>
            <p className="reading text-lg leading-relaxed text-text" dir="auto">{content.narrative.portrait}</p>
            {!forCandidate && content.kind === "HIRE" ? (
              <Card>
                <CardContent className="flex flex-col gap-3">
                  <span className="text-xs font-medium uppercase tracking-wide text-tertiary">{t("roleFit")}</span>
                  <span className="text-xl font-semibold text-text">{t(`fit.${content.fit.level}`)}</span>
                  <Badge tone={FIT_TONE[content.fit.level]} className="self-start">{t(`confidence.${content.fit.confidence >= 0.75 ? "high" : content.fit.confidence >= 0.5 ? "moderate" : "low"}`)}</Badge>
                  {content.fit.gaps.length ? (
                    <div className="flex flex-col gap-1 border-t border-border pt-3">
                      <span className="text-xs text-secondary">{t("gaps")}</span>
                      {content.fit.gaps.slice(0, 3).map((g) => (
                        <span key={g.key} className="text-sm text-text">{g.name}</span>
                      ))}
                    </div>
                  ) : null}
                  <p className="text-xs text-tertiary">{t("fitNote")}</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </Section>

        <Section id="profile" title={t("toc.profile")} note={t("profileNote")}>
          <Tabs defaultValue="bars" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
              <SegmentedList aria-label={t("chartView")}>
                <SegmentedTrigger value="bars">{t("bars")}</SegmentedTrigger>
                <SegmentedTrigger value="radar">{t("radar")}</SegmentedTrigger>
              </SegmentedList>
              <LevelLegend />
            </div>
            <TabsContent value="bars" className="pt-0" forceMount={print ? true : undefined}>
              <Card><CardContent><SkillBars data={bars} label={t("toc.profile")} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="radar" className="pt-0">
              <Card><CardContent><SkillRadar data={radar} series={[{ key: "c", label: content.candidate.name }]} label={t("toc.profile")} /></CardContent></Card>
            </TabsContent>
          </Tabs>
          <div className="mt-4 flex flex-col gap-2">
            {[...content.domains].sort((a, b) => (b.importance === "MUST_HAVE" ? 1 : 0) - (a.importance === "MUST_HAVE" ? 1 : 0)).map((d) => (
              <DomainCard key={d.key} d={d} content={content} skillNames={skillNames} print={print} />
            ))}
          </div>
        </Section>

        <Section id="strengths" icon={TrendingUp} title={t("toc.strengths")}>
          <ClaimList claims={content.narrative.strengths} content={content} skillNames={skillNames} empty={t("none.strengths")} />
        </Section>

        <Section id="potential" icon={Sparkles} title={t("toc.potential")} note={t("potentialNote")}>
          <ClaimList claims={content.narrative.hiddenPotential} content={content} skillNames={skillNames} empty={t("none.potential")} />
        </Section>

        <Section id="development" icon={Lightbulb} title={t("toc.development")} note={forCandidate ? undefined : t("developmentNote")}>
          <ClaimList claims={content.narrative.developmentAreas} content={content} skillNames={skillNames} empty={t("none.development")} />
          {content.hypotheses.some((h) => h.condition && h.condition !== "general") ? (
            <Alert tone="neutral" className="mt-4">{t("conditional")}</Alert>
          ) : null}
        </Section>

        <Section id="style" icon={Compass} title={t("toc.style")} note={t("styleNote")}>
          {content.workStyle.length ? (
            <ul className="grid gap-5 sm:grid-cols-2">
              {WORK_STYLES.map((ws) => {
                const v = content.workStyle.find((w) => w.key === STYLE_KEY[ws.key]);
                if (!v) return null;
                const pct = ((v.position + 1) / 2) * 100;
                return (
                  <li key={ws.key} className="flex flex-col gap-2 rounded-card border border-border bg-surface p-4">
                    <span className="text-sm font-medium text-text">{ws.name[locale]}</span>
                    <div className="relative h-1.5 rounded-full bg-surface-sunken" role="img" aria-label={`${ws.name[locale]}: ${ws.poles.a[locale]} – ${ws.poles.b[locale]}`}>
                      <span className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 border-surface bg-accent shadow-sm ltr:-translate-x-1/2 rtl:translate-x-1/2" style={{ insetInlineStart: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-secondary">
                      <span>{ws.poles.a[locale]}</span>
                      <span>{ws.poles.b[locale]}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-secondary">{t("none.style")}</p>
          )}
        </Section>

        <Section id="decisions" icon={MessageSquareQuote} title={t("toc.decisions")}>
          <div className="flex flex-col gap-3">
            <p className="text-base font-semibold text-text" dir="auto">{content.narrative.decisionPattern.headline}</p>
            <p className="reading text-[15px] text-secondary" dir="auto">{content.narrative.decisionPattern.explanation}</p>
            {content.narrative.decisionPattern.evidenceIds.length ? <EvidenceList ids={content.narrative.decisionPattern.evidenceIds} content={content} skillNames={skillNames} max={2} /> : null}
          </div>
        </Section>

        {!forCandidate ? (
          <Section id="interview" title={t("toc.interview")} note={t("interviewNote")}>
            <ol className="flex flex-col gap-3">
              {content.narrative.interviewQuestions.map((q, i) => (
                <li key={i} className="flex gap-3 rounded-card border border-border bg-surface p-4">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-xs font-semibold text-secondary tabular">{n.number(i + 1)}</span>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-medium text-text" dir="auto">{q.question}</p>
                    <p className="text-sm text-secondary" dir="auto"><span className="text-tertiary">{t("followUp")} </span>{q.followUp}</p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <SkillChip name={skillNames[q.skillKey] ?? q.skillKey} />
                      <span className="text-xs text-tertiary" dir="auto">{q.why}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        ) : null}

        {!forCandidate ? (
          <Section id="integrity" icon={ShieldCheck} title={t("toc.integrity")} note={t("integrityNote")}>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-3">
              {[
                [t("integrity.time"), t("integrity.timeValue", { used: n.number(content.integrity.minutesUsed), budget: n.number(content.integrity.budgetMinutes) })],
                [t("integrity.items"), n.number(content.integrity.itemsCompleted)],
                [t("integrity.paste"), n.number(content.integrity.pasteEvents)],
                [t("integrity.tabs"), n.number(content.integrity.tabHidden)],
                [t("integrity.style"), n.number(content.integrity.styleShifts)],
                [t("integrity.consistency"), content.integrity.inconsistentSkills.length ? content.integrity.inconsistentSkills.join(", ") : t("integrity.consistent")],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 bg-surface p-4">
                  <dt className="text-xs text-secondary">{k}</dt>
                  <dd className="text-sm font-medium text-text tabular">{v}</dd>
                </div>
              ))}
            </dl>
          </Section>
        ) : null}

        <Section id="method" icon={Info} title={t("toc.method")}>
          <div className="reading flex flex-col gap-3 text-sm leading-relaxed text-secondary">
            <p>{t("method.p1")}</p>
            <p>{t("method.p2")}</p>
            <p>{content.method.scoring === "anthropic" ? t("method.ai", { n: n.number(content.method.doubleScoredItems) }) : t("method.offline")}</p>
            <p>{t("method.p3")}</p>
            <p className="text-xs text-tertiary">{t("method.versions", { versions: [content.method.engineVersion, ...content.method.scorerVersions, content.method.writer].join(" · ") })}</p>
          </div>
        </Section>
      </div>
    </div>
  );
}
