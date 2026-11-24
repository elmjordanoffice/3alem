"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useLocaleSettings, useNumbers } from "@/components/providers";

/**
 * Hiring activity over the last two weeks: assessments finished (violet area)
 * and decisions recorded (teal line), with this week's totals as tiles.
 */
export function ActivityChart({ days }: { days: { day: string; finished: number; decided: number }[] }) {
  const t = useTranslations("home.activity");
  const n = useNumbers();
  const { dir, locale } = useLocaleSettings();
  const id = React.useId().replace(/:/g, "");
  const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-u-nu-latn" : "en", { weekday: "short", day: "numeric", timeZone: "UTC" });
  const rows = days.map((d) => ({ ...d, label: fmt.format(new Date(`${d.day}T00:00:00Z`)) }));
  const week = days.slice(-7);
  const finished = week.reduce((a, d) => a + d.finished, 0);
  const decided = week.reduce((a, d) => a + d.decided, 0);
  const top = Math.max(3, ...days.map((d) => Math.max(d.finished, d.decided)));
  return (
    <section aria-labelledby="activity-h">
      <div className="mb-4 flex min-h-9 items-center justify-between gap-4">
        <h2 id="activity-h" className="text-xl font-bold tracking-[-0.015em] text-text">{t("title")}</h2>
        <ul className="flex items-center gap-4 text-sm" aria-hidden>
          <li className="flex items-center gap-2 font-medium text-accent-text"><span className="size-2.5 rounded-full bg-[var(--chart-1)]" />{t("finished")}</li>
          <li className="flex items-center gap-2 font-medium text-teal-text"><span className="size-2.5 rounded-full bg-teal" />{t("decided")}</li>
        </ul>
      </div>
      <div className="grid gap-4 rounded-card bg-surface p-4 shadow-card sm:grid-cols-[minmax(0,1fr)_10rem] sm:p-5">
        <div className="h-52 min-w-0" dir="ltr" role="img" aria-label={t("label")}>
          <ResponsiveContainer>
            <ComposedChart data={rows} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`act-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" minTickGap={18} reversed={dir === "rtl"} />
              <YAxis allowDecimals={false} domain={[0, top]} tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} axisLine={false} tickLine={false} width={24} orientation={dir === "rtl" ? "right" : "left"} />
              <Tooltip
                cursor={{ stroke: "var(--chart-1)", strokeWidth: 2 }}
                content={({ active, payload, label }) => {
                  const row = active ? (payload?.[0]?.payload as (typeof rows)[number] | undefined) : undefined;
                  if (!row) return null;
                  return (
                    <div className="rounded-2xl bg-accent px-3.5 py-2.5 text-accent-foreground shadow-raised">
                      <p className="text-xs opacity-80">{label}</p>
                      <p className="text-sm font-bold">{t("finishedN", { n: n.number(row.finished) })}</p>
                      <p className="text-xs opacity-90">{t("decidedN", { n: n.number(row.decided) })}</p>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="finished" stroke="var(--chart-1)" strokeWidth={3} fill={`url(#act-${id})`} dot={false} activeDot={{ r: 6, fill: "#fff", stroke: "var(--chart-1)", strokeWidth: 3 }} style={{ filter: "drop-shadow(0 8px 14px var(--chart-1))" }} isAnimationActive={false} />
              <Line type="monotone" dataKey="decided" stroke="var(--teal)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: "var(--teal)", stroke: "var(--surface)", strokeWidth: 2 }} style={{ filter: "drop-shadow(0 6px 10px var(--teal))" }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
          <div className="tile-blue flex flex-col justify-center px-4 py-3">
            <span className="text-[2rem] font-extrabold leading-none tracking-[-0.03em] tabular">{n.number(finished)}</span>
            <span className="mt-1.5 text-xs font-medium">{t("finishedWeek")}</span>
          </div>
          <div className="tile-teal flex flex-col justify-center px-4 py-3">
            <span className="text-[2rem] font-extrabold leading-none tracking-[-0.03em] tabular">{n.number(decided)}</span>
            <span className="mt-1.5 text-xs font-medium">{t("decidedWeek")}</span>
          </div>
        </div>
        <div className="sr-only">
          <table>
            <caption>{t("label")}</caption>
            <thead><tr><th scope="col">{t("day")}</th><th scope="col">{t("finished")}</th><th scope="col">{t("decided")}</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.day}><th scope="row">{r.label}</th><td>{r.finished}</td><td>{r.decided}</td></tr>)}</tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
