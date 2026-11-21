"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils";
import { levelBand, levelRange } from "@/lib/levels";
import { useNumbers } from "@/components/providers";
import { levelClasses } from "./level";

const SERIES = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export interface ProfilePoint {
  key: string;
  label: string;
  /** One value per series, keyed by series key. */
  values: Record<string, number>;
}

/** Skill profile across domains. Up to 4 series for comparison. */
export function SkillRadar({
  data,
  series,
  label,
  className,
}: {
  data: ProfilePoint[];
  series: { key: string; label: string }[];
  label: string;
  className?: string;
}) {
  const n = useNumbers();
  const rows = data.map((d) => ({ label: d.label, ...d.values }));
  return (
    <figure className={cn("flex flex-col gap-3", className)} aria-label={label}>
      {series.length > 1 ? (
        <ul className="flex flex-wrap gap-4 text-xs text-secondary">
          {series.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: SERIES[i] }} aria-hidden />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="aspect-square w-full max-w-[420px] self-center" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={rows} outerRadius="72%" accessibilityLayer={false}>
            <PolarGrid stroke="var(--chart-grid)" />
            <PolarAngleAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                boxShadow: "var(--shadow-popover)",
                fontSize: 12,
                color: "var(--text)",
              }}
              formatter={(v) => (typeof v === "number" ? n.level(v) : String(v))}
            />
            {series.map((s, i) => (
              <Radar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stroke={SERIES[i]}
                fill={SERIES[i]}
                fillOpacity={series.length > 1 ? 0.06 : 0.14}
                strokeWidth={1.75}
                isAnimationActive={false}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {/* Text alternative for screen readers. */}
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col" />
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.label}</th>
              {series.map((s) => (
                <td key={s.key}>{n.level(d.values[s.key] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

/** Horizontal level bars with range whiskers: a clear alternative to radar. */
export function SkillBars({
  data,
  label,
  className,
}: {
  data: { key: string; label: string; estimate: number; confidence: number; range?: [number, number] }[];
  label: string;
  className?: string;
}) {
  const t = useTranslations("levels");
  const n = useNumbers();
  // The axis runs from level 1 (start) to level 5 (end).
  const pct = (v: number) => ((Math.min(5, Math.max(1, v)) - 1) / 4) * 100;
  return (
    <figure className={cn("flex flex-col", className)}>
      <figcaption className="sr-only">{label}</figcaption>
      <div className="mb-1 grid grid-cols-[minmax(7rem,12rem)_1fr] gap-3 text-[11px] text-tertiary sm:grid-cols-[12rem_1fr]" aria-hidden>
        <span />
        <span className="flex justify-between tabular">
          {[1, 2, 3, 4, 5].map((v) => (
            <span key={v}>{n.number(v)}</span>
          ))}
        </span>
      </div>
      <ul className="flex flex-col">
        {data.map((d) => {
          const [lo, hi] = d.range ?? levelRange(d.estimate, d.confidence);
          return (
            <li key={d.key} className="grid grid-cols-[minmax(7rem,12rem)_1fr] items-center gap-3 py-1.5 sm:grid-cols-[12rem_1fr]">
              <span className="truncate text-sm text-text">{d.label}</span>
              <span className="relative h-6" role="img" aria-label={`${d.label}: ${t(String(levelBand(d.estimate)))} (${n.range(lo, hi)})`}>
                <span className="absolute inset-y-[9px] inset-x-0 rounded-full bg-level-empty" />
                <span
                  className={cn("absolute inset-y-[7px] start-0 rounded-full", levelClasses(d.estimate))}
                  style={{ width: `max(8px, ${pct(d.estimate)}%)` }}
                />
                <span
                  className="absolute top-1 h-4 border-x-2 border-secondary/60"
                  style={{ insetInlineStart: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

/** Members × domains, coloured by level. Empty cells mean "not assessed". */
export function SkillHeatmap({
  rows,
  columns,
  label,
  className,
}: {
  rows: { key: string; label: string; values: Record<string, number | null>; thin?: string[] }[];
  columns: { key: string; label: string; short: string }[];
  label: string;
  className?: string;
}) {
  const t = useTranslations("levels");
  const tc = useTranslations("components.heatmap");
  const anyThin = rows.some((r) => r.thin?.length);
  const n = useNumbers();
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-separate border-spacing-1 text-sm">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            <th scope="col" className="sr-only">
              {tc("member")}
            </th>
            {columns.map((c) => (
              <th key={c.key} scope="col" className="min-w-12 px-1 pb-1 text-center align-bottom text-[11px] font-medium text-secondary">
                <abbr title={c.label} className="no-underline">
                  {c.short}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key}>
              <th scope="row" className="whitespace-nowrap pe-3 text-start text-sm font-normal text-text">
                {r.label}
              </th>
              {columns.map((c) => {
                const v = r.values[c.key];
                const thin = v != null && r.thin?.includes(c.key);
                return (
                  <td
                    key={c.key}
                    title={thin ? tc("thin") : undefined}
                    className={cn(
                      "h-10 rounded-[6px] text-center text-xs font-medium tabular",
                      v == null ? "bg-surface-subtle text-tertiary" : levelClasses(v),
                      // Thin evidence: lighter, with a dashed outline, so nobody over-reads it.
                      thin && "opacity-60 outline-[1.5px] outline-dashed -outline-offset-[3px] outline-current",
                    )}
                  >
                    {v == null ? (
                      <span>
                        <span aria-hidden>–</span>
                        <span className="sr-only">{tc("notAssessed")}</span>
                      </span>
                    ) : (
                      <span>
                        {n.level(v)}
                        <span className="sr-only"> {t(String(levelBand(v)))}{thin ? `, ${tc("thin")}` : ""}</span>
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {anyThin ? (
        <p className="mt-2 flex items-center gap-2 text-xs text-secondary">
          <span className="inline-block h-3.5 w-5 rounded-[4px] bg-level-3 opacity-60 outline-[1.5px] outline-dashed -outline-offset-[3px] outline-text" aria-hidden />
          {tc("thinLegend")}
        </p>
      ) : null}
    </div>
  );
}
