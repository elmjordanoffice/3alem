"use client";
import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { LevelLabel } from "@/components/report/level";
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
  const tooltip = { contentStyle: { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--text)" } };
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
                  <LineChart data={assessments.map((a) => ({ date: a.date, ...Object.fromEntries(a.domains.map((d) => [d.key, d.estimate])) }))}>
                    <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} reversed={dir === "rtl"} />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} width={28} orientation={dir === "rtl" ? "right" : "left"} />
                    <Tooltip {...tooltip} />
                    {last.domains.slice(0, 4).map((d, i) => (
                      <Line key={d.key} dataKey={d.key} name={d.name} stroke={COLORS[i]} strokeWidth={2} dot isAnimationActive={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : null}
            <ul className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
              {last.domains.map((d) => {
                const before = first?.domains.find((x) => x.key === d.key);
                const delta = before && assessments.length > 1 ? d.estimate - before.estimate : null;
                const real = delta !== null && before && (d.range[0] > before.range[1] || d.range[1] < before.range[0]);
                return (
                  <li key={d.key} className="flex items-baseline justify-between gap-3 border-b border-border py-2 text-sm">
                    <span className="text-text">{d.name}</span>
                    <span className="flex items-baseline gap-2">
                      <LevelLabel estimate={d.estimate} confidence={0.7} range={d.range} />
                      {delta !== null ? <span className={real ? "text-accent-text tabular" : "text-tertiary tabular"}>{delta >= 0 ? "+" : ""}{n.number(Math.round(delta * 10) / 10)}{real ? "" : ` ${t("withinRange")}`}</span> : null}
                    </span>
                  </li>
                );
              })}
            </ul>
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
                  <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} reversed={dir === "rtl"} />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--text-secondary)", fontSize: 12 }} width={28} orientation={dir === "rtl" ? "right" : "left"} />
                  <Tooltip {...tooltip} />
                  <Bar dataKey="n" name={t("sessions")} fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
