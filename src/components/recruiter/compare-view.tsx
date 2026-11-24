"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReportContent } from "@/lib/hire/report-types";
import { differences, type Difference } from "@/lib/hire/compare";
import { DOMAINS } from "@/lib/framework/data";

/** Skill names in the reader's language (the report may be written in the other one). */
function domainName(key: string, fallback: string, locale: "en" | "ar"): string {
  return DOMAINS.find((d) => d.key === key)?.name[locale] ?? fallback;
}
import { Card, CardContent } from "@/components/ui/card";
import { SkillRadar } from "@/components/report/charts";
import { LevelLabel, levelClasses } from "@/components/report/level";
import { cn } from "@/lib/utils";
import { useLocaleSettings, useNumbers } from "@/components/providers";

export function CompareView({ reports }: { reports: { sessionId: string; name: string; content: ReportContent }[] }) {
  const t = useTranslations("compare");
  const tr = useTranslations("report");
  const n = useNumbers();
  const { locale } = useLocaleSettings();
  const domains = reports[0]!.content.domains;
  const series = reports.map((r, i) => ({ key: `c${i}`, label: r.name }));
  const data = domains.map((d) => ({ key: d.key, label: tr(`domainShort.${d.key}`), values: Object.fromEntries(reports.map((r, i) => [`c${i}`, r.content.domains.find((x) => x.key === d.key)?.estimate ?? 0])) }));
  return (
    <div className="flex flex-col gap-6">
      <Differences reports={reports} />
      <Card>
        <CardContent>
          <SkillRadar data={data} series={series} label={t("title")} />
        </CardContent>
      </Card>
      <div className="overflow-x-auto rounded-card bg-surface shadow-card">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">{t("table")}</caption>
          <thead className="bg-surface-subtle">
            <tr>
              <th scope="col" className="px-4 py-3 text-start text-xs font-medium text-secondary">{t("domain")}</th>
              {reports.map((r) => (
                <th key={r.sessionId} scope="col" className="px-4 py-3 text-start">
                  <Link href={`/app/reports/${r.sessionId}`} className="font-semibold text-text hover:text-accent-text hover:underline">{r.name}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <th scope="row" className="px-4 py-3 text-start font-medium text-text">{tr("roleFit")}</th>
              {reports.map((r) => (
                <td key={r.sessionId} className="px-4 py-3 font-medium text-text">{tr(`fit.${r.content.fit.level}`)}</td>
              ))}
            </tr>
            {domains.map((d) => (
              <tr key={d.key} className="border-t border-border">
                <th scope="row" className="px-4 py-3 text-start font-normal text-text">
                  {domainName(d.key, d.name, locale)}
                  {d.importance === "MUST_HAVE" ? <span className="ms-2 text-xs text-accent-text">{tr("mustHave")}</span> : null}
                </th>
                {reports.map((r) => {
                  const x = r.content.domains.find((y) => y.key === d.key)!;
                  return (
                    <td key={r.sessionId} className="px-4 py-3">
                      <span className="flex items-center gap-2">
                        <span className={cn("inline-flex size-6 items-center justify-center rounded-[5px] text-[11px] font-semibold tabular", levelClasses(x.estimate))}>{n.number(Math.round(x.estimate))}</span>
                        <LevelLabel estimate={x.estimate} confidence={x.confidence} range={x.range} />
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-border align-top">
              <th scope="row" className="px-4 py-3 text-start font-medium text-text">{tr("toc.strengths")}</th>
              {reports.map((r) => (
                <td key={r.sessionId} className="px-4 py-3 text-secondary">{r.content.narrative.strengths.map((s) => s.headline).join(" · ") || "—"}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-tertiary">{t("note")}</p>
    </div>
  );
}

/** The clear differences first, with each side in their own words; the rest named as too close to call. */
function Differences({ reports }: { reports: { sessionId: string; name: string; content: ReportContent }[] }) {
  const t = useTranslations("compare.diff");
  const tr = useTranslations("report");
  const n = useNumbers();
  const { locale } = useLocaleSettings();
  const { clear, within } = differences(reports);
  const shown = clear.slice(0, 4);
  return (
    <section aria-labelledby="diff-h" className="hero-card rounded-[20px] p-6 sm:p-8">
      <h2 id="diff-h" className="font-display text-2xl font-semibold tracking-[-0.02em]">{t("title")}</h2>
      <p className="mt-1 text-sm text-hero-secondary">{t("body")}</p>
      {shown.length ? (
        <ul className="mt-5 grid gap-3 lg:grid-cols-2">
          {shown.map((d) => (
            <DiffTile key={d.key} d={d} name={domainName(d.key, d.name, locale)} mustHave={tr("mustHave")} ahead={t("ahead", { leader: d.leader.name, trailer: d.trailer.name, gap: n.level(d.gap) })} level={n.level} />
          ))}
        </ul>
      ) : (
        <p className="hero-tile mt-5 rounded-[12px] p-4 text-sm">{t("none")}</p>
      )}
      {clear.length > shown.length ? <p className="mt-3 text-sm text-hero-secondary">{t("more", { n: clear.length - shown.length })}</p> : null}
      {shown.length && within.length ? (
        <p className="mt-4 text-sm text-hero-secondary">{t("within", { skills: new Intl.ListFormat(locale, { type: "conjunction" }).format(within.map((w) => domainName(w.key, w.name, locale))) })}</p>
      ) : null}
    </section>
  );
}

function DiffTile({ d, name, mustHave, ahead, level }: { d: Difference; name: string; mustHave: string; ahead: string; level: (n: number) => string }) {
  return (
    <li className="hero-tile flex flex-col gap-3 rounded-[12px] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-semibold text-hero-foreground">
          {name}
          {d.mustHave ? <span className="ms-2 rounded-full bg-signal px-2 py-0.5 text-[11px] font-semibold text-signal-foreground">{mustHave}</span> : null}
        </h3>
        <span className="text-xs text-hero-secondary">{ahead}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {[d.leader, d.trailer].map((s, i) => (
          <figure key={s.sessionId} className="flex flex-col gap-1.5 rounded-xl bg-white/5 p-3">
            <figcaption className="flex items-center justify-between gap-2 text-xs">
              <span className={cn("font-semibold", i === 0 ? "text-hero-foreground" : "text-hero-secondary")}>{s.name}</span>
              <span className="tabular text-hero-secondary">{level(s.estimate)}</span>
            </figcaption>
            {s.quote ? (
              <blockquote className="text-[13px] leading-relaxed text-hero-foreground/90" dir="auto">“{s.quote}”</blockquote>
            ) : null}
          </figure>
        ))}
      </div>
    </li>
  );
}
