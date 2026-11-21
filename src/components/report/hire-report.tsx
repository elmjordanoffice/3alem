"use client";
import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, CalendarRange, ChevronDown, Info, Lightbulb, ShieldCheck, Sparkles, TrendingUp, MessageSquareQuote, Compass } from "lucide-react";
import { Collapsible } from "radix-ui";
import type { ReportContent, ReportDomain, ReportSkill } from "@/lib/hire/report-types";
import { DOMAINS, WORK_STYLES } from "@/lib/framework/data";
import { TRACKS } from "@/lib/grow/tracks";
import { firstDays as planFirstDays, type FirstDays } from "@/lib/hire/first-days";
import { cn, initials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { LevelMeter, SkillChip } from "./level";
import { EvidenceCard } from "./evidence-card";
import { AdjustControl, OpenAnswer, ReviewBanner, ReviewProvider, useReview, type ReviewInfo } from "./review";
import { SkillRadar } from "./charts";
import { useLocaleSettings, useNumbers } from "@/components/providers";
import { SENIORITY_LEVEL } from "@/lib/engine/config";
import { levelBand } from "@/lib/levels";
import { RangeScale } from "./range-scale";

export type ReportAudience = "team" | "candidate" | "print";

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
        <EvidenceCard key={e.id} quote={e.quote} context={evidenceContext(t, e, n)} skill={skillNames[e.skillKey]} confidence={e.confidence} rationale={e.rationale.startsWith("Offline scoring") ? undefined : e.rationale} action={<OpenAnswer scoreId={e.scoreId} />} />
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
  const editable = Boolean(useReview()?.editable) && !print;
  return (
    <Collapsible.Root className="group relative" defaultOpen={print}>
      <Collapsible.Trigger className={cn("flex w-full items-center gap-4 px-4 py-3.5 text-start transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus sm:px-5", editable && "pe-12 sm:pe-14")}>
        <LevelMeter label={d.name} estimate={d.estimate} confidence={d.confidence} range={d.range} className="flex-1" />
        {d.importance === "MUST_HAVE" ? <Badge tone="accent" className="hidden sm:inline-flex">{t("mustHave")}</Badge> : null}
        <ChevronDown className="size-4 shrink-0 text-tertiary transition-transform group-data-[state=open]:rotate-180 print:hidden" aria-hidden />
      </Collapsible.Trigger>
      <AdjustControl skillKey={d.key} skillName={d.name} range={d.range} />
      <Collapsible.Content className="border-t border-border bg-surface-subtle/50 px-4 sm:px-5">
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

/** The report's opening: role fit, its confidence, and every must-have skill against the level the role needs. */
function Verdict({ content }: { content: ReportContent }) {
  const t = useTranslations("report");
  const tl = useTranslations("levels");
  const n = useNumbers();
  const expected = SENIORITY_LEVEL[content.role.seniority] ?? 3;
  const must = content.domains.filter((d) => d.importance === "MUST_HAVE");
  const shown = (must.length ? must : [...content.domains].sort((a, b) => b.confidence - a.confidence).slice(0, 3)).slice(0, 5);
  const conf = content.fit.confidence >= 0.75 ? "high" : content.fit.confidence >= 0.5 ? "moderate" : "low";
  return (
    <div className="hero-card rounded-[20px] print:bg-hero-via print:shadow-none">
      <div className="grid gap-10 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12 lg:p-10">
        <div className="flex flex-col">
          <p className="eyebrow text-hero-secondary">{t("roleFit")}</p>
          <p className="display-x mt-3 text-[2.75rem] sm:text-[3.5rem]">
            {t(`fit.${content.fit.level}`)}
            <span className="ms-1 inline-block size-[0.22em] translate-y-[-0.1em] rounded-full bg-saffron align-baseline" aria-hidden />
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex gap-0.5" aria-hidden>
              {[0, 1, 2].map((i) => <span key={i} className={cn("h-1.5 w-4 rounded-full", i < (conf === "high" ? 3 : conf === "moderate" ? 2 : 1) ? "bg-saffron" : "bg-ink-foreground/15")} />)}
            </span>
            {t(`confidence.${conf}`)}
          </p>
          <p className="mt-8 text-[17px] leading-relaxed" dir="auto">{content.narrative.portrait}</p>
          <p className="mt-auto pt-8 text-sm text-hero-secondary">{t("fitNote")}</p>
        </div>
        <div className="flex flex-col">
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow text-hero-secondary">{must.length ? t("mustHaves") : t("bestEvidenced")}</p>
            <p className="flex items-center gap-1.5 text-xs text-hero-secondary">
              <span className="inline-block h-3 w-0.5 rounded-full bg-ink-foreground/70" aria-hidden />
              {t("expectedLevel", { level: tl(String(levelBand(expected))) })}
            </p>
          </div>
          <ul className="mt-5 flex flex-col gap-6">
            {shown.map((d) => (
              <li key={d.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[15px] font-medium">{d.name}</span>
                  <span className="shrink-0 text-sm text-hero-secondary">
                    {tl(String(levelBand(d.estimate)))} <bdi dir="ltr" className="tabular">{n.range(d.range[0], d.range[1])}</bdi>
                  </span>
                </div>
                <RangeScale low={d.range[0]} high={d.range[1]} estimate={d.estimate} expected={expected} tone="ink" className="mt-2.5" />
                <span className="sr-only">{t("rangeSr", { low: n.level(d.range[0]), high: n.level(d.range[1]), expected: n.level(expected) })}</span>
              </li>
            ))}
          </ul>
          {content.fit.gaps.length ? (
            <div className="mt-8 border-t border-ink-foreground/15 pt-5">
              <p className="text-sm text-hero-secondary">{t("gapsInterview")}</p>
              <ul className="mt-2.5 flex flex-wrap gap-2">
                {content.fit.gaps.slice(0, 4).map((g) => (
                  <li key={g.key} className="rounded-[6px] px-2.5 py-1 text-sm shadow-[inset_0_0_0_1px_rgb(242_240_235/0.25)]">{g.name}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function HireReport({ content, audience, actions, review, firstDays = false }: { content: ReportContent; audience: ReportAudience; actions?: React.ReactNode; review?: ReviewInfo; firstDays?: boolean }) {
  const t = useTranslations("report");
  const n = useNumbers();
  const { locale } = useLocaleSettings();
  const print = audience === "print";
  const forCandidate = audience === "candidate";
  const skillNames = React.useMemo(() => Object.fromEntries(content.domains.flatMap((d) => [[d.key, d.name], ...d.subSkills.map((s) => [s.key, s.name])])), [content]);
  const radar = content.domains.map((d) => ({ key: d.key, label: t(`domainShort.${d.key}`), values: { c: d.estimate } }));
  // The first 90 days: for the hiring team, once someone is moving forward.
  const plan = firstDays && !forCandidate ? planFirstDays(content) : null;

  const toc = [
    ["summary", t("toc.summary")],
    ["profile", t("toc.profile")],
    ["strengths", t("toc.strengths")],
    ["potential", t("toc.potential")],
    ["development", t("toc.development")],
    ["style", t("toc.style")],
    ["decisions", t("toc.decisions")],
    ...(forCandidate ? [] : [["interview", t("toc.interview")], ...(plan ? [["first-days", t("toc.firstDays")]] : []), ["integrity", t("toc.integrity")]]),
    ["method", t("toc.method")],
  ];

  return (
    <ReviewProvider value={forCandidate ? null : (review ?? null)}>
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
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {/* The person, first: an initials tile in the evidence gold. */}
              <span className="relative inline-flex size-16 shrink-0 items-center justify-center rounded-[12px] bg-text font-display text-xl font-bold text-background [font-stretch:125%] print:shadow-none" aria-hidden>
                {initials(content.candidate.name)}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <h1 className="text-[2rem] font-semibold leading-[1.1] text-text sm:text-[2.5rem]">{content.candidate.name}</h1>
                <p className="text-sm text-secondary">
                  {forCandidate ? t("yourReportFor", { role: content.role.title }) : t("candidateReportFor", { role: content.role.title })} ·{" "}
                  {t("generated", { date: new Date(content.generatedAt).toLocaleDateString(locale === "ar" ? "ar" : "en-GB", { year: "numeric", month: "long", day: "numeric" }) })}
                </p>
              </div>
            </div>
            {actions ? <div className="flex flex-wrap gap-2 print:hidden">{actions}</div> : null}
          </div>
          {content.earlyVersion ? <Alert tone="neutral" title={t("earlyTitle")}>{t("earlyBody")}</Alert> : null}
          {!forCandidate ? <ReviewBanner candidateName={content.candidate.name} /> : null}
        </header>

        <section id="summary" aria-labelledby="summary-h" className="scroll-mt-24">
          <h2 id="summary-h" className="sr-only">{t("toc.summary")}</h2>
          {!forCandidate && content.kind === "HIRE" ? (
            <Verdict content={content} />
          ) : (
            <p className="reading text-xl leading-relaxed text-text" dir="auto">{content.narrative.portrait}</p>
          )}
        </section>

        <Section id="profile" title={t("toc.profile")} note={t("profileNote")}>
          <div className={cn("grid gap-6", !print && "xl:grid-cols-[minmax(0,1fr)_17rem]")}>
            <div className="divide-y divide-border overflow-hidden rounded-card bg-surface shadow-card">
              {[...content.domains].sort((a, b) => (b.importance === "MUST_HAVE" ? 1 : 0) - (a.importance === "MUST_HAVE" ? 1 : 0)).map((d) => (
                <DomainCard key={d.key} d={d} content={content} skillNames={skillNames} print={print} />
              ))}
            </div>
            <figure className="self-start rounded-card bg-surface shadow-card p-4 xl:sticky xl:top-24">
              <SkillRadar data={radar} series={[{ key: "c", label: content.candidate.name }]} label={t("toc.profile")} />
              <figcaption className="mt-2 text-xs leading-relaxed text-tertiary">{t("radarCaption")}</figcaption>
            </figure>
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
                  <li key={ws.key} className="flex flex-col gap-2 rounded-card bg-surface shadow-card p-4">
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
                <li key={i} className="flex gap-3 rounded-card bg-surface shadow-card p-4">
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
            {review?.editable ? (
              <Link href={`/app/reports/${review.sessionId}/interview`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent-text hover:underline print:hidden">
                {t("openKit")}
                <ArrowRight className="size-4 flip-rtl" aria-hidden />
              </Link>
            ) : null}
          </Section>
        ) : null}

        {plan ? <FirstDaysSection plan={plan} name={content.candidate.name} /> : null}

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
    </ReviewProvider>
  );
}

/** If you hire them: where to lean on them early and how to support the gaps, phase by phase. */
function FirstDaysSection({ plan, name }: { plan: FirstDays; name: string }) {
  const t = useTranslations("report.firstDays");
  const { locale } = useLocaleSettings();
  const dn = (key: string, fallback: string) => {
    const v = DOMAINS.find((d) => d.key === key)?.name[locale] ?? fallback;
    return locale === "en" ? v.charAt(0).toLowerCase() + v.slice(1) : v;
  };
  const list = (xs: string[]) => new Intl.ListFormat(locale, { type: "conjunction" }).format(xs);
  return (
    <Section id="first-days" icon={CalendarRange} title={t("title")} note={t("note", { name })}>
      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-2 rounded-card bg-surface p-5 shadow-card">
          <h3 className="eyebrow text-tertiary">{t("useEarlyTitle")}</h3>
          <p className="text-[15px] leading-relaxed text-text">{plan.useEarly.length ? t("useEarly", { skills: list(plan.useEarly.map((u) => dn(u.key, u.name))) }) : "—"}</p>
        </div>
        <div className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
          <h3 className="eyebrow text-tertiary">{t("supportTitle")}</h3>
          {plan.support.length ? (
            plan.support.map((g) => {
              const track = g.track ? TRACKS.find((x) => x.key === g.track) : undefined;
              const skill = dn(g.key, g.name);
              return (
                <ol key={g.key} className="flex flex-col gap-2 border-s-2 border-saffron ps-4 text-[15px] leading-relaxed text-text">
                  <li>{t("d30", { skill })}</li>
                  <li>{track ? t("d60Track", { track: track.name[locale] }) : t("d60", { skill })}</li>
                  {g.habit ? <li>{t("d90", { skill, look: t(`look.${g.habit}`) })}</li> : null}
                </ol>
              );
            })
          ) : (
            <p className="text-[15px] leading-relaxed text-text">{t("none")}</p>
          )}
        </div>
      </div>
    </Section>
  );
}
