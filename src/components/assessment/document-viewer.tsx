"use client";
import * as React from "react";
import { FileText, Mail, Table2, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartMaterial, EmailMaterial, Material, MemoMaterial, TableMaterial } from "@/lib/assessment/materials";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { useLocaleSettings, useNumbers } from "@/components/providers";

const ICONS = { email: Mail, memo: FileText, table: Table2, chart: BarChart3 } as const;

/** Materials as tabs. Each type is rendered to look like the real thing. */
export function DocumentViewer({ materials, label }: { materials: Material[]; label: string }) {
  if (materials.length === 0) return null;
  return (
    <Tabs defaultValue={materials[0]!.id} className="flex min-w-0 flex-col">
      <TabsList aria-label={label}>
        {materials.map((m) => {
          const Icon = ICONS[m.kind];
          return (
            <TabsTrigger key={m.id} value={m.id}>
              <Icon strokeWidth={1.75} aria-hidden />
              <span className="max-w-40 truncate">{m.title}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {materials.map((m) => (
        <TabsContent key={m.id} value={m.id}>
          <MaterialView material={m} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function MaterialView({ material }: { material: Material }) {
  switch (material.kind) {
    case "email":
      return <EmailView email={material} />;
    case "memo":
      return <MemoView memo={material} />;
    case "table":
      return <TableView table={material} />;
    case "chart":
      return <ChartView chart={material} />;
  }
}

function EmailView({ email }: { email: EmailMaterial }) {
  const t = useTranslations("components.documents");
  const names = (list: { name: string }[]) => list.map((p) => p.name).join(", ");
  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface">
      <header className="flex flex-col gap-3 border-b border-border p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-text" dir="auto">
          {email.subject}
        </h3>
        <div className="flex items-start gap-3">
          <Avatar name={email.from.name} />
          <div className="min-w-0 flex-1 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="font-medium text-text">
                {email.from.name}
                {email.from.role ? <span className="font-normal text-secondary"> · {email.from.role}</span> : null}
              </p>
              <time className="text-xs text-tertiary">{email.sentAt}</time>
            </div>
            <p className="text-secondary">
              <span className="text-tertiary">{t("to")} </span>
              {names(email.to)}
            </p>
            {email.cc?.length ? (
              <p className="text-secondary">
                <span className="text-tertiary">{t("cc")} </span>
                {names(email.cc)}
              </p>
            ) : null}
          </div>
        </div>
      </header>
      <div className="whitespace-pre-line p-4 text-[15px] leading-relaxed text-text sm:p-5" dir="auto">
        {email.body}
      </div>
      {email.footnote ? (
        <footer className="border-t border-border px-4 py-3 text-xs leading-relaxed text-secondary sm:px-5" dir="auto">
          {email.footnote}
        </footer>
      ) : null}
    </article>
  );
}

function MemoView({ memo }: { memo: MemoMaterial }) {
  const t = useTranslations("components.documents");
  return (
    <article className="rounded-card border border-border bg-surface p-5 sm:p-8">
      <p className="text-[13px] font-medium text-tertiary">{t("memo")}</p>
      <h3 className="mt-2 text-xl font-semibold text-text" dir="auto">
        {memo.title}
      </h3>
      <p className="mt-1 text-sm text-secondary">
        {memo.author.name}
        {memo.author.role ? `, ${memo.author.role}` : ""}
        {memo.date ? ` · ${memo.date}` : ""}
      </p>
      <div className="reading mt-5 whitespace-pre-line text-[15px] leading-relaxed text-text" dir="auto">
        {memo.body}
      </div>
    </article>
  );
}

/** Column letters A, B, C… like a spreadsheet. */
function columnLetter(i: number) {
  let s = "";
  let n = i + 1;
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function TableView({ table }: { table: TableMaterial }) {
  const n = useNumbers();
  const cell = (v: string | number | null | undefined) => (typeof v === "number" ? n.number(v) : (v ?? ""));
  return (
    <figure className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-card border border-border bg-surface" dir="ltr">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{table.title}</caption>
          <thead>
            <tr className="bg-surface-subtle text-[11px] text-tertiary">
              <th className="w-10 border-b border-e border-border" aria-hidden />
              {table.columns.map((c, i) => (
                <th key={c.key} className="border-b border-e border-border px-3 py-1 font-normal last:border-e-0" aria-hidden>
                  {columnLetter(i)}
                </th>
              ))}
            </tr>
            <tr className="bg-surface-subtle">
              <th className="border-b border-e border-border px-2 py-2 text-[11px] font-normal text-tertiary" aria-hidden>
                1
              </th>
              {table.columns.map((c) => (
                <th
                  key={c.key}
                  scope="col"
                  className={`whitespace-nowrap border-b border-e border-border px-3 py-2 font-semibold text-text last:border-e-0 ${c.numeric ? "text-right" : "text-left"}`}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className="hover:bg-surface-subtle/60">
                <td className="border-b border-e border-border bg-surface-subtle px-2 py-2 text-center text-[11px] text-tertiary tabular" aria-hidden>
                  {ri + 2}
                </td>
                {table.columns.map((c) => (
                  <td
                    key={c.key}
                    className={`whitespace-nowrap border-b border-e border-border px-3 py-2 text-text last:border-e-0 ${c.numeric ? "text-right tabular" : "text-left"}`}
                  >
                    {cell(row[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.caption ? <figcaption className="text-xs text-secondary">{table.caption}</figcaption> : null}
    </figure>
  );
}

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

function ChartView({ chart }: { chart: ChartMaterial }) {
  const n = useNumbers();
  const { dir } = useLocaleSettings();
  const Chart = chart.chartType === "bar" ? BarChart : LineChart;
  return (
    <figure className="flex flex-col gap-3 rounded-card border border-border bg-surface p-4 sm:p-5">
      <figcaption className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-text">{chart.title}</span>
        {chart.caption ? <span className="text-xs text-secondary">{chart.caption}</span> : null}
      </figcaption>
      {chart.series.length > 1 ? (
        <ul className="flex flex-wrap gap-4 text-xs text-secondary">
          {chart.series.map((s, i) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[3px]" style={{ background: SERIES_COLORS[i] }} aria-hidden />
              {s.label}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="h-64 w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={chart.data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis
              dataKey={chart.xKey}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              reversed={dir === "rtl"}
            />
            <YAxis
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={44}
              orientation={dir === "rtl" ? "right" : "left"}
              tickFormatter={(v: number) => n.number(v, { notation: "compact" })}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-subtle)" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                boxShadow: "var(--shadow-popover)",
                fontSize: 12,
                color: "var(--text)",
              }}
              formatter={(v) => (typeof v === "number" ? `${n.number(v)}${chart.unit ? ` ${chart.unit}` : ""}` : String(v))}
            />
            {chart.series.map((s, i) =>
              chart.chartType === "bar" ? (
                <Bar key={s.key} dataKey={s.key} name={s.label} fill={SERIES_COLORS[i]} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
              ) : (
                <Line key={s.key} dataKey={s.key} name={s.label} stroke={SERIES_COLORS[i]} strokeWidth={2} dot={{ r: 3 }} isAnimationActive={false} />
              ),
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
