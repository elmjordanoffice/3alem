import * as React from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from "react-native-svg";
import { BarChart3, FileText, Mail, Table2 } from "lucide-react-native";
import type { ChartMaterial, EmailMaterial, Material, MemoMaterial, TableMaterial } from "../api/types";
import { useLocale, useT } from "../i18n";
import { fonts, radius, useTheme } from "../theme";
import { hairline } from "../ui/primitives";
import { T } from "../ui/text";
import { Avatar } from "../ui/avatar";

export const MATERIAL_ICONS = { email: Mail, memo: FileText, table: Table2, chart: BarChart3 } as const;

/** A material rendered to look like the real thing, legible on a phone. */
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
  const { c } = useTheme();
  const t = useT("components.documents");
  const names = (list: { name: string }[]) => list.map((p) => p.name).join(", ");
  return (
    <View style={{ borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline }}>
      <View style={{ padding: 18, gap: 14, borderBottomWidth: hairline, borderColor: c.hairline }}>
        <T variant="title2">{email.subject}</T>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
          <Avatar name={email.from.name} size={38} />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8, alignItems: "baseline" }}>
              <T variant="subhead" style={{ color: c.text, flex: 1 }} numberOfLines={1}>
                {email.from.name}
              </T>
              <T variant="caption" tone="tertiary">
                {email.sentAt}
              </T>
            </View>
            {email.from.role ? (
              <T variant="caption" tone="secondary">
                {email.from.role}
              </T>
            ) : null}
            <T variant="footnote" tone="secondary">
              <T variant="footnote" tone="tertiary">
                {t("to")}{" "}
              </T>
              {names(email.to)}
            </T>
            {email.cc?.length ? (
              <T variant="footnote" tone="secondary">
                <T variant="footnote" tone="tertiary">
                  {t("cc")}{" "}
                </T>
                {names(email.cc)}
              </T>
            ) : null}
          </View>
        </View>
      </View>
      <View style={{ padding: 18 }}>
        <T variant="body">{email.body}</T>
      </View>
      {email.footnote ? (
        <View style={{ paddingHorizontal: 18, paddingVertical: 14, borderTopWidth: hairline, borderColor: c.hairline }}>
          <T variant="footnote" tone="secondary">
            {email.footnote}
          </T>
        </View>
      ) : null}
    </View>
  );
}

function MemoView({ memo }: { memo: MemoMaterial }) {
  const { c } = useTheme();
  const t = useT("components.documents");
  return (
    <View style={{ borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline, padding: 20, gap: 6 }}>
      <T variant="label" tone="tertiary">
        {t("memo")}
      </T>
      <T variant="title2" style={{ marginTop: 4 }}>
        {memo.title}
      </T>
      <T variant="footnote" tone="secondary">
        {memo.author.name}
        {memo.author.role ? `, ${memo.author.role}` : ""}
        {memo.date ? ` · ${memo.date}` : ""}
      </T>
      <View style={{ height: hairline, backgroundColor: c.hairline, marginVertical: 12 }} />
      <T variant="body">{memo.body}</T>
    </View>
  );
}

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

/** A spreadsheet that scrolls sideways inside its page; numbers right-aligned and tabular. Always left to right. */
function TableView({ table }: { table: TableMaterial }) {
  const { c } = useTheme();
  const { n, rtl } = useLocale();
  const tm = useT("mobile.materials");
  const cell = (v: string | number | null | undefined) => (typeof v === "number" ? n(v) : (v ?? ""));
  const widths = table.columns.map((col) => {
    const longest = Math.max(col.label.length, ...table.rows.map((r) => String(cell(r[col.key])).length));
    return Math.max(76, Math.min(230, Math.round(longest * (rtl ? 9 : 8.2) + 30)));
  });
  const textFont = rtl ? fonts.arabic : fonts.sans;
  const rowNo = 34;
  const Cell = ({ w, children, head, numeric, first, grow }: { w: number; children: React.ReactNode; head?: boolean; numeric?: boolean; first?: boolean; grow?: boolean }) => (
    <View style={{ width: w, flexGrow: grow ? 1 : 0, paddingHorizontal: 10, paddingVertical: 9, borderLeftWidth: first ? 0 : hairline, borderColor: c.hairline, justifyContent: "center", backgroundColor: head ? c.surfaceSubtle : undefined }}>
      <T latin={false} variant="footnote" numberOfLines={2} style={{ color: c.text, fontFamily: head ? textFont[600] : textFont[400], textAlign: numeric ? "right" : "left", writingDirection: "auto", fontVariant: numeric ? ["tabular-nums"] : undefined }}>
        {children}
      </T>
    </View>
  );
  const total = rowNo + widths.reduce((a, b) => a + b, 0);
  return (
    <View style={{ gap: 8 }}>
      <View style={{ borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline, overflow: "hidden", direction: "ltr" }}>
        <ScrollView horizontal showsHorizontalScrollIndicator nestedScrollEnabled bounces={false} accessibilityLabel={table.title} contentContainerStyle={{ flexGrow: 1 }}>
          <View style={{ minWidth: total, flexGrow: 1 }}>
            <View style={{ flexDirection: "row", backgroundColor: c.surfaceSubtle, borderBottomWidth: hairline, borderColor: c.hairline }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <View style={{ width: rowNo }} />
              {table.columns.map((col, i) => (
                <View key={col.key} style={{ width: widths[i], flexGrow: i === table.columns.length - 1 ? 1 : 0, paddingVertical: 3, borderLeftWidth: hairline, borderColor: c.hairline, alignItems: "center" }}>
                  <T variant="caption" latin tone="tertiary" align="center" style={{ fontSize: 10, lineHeight: 13 }}>
                    {columnLetter(i)}
                  </T>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: "row", borderBottomWidth: hairline, borderColor: c.hairline }}>
              <View style={{ width: rowNo, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceSubtle }}>
                <T variant="caption" latin tone="tertiary" align="center" style={{ fontSize: 10 }}>
                  1
                </T>
              </View>
              {table.columns.map((col, i) => (
                <Cell key={col.key} w={widths[i]!} head numeric={col.numeric} grow={i === table.columns.length - 1}>
                  {col.label}
                </Cell>
              ))}
            </View>
            {table.rows.map((row, ri) => (
              <View key={ri} style={{ flexDirection: "row", borderBottomWidth: ri === table.rows.length - 1 ? 0 : hairline, borderColor: c.hairline }}>
                <View style={{ width: rowNo, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceSubtle }}>
                  <T variant="caption" latin tone="tertiary" align="center" style={{ fontSize: 10 }}>
                    {ri + 2}
                  </T>
                </View>
                {table.columns.map((col, i) => (
                  <Cell key={col.key} w={widths[i]!} numeric={col.numeric} grow={i === table.columns.length - 1}>
                    {cell(row[col.key])}
                  </Cell>
                ))}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      {table.caption ? (
        <T variant="footnote" tone="secondary">
          {table.caption}
        </T>
      ) : null}
      {total > 360 ? (
        <T variant="caption" tone="tertiary">
          {tm("scrollTable")}
        </T>
      ) : null}
    </View>
  );
}

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / p;
  const step = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return step * p;
}

/** Bars or lines drawn with react-native-svg; time runs right to left in Arabic, as on the web. */
function ChartView({ chart }: { chart: ChartMaterial }) {
  const { c } = useTheme();
  const { n, rtl } = useLocale();
  const { width: screenW } = useWindowDimensions();
  const W = Math.min(screenW, 560) - 40 - 32;
  const H = 210;
  const padL = rtl ? 8 : 40;
  const padR = rtl ? 40 : 8;
  const padT = 10;
  const data = rtl ? [...chart.data].reverse() : chart.data;
  // Axis labels never collide. A shared leading word ("Week 1", "Week 2"…) is said once
  // under the axis; whatever still doesn't fit alternates two rows and is trimmed.
  const raw = data.map((d) => String(d[chart.xKey] ?? ""));
  const bandGuess = (W - 48) / Math.max(1, data.length);
  const fits = (s: string, w: number) => s.length * 6.1 <= w;
  const words = raw.map((l) => l.split(/\s+/));
  let shared = 0;
  while (raw.length > 1 && words.every((w) => w.length > shared + 1 && w[shared] === words[0]![shared])) shared++;
  const crowded = raw.some((l) => !fits(l, bandGuess - 4));
  const axisTitle = crowded && shared ? words[0]!.slice(0, shared).join(" ") : "";
  const labels = axisTitle ? words.map((w) => w.slice(shared).join(" ")) : raw;
  const stagger = labels.some((l) => !fits(l, bandGuess - 4));
  const trim = (s: string, w: number) => (fits(s, w) ? s : `${s.slice(0, Math.max(2, Math.floor(w / 6.1) - 1))}…`);
  const padB = stagger ? 40 : 28;
  const values = data.flatMap((d) => chart.series.map((s) => Number(d[s.key] ?? 0)));
  const max = niceMax(Math.max(0, ...values));
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const x0 = padL;
  const yOf = (v: number) => padT + plotH - (v / max) * plotH;
  const band = plotW / Math.max(1, data.length);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * max);
  const compact = (v: number) => n(v, { notation: "compact", maximumFractionDigits: 1 });
  const labelFont = rtl ? fonts.arabic[400] : fonts.sans[400];
  const every = Math.ceil(data.length / 7);
  const summary = chart.series.map((s) => `${s.label}: ${data.map((d) => `${d[chart.xKey]} ${d[s.key] ?? ""}`).join(", ")}`).join(". ");

  return (
    <View style={{ borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline, padding: 16, gap: 10 }}>
      <View style={{ gap: 2 }}>
        <T variant="headline">{chart.title}</T>
        {chart.caption ? (
          <T variant="footnote" tone="secondary">
            {chart.caption}
          </T>
        ) : null}
      </View>
      {chart.series.length > 1 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          {chart.series.map((s, i) => (
            <View key={s.key} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: c.chart[i] }} />
              <T variant="caption" tone="secondary">
                {s.label}
              </T>
            </View>
          ))}
        </View>
      ) : null}
      <View accessible accessibilityRole="image" accessibilityLabel={`${chart.title}. ${summary}${chart.unit ? ` ${chart.unit}` : ""}`}>
        <Svg width={W} height={H}>
          {ticks.map((v) => (
            <G key={v}>
              <Line x1={x0} x2={x0 + plotW} y1={yOf(v)} y2={yOf(v)} stroke={c.chartGrid} strokeWidth={1} />
              <SvgText x={rtl ? x0 + plotW + 6 : x0 - 6} y={yOf(v) + 4} fontSize={10.5} fill={c.tertiary} textAnchor={rtl ? "start" : "end"} fontFamily={fonts.sans[400]}>
                {compact(v)}
              </SvgText>
            </G>
          ))}
          {chart.chartType === "bar"
            ? data.map((d, di) => {
                const groupW = Math.min(band * 0.72, 44 * chart.series.length);
                const barW = groupW / chart.series.length;
                const gx = x0 + di * band + (band - groupW) / 2;
                return chart.series.map((s, si) => {
                  const v = Number(d[s.key] ?? 0);
                  const y = yOf(v);
                  const h = Math.max(0, padT + plotH - y);
                  const r = Math.min(4, barW / 2, h);
                  const x = gx + si * barW + 1;
                  const w = barW - 2;
                  // Rounded top corners only.
                  const path = `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
                  return <Path key={`${di}-${s.key}`} d={path} fill={c.chart[si]} />;
                });
              })
            : chart.series.map((s, si) => {
                const pts = data.map((d, di) => [x0 + di * band + band / 2, yOf(Number(d[s.key] ?? 0))] as const);
                return (
                  <G key={s.key}>
                    <Path d={pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ")} stroke={c.chart[si]} strokeWidth={2.2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
                    {pts.map((p, i) => (
                      <Circle key={i} cx={p[0]} cy={p[1]} r={3.2} fill={c.surface} stroke={c.chart[si]} strokeWidth={2} />
                    ))}
                  </G>
                );
              })}
          <Line x1={x0} x2={x0 + plotW} y1={padT + plotH} y2={padT + plotH} stroke={c.hairlineStrong} strokeWidth={1} />
          {labels.map((l, di) =>
            di % every === 0 ? (
              <SvgText key={di} x={x0 + di * band + band / 2} y={stagger && di % 2 ? H - 6 : H - (stagger ? 20 : 8)} fontSize={10.5} fill={c.secondary} textAnchor="middle" fontFamily={labelFont}>
                {trim(l, stagger ? band * 1.9 - 6 : band - 4)}
              </SvgText>
            ) : null,
          )}
          <Rect x={0} y={0} width={0} height={0} />
        </Svg>
      </View>
      {chart.unit || axisTitle ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <T variant="caption" tone="tertiary">
            {chart.unit ?? ""}
          </T>
          {axisTitle ? (
            <T variant="caption" tone="tertiary">
              {axisTitle}
            </T>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
