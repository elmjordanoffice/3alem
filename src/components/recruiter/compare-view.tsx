"use client";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReportContent } from "@/lib/hire/report-types";
import { Card, CardContent } from "@/components/ui/card";
import { SkillRadar } from "@/components/report/charts";
import { LevelLabel, levelClasses } from "@/components/report/level";
import { cn } from "@/lib/utils";
import { useNumbers } from "@/components/providers";

export function CompareView({ reports }: { reports: { sessionId: string; name: string; content: ReportContent }[] }) {
  const t = useTranslations("compare");
  const tr = useTranslations("report");
  const n = useNumbers();
  const domains = reports[0]!.content.domains;
  const series = reports.map((r, i) => ({ key: `c${i}`, label: r.name }));
  const data = domains.map((d) => ({ key: d.key, label: tr(`domainShort.${d.key}`), values: Object.fromEntries(reports.map((r, i) => [`c${i}`, r.content.domains.find((x) => x.key === d.key)?.estimate ?? 0])) }));
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent>
          <SkillRadar data={data} series={series} label={t("title")} />
        </CardContent>
      </Card>
      <div className="overflow-x-auto rounded-card border border-border bg-surface">
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
                  {d.name}
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
