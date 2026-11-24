"use client";
import { useTranslations } from "next-intl";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { LevelMeter } from "@/components/report/level";
import { useLocaleSettings, useNumbers } from "@/components/providers";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function ProgressCharts({
  assessments,
  practiceWeeks,
}: {
  assessments: { date: string; domains: { key: string; name: string; estimate: number; range: [number, number] }[] }[];
  practiceWeeks: { week: string; n: number }[];
}) {
  const t = useTranslations("grow.progress");
  const n = useNumbers();
  const { dir } = useLocaleSettings();
  const first = assessments[0];
  const last = assessments.at(-1);
  const tooltip = {
    contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, fontSize: 12, color: "var(--text)", boxShadow: "var(--shadow-popover)" },
    cursor: { stroke: "var(--accent)", strokeOpacity: 0.35, strokeDasharray: "4 4" },
  };
  return (
    <div className="flex flex-col gap-6">
      {assessments.length < 2 ? <Alert tone="neutral">{t("oneAssessment")}</Alert> : null}
      {last ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("levels")}</CardTitle>
            <CardDescription>{t("levelsNote")}</CardDescription>
          </CardHeader>
          <CardContent>
            {assessments.length >= 2 ? (
              <div className="h-72" dir="ltr">
                <ResponsiveContainer>
                  <AreaChart data={assessments.map((a) => ({ date: a.date, ...Object.fromEntries(a.domains.map((d) => [d.key, d.estimate])) }))}>
                    <defs>
                      {COLORS.map((c, i) => (
                        <linearGradient key={c} id={`grow-area-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={c} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={c} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 6" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} reversed={dir === "rtl"} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} width={28} orientation={dir === "rtl" ? "right" : "left"} />
                    <Tooltip {...tooltip} />
                    {last.domains.slice(0, 4).map((d, i) => (
                      <Area
                        key={d.key}
                        type="monotone"
                        dataKey={d.key}
                        name={d.name}
                        stroke={COLORS[i]}
                        strokeWidth={2.5}
                        fill={`url(#grow-area-${i})`}
                        dot={{ r: 3, fill: COLORS[i], strokeWidth: 0 }}
                        activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }}
                        style={{ filter: `drop-shadow(0 6px 10px ${COLORS[i]})` }}
                        isAnimationActive={false}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : null}
            <ul className="mt-2 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {last.domains.map((d) => {
                const before = assessments.length > 1 ? first?.domains.find((x) => x.key === d.key) : undefined;
                const delta = before ? d.estimate - before.estimate : null;
                // A change counts as real only when the new range no longer overlaps the old one.
                const real = before ? d.range[0] > before.range[1] || d.range[1] < before.range[0] : false;
                const pct = (v: number) => ((v - 1) / 4) * 100;
                return (
                  <li key={d.key} className="flex flex-col gap-1.5">
                    <LevelMeter label={d.name} estimate={d.estimate} confidence={0.7} range={d.range} />
                    {before ? (
                      <div className="flex items-center gap-3">
                        <span className="relative h-1 flex-1 rounded-full bg-level-empty" aria-hidden>
                          <span className="absolute inset-y-0 rounded-full bg-mark-muted/60" style={{ insetInlineStart: `${pct(before.range[0])}%`, width: `${Math.max(3, pct(before.range[1]) - pct(before.range[0]))}%` }} />
                        </span>
                        <span className={real ? "text-xs font-medium text-accent-text tabular" : "text-xs text-tertiary tabular"}>
                          {delta! >= 0 ? "+" : ""}{n.number(Math.round(delta! * 10) / 10)}{real ? "" : ` ${t("withinRange")}`}
                        </span>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {assessments.length > 1 ? <p className="mt-5 text-xs text-tertiary">{t("compareNote", { date: first!.date })}</p> : null}
          </CardContent>
        </Card>
      ) : null}
      {practiceWeeks.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("practice")}</CardTitle>
            <CardDescription>{t("practiceNote")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48" dir="ltr">
              <ResponsiveContainer>
                <BarChart data={practiceWeeks}>
                  <defs>
                    <linearGradient id="grow-bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={1} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 6" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} reversed={dir === "rtl"} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--text-tertiary)", fontSize: 12 }} axisLine={false} tickLine={false} width={28} orientation={dir === "rtl" ? "right" : "left"} />
                  <Tooltip {...tooltip} cursor={{ fill: "var(--accent)", fillOpacity: 0.08 }} />
                  <Bar dataKey="n" name={t("sessions")} fill="url(#grow-bar)" radius={[10, 10, 10, 10]} maxBarSize={28} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
