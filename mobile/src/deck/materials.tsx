import * as React from "react";
import { ScrollView, useWindowDimensions, View, type NativeScrollEvent, type NativeSyntheticEvent } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import { BarChart3, FileText, Mail, MoveHorizontal, Table2 } from "lucide-react-native";
import type { ChartMaterial, EmailMaterial, Material, MemoMaterial, TableMaterial } from "../api/types";
import { useLocale, useT } from "../i18n";
import { fonts, radius, useTheme } from "../theme";
import { hairline } from "../ui/primitives";
import { Paragraphs, T } from "../ui/text";
import { Avatar } from "../ui/avatar";
import { CARD_INSET, CARD_MAX_W, CARD_PAD, useCardGeometry } from "./pager-context";

export const MATERIAL_ICONS = { email: Mail, memo: FileText, table: Table2, chart: BarChart3 } as const;

/** The width inside a card's padding. */
function useInnerWidth() {
  const geo = useCardGeometry();
  const { width } = useWindowDimensions();
  return (geo?.width ?? Math.min(width - CARD_INSET * 2, CARD_MAX_W)) - CARD_PAD * 2;
}

/**
 * One material as the content of a paper card, made to look like the real
 * thing: an email like a mail app, a memo on letterhead, a table like a
 * spreadsheet, a chart framed like a report. Memoised: it renders once per
 * scene, never on a page change or a keystroke.
 */
export const MaterialCard = React.memo(function MaterialCard({ material, n, total, company }: { material: Material; n: number; total: number; company: string }) {
  const tm = useT("mobile.deck");
  const counter = total > 1 ? tm("material", { n, total }) : undefined;
  switch (material.kind) {
    case "email":
      return <EmailCard email={material} counter={counter} />;
    case "memo":
      return <MemoCard memo={material} counter={counter} company={company} />;
    case "table":
      return <TableCard table={material} counter={counter} />;
    case "chart":
      return <ChartCard chart={material} counter={counter} />;
  }
});

/** A material card's eyebrow: what it is (icon and kind), and where it falls among the scene's materials. */
function Eyebrow({ kind, counter }: { kind: keyof typeof MATERIAL_ICONS; counter?: string }) {
  const { c } = useTheme();
  const tm = useT("mobile.materials");
  const Icon = MATERIAL_ICONS[kind];
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.accentSubtle, alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={c.accentText} strokeWidth={2} />
      </View>
      <T variant="label" tone="secondary" style={{ flexShrink: 1 }}>
        {tm(kind)}
      </T>
      {counter ? (
        <T variant="caption" tone="tertiary" style={{ marginStart: "auto" }}>
          {counter}
        </T>
      ) : null}
    </View>
  );
}

function EmailCard({ email, counter }: { email: EmailMaterial; counter?: string }) {
  const { c } = useTheme();
  const t = useT("components.documents");
  const { rtl } = useLocale();
  // The Arabic comma between names in Arabic.
  const names = (list: { name: string }[]) => list.map((p) => p.name).join(rtl ? "، " : ", ");
  return (
    <View style={{ gap: 18 }}>
      <Eyebrow kind="email" counter={counter} />
      <T variant="prompt" accessibilityRole="header">
        {email.subject}
      </T>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Avatar name={email.from.name} size={42} />
        <View style={{ flex: 1, gap: 1 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "baseline" }}>
            <T variant="headline" numberOfLines={1} style={{ flex: 1 }}>
              {email.from.name}
            </T>
            <T variant="caption" tone="tertiary">
              {email.sentAt}
            </T>
          </View>
          {email.from.role ? (
            <T variant="footnote" tone="secondary" numberOfLines={2}>
              {email.from.role}
            </T>
          ) : null}
        </View>
      </View>
      <View style={{ gap: 4, paddingVertical: 12, paddingHorizontal: 14, borderRadius: radius.field, backgroundColor: c.surfaceSubtle }}>
        <AddressLine label={t("to")} value={names(email.to)} />
        {email.cc?.length ? <AddressLine label={t("cc")} value={names(email.cc)} /> : null}
      </View>
      <Paragraphs text={email.body} variant="body" gap={16} />
      {email.footnote ? <Quote text={email.footnote} /> : null}
    </View>
  );
}

function AddressLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      <T variant="footnote" tone="tertiary" style={{ minWidth: 30 }}>
        {label}
      </T>
      <T variant="footnote" tone="secondary" style={{ flex: 1 }}>
        {value}
      </T>
    </View>
  );
}

/** A quoted aside (a forwarded line, a signature note): quiet, set in from the reading start behind a violet bar. */
function Quote({ text }: { text: string }) {
  const { c } = useTheme();
  return (
    <View style={{ borderStartWidth: 3, borderColor: c.accent, backgroundColor: c.surfaceSubtle, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14 }}>
      <T variant="footnote" tone="secondary">
        {text}
      </T>
    </View>
  );
}

/** Letterhead: the company, a short violet rule, "Memo" heavy and tight, then who and when, then the memo. */
function MemoCard({ memo, counter, company }: { memo: MemoMaterial; counter?: string; company: string }) {
  const { c } = useTheme();
  const t = useT("components.documents");
  const tm = useT("mobile.materials");
  const { rtl } = useLocale();
  return (
    <View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <T variant="headline" numberOfLines={1} style={{ flex: 1 }}>
          {company}
        </T>
        {counter ? (
          <T variant="caption" tone="tertiary">
            {counter}
          </T>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", gap: 4, marginTop: 12 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: c.accent }} />
        <View style={{ width: 12, height: 4, borderRadius: 2, backgroundColor: c.blue }} />
      </View>
      <T variant="display" accessibilityRole="header" style={{ marginTop: 20 }}>
        {t("memo")}
      </T>
      <T variant="title2" style={{ marginTop: 8 }}>
        {memo.title}
      </T>
      <View style={{ marginTop: 16, borderTopWidth: hairline, borderColor: c.hairline }}>
        <MemoRow label={tm("from")} value={`${memo.author.name}${memo.author.role ? `${rtl ? "، " : ", "}${memo.author.role}` : ""}`} />
        {memo.date ? <MemoRow label={tm("date")} value={memo.date} /> : null}
      </View>
      <View style={{ marginTop: 20 }}>
        <Paragraphs text={memo.body} variant="body" gap={16} />
      </View>
    </View>
  );
}

function MemoRow({ label, value }: { label: string; value: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 12, paddingVertical: 10, borderBottomWidth: hairline, borderColor: c.hairline }}>
      <T variant="footnote" tone="tertiary" style={{ width: 64 }}>
        {label}
      </T>
      <T variant="subhead" style={{ flex: 1 }}>
        {value}
      </T>
    </View>
  );
}

function TableCard({ table, counter }: { table: TableMaterial; counter?: string }) {
  return (
    <View style={{ gap: 16 }}>
      <Eyebrow kind="table" counter={counter} />
      <T variant="title2" accessibilityRole="header">
        {table.title}
      </T>
      <Sheet table={table} />
      {table.caption ? (
        <T variant="footnote" tone="secondary">
          {table.caption}
        </T>
      ) : null}
    </View>
  );
}

/** A soft fade at one edge of a sideways scroller, into the card's colour. */
function EdgeFade({ side, color }: { side: "left" | "right"; color: string }) {
  const id = `fade${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, bottom: 0, width: 28, [side]: 0 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={id} x1={side === "right" ? "0" : "1"} y1="0" x2={side === "right" ? "1" : "0"} y2="0">
            <Stop offset="0" stopColor={color} stopOpacity={0} />
            <Stop offset="1" stopColor={color} stopOpacity={0.95} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

/**
 * A spreadsheet: a header row, zebra rows, numbers right-aligned in tabular
 * figures. The first column stays put while the rest scroll sideways inside
 * the card, with a soft fade at the edge that has more and a one-line hint
 * when it overflows. Always left to right, as spreadsheets are.
 */
function Sheet({ table }: { table: TableMaterial }) {
  const { c } = useTheme();
  const { n, rtl } = useLocale();
  const tm = useT("mobile.materials");
  const inner = useInnerWidth();
  const cell = (v: string | number | null | undefined) => (typeof v === "number" ? n(v) : (v ?? ""));
  const charW = rtl ? 8.6 : 7.8;
  const longest = (key: string, label: string) => Math.max(label.length, ...table.rows.map((r) => String(cell(r[key])).length));
  const [first, ...rest] = table.columns;
  const firstW = first ? Math.round(Math.max(96, Math.min(inner * 0.42, longest(first.key, first.label) * charW + 26))) : 0;
  const widths = rest.map((col) => Math.round(Math.max(78, Math.min(200, longest(col.key, col.label) * charW + 28))));
  const restW = widths.reduce((a, b) => a + b, 0);
  const rowH = rtl ? 52 : 44;
  const textFont = rtl ? fonts.arabic : fonts.sans;

  const [overflow, setOverflow] = React.useState(false);
  const [edges, setEdges] = React.useState({ start: true, end: false });
  const viewW = React.useRef(0);
  const contentW = React.useRef(0);
  const measure = () => setOverflow(contentW.current > viewW.current + 1);
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const start = contentOffset.x <= 2;
    const end = contentOffset.x + layoutMeasurement.width >= contentSize.width - 2;
    setEdges((p) => (p.start === start && p.end === end ? p : { start, end }));
  };

  // A plain function, not a component: the cells are never remounted when the fades toggle.
  const renderCell = ({ w, children, head, numeric, label, zebra, grow }: { w: number; children: React.ReactNode; head?: boolean; numeric?: boolean; label?: boolean; zebra?: boolean; grow?: boolean }) => (
    <View style={{ width: w, flexGrow: grow ? 1 : 0, height: rowH, paddingHorizontal: 12, justifyContent: "center", backgroundColor: head ? c.surfaceSunken : zebra ? c.surfaceSubtle : c.surface }}>
      <T
        latin={false}
        variant="footnote"
        numberOfLines={2}
        style={{ color: head ? c.secondary : c.text, fontFamily: head || label ? textFont[600] : textFont[400], textAlign: numeric ? "right" : "left", writingDirection: "auto", fontVariant: numeric ? ["tabular-nums"] : undefined }}
      >
        {children}
      </T>
    </View>
  );
  const cellAt = (key: React.Key, p: Parameters<typeof renderCell>[0]) => <React.Fragment key={key}>{renderCell(p)}</React.Fragment>;

  if (!first) return null;
  return (
    <View style={{ gap: 10 }}>
      <View accessibilityLabel={table.title} style={{ direction: "ltr", flexDirection: "row", borderRadius: radius.control, borderWidth: hairline, borderColor: c.hairline, overflow: "hidden", backgroundColor: c.surface }}>
        <View style={{ width: firstW, borderRightWidth: rest.length ? hairline : 0, borderColor: c.hairlineStrong, zIndex: 1 }}>
          {cellAt("head", { w: firstW, head: true, numeric: first.numeric, children: first.label })}
          {table.rows.map((r, ri) => cellAt(ri, { w: firstW, label: true, numeric: first.numeric, zebra: ri % 2 === 1, children: cell(r[first.key]) }))}
        </View>
        {rest.length ? (
          <View style={{ flex: 1 }}>
            <ScrollView
              horizontal
              nestedScrollEnabled
              bounces={false}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={32}
              onScroll={onScroll}
              onLayout={(e) => {
                viewW.current = e.nativeEvent.layout.width;
                measure();
              }}
              onContentSizeChange={(w) => {
                contentW.current = w;
                measure();
              }}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <View style={{ minWidth: restW, flexGrow: 1 }}>
                <View style={{ flexDirection: "row" }}>
                  {rest.map((col, i) => cellAt(col.key, { w: widths[i]!, head: true, numeric: col.numeric, grow: i === rest.length - 1, children: col.label }))}
                </View>
                {table.rows.map((r, ri) => (
                  <View key={ri} style={{ flexDirection: "row" }}>
                    {rest.map((col, i) => cellAt(col.key, { w: widths[i]!, numeric: col.numeric, zebra: ri % 2 === 1, grow: i === rest.length - 1, children: cell(r[col.key]) }))}
                  </View>
                ))}
              </View>
            </ScrollView>
            {overflow && !edges.start ? <EdgeFade side="left" color={c.surface} /> : null}
            {overflow && !edges.end ? <EdgeFade side="right" color={c.surface} /> : null}
          </View>
        ) : null}
      </View>
      {overflow ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <MoveHorizontal size={14} color={c.tertiary} strokeWidth={2} />
          <T variant="caption" tone="tertiary" numberOfLines={1} style={{ flexShrink: 1 }}>
            {tm("scrollTable")}
          </T>
        </View>
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

function ChartCard({ chart, counter }: { chart: ChartMaterial; counter?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 16 }}>
      <Eyebrow kind="chart" counter={counter} />
      <T variant="title2" accessibilityRole="header">
        {chart.title}
      </T>
      {chart.series.length > 1 ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14 }}>
          {chart.series.map((s, i) => (
            <View key={s.key} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c.chart[i] }} />
              <T variant="caption" tone="secondary">
                {s.label}
              </T>
            </View>
          ))}
        </View>
      ) : null}
      <Chart chart={chart} />
      {chart.caption ? (
        <T variant="footnote" tone="secondary">
          {chart.caption}
        </T>
      ) : null}
    </View>
  );
}

/** Bars or lines drawn with react-native-svg; time runs right to left in Arabic, as on the web. */
function Chart({ chart }: { chart: ChartMaterial }) {
  const { c } = useTheme();
  const { n, rtl } = useLocale();
  const W = useInnerWidth();
  const H = 220;
  const padL = rtl ? 6 : 38;
  const padR = rtl ? 38 : 6;
  const padT = 12;
  const data = rtl ? [...chart.data].reverse() : chart.data;
  // Axis labels never collide. A shared leading word ("Week 1", "Week 2"…) is said once
  // under the axis; whatever still doesn't fit alternates two rows and is trimmed.
  const raw = data.map((d) => String(d[chart.xKey] ?? ""));
  const bandGuess = (W - 44) / Math.max(1, data.length);
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
  // Night's glowing data: bars fade from their colour into the card; lines sit on a soft wash of theirs.
  const gid = `chart${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <View style={{ gap: 6 }}>
      <View accessible accessibilityRole="image" accessibilityLabel={`${chart.title}. ${summary}${chart.unit ? ` ${chart.unit}` : ""}`}>
        <Svg width={W} height={H}>
          <Defs>
            {chart.series.map((s, si) => (
              <LinearGradient key={s.key} id={`${gid}-${si}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={c.chart[si]} stopOpacity={chart.chartType === "bar" ? 1 : 0.28} />
                <Stop offset="1" stopColor={c.chart[si]} stopOpacity={chart.chartType === "bar" ? 0.5 : 0} />
              </LinearGradient>
            ))}
          </Defs>
          {ticks.map((v, k) => (
            <G key={v}>
              {k > 0 ? <Line x1={x0} x2={x0 + plotW} y1={yOf(v)} y2={yOf(v)} stroke={c.chartGrid} strokeWidth={1} strokeDasharray="2 4" /> : null}
              <SvgText x={rtl ? x0 + plotW + 6 : x0 - 6} y={yOf(v) + 4} fontSize={10.5} fill={c.tertiary} textAnchor={rtl ? "start" : "end"} fontFamily={fonts.sans[400]}>
                {compact(v)}
              </SvgText>
            </G>
          ))}
          {chart.chartType === "bar"
            ? data.map((d, di) => {
                const groupW = Math.min(band * 0.68, 40 * chart.series.length);
                const barW = groupW / chart.series.length;
                const gx = x0 + di * band + (band - groupW) / 2;
                return chart.series.map((s, si) => {
                  const v = Number(d[s.key] ?? 0);
                  const y = yOf(v);
                  const h = Math.max(0, padT + plotH - y);
                  const r = Math.min(6, barW / 2, h);
                  const x = gx + si * barW + 1.5;
                  const w = barW - 3;
                  // Rounded top corners only.
                  const path = `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
                  return <Path key={`${di}-${s.key}`} d={path} fill={`url(#${gid}-${si})`} />;
                });
              })
            : chart.series.map((s, si) => {
                const pts = data.map((d, di) => [x0 + di * band + band / 2, yOf(Number(d[s.key] ?? 0))] as const);
                const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
                const first = pts[0];
                const lastPt = pts[pts.length - 1];
                return (
                  <G key={s.key}>
                    {first && lastPt && chart.series.length === 1 ? <Path d={`${line} L${lastPt[0]},${padT + plotH} L${first[0]},${padT + plotH} Z`} fill={`url(#${gid}-${si})`} /> : null}
                    <Path d={line} stroke={c.chart[si]} strokeWidth={2.6} fill="none" strokeLinejoin="round" strokeLinecap="round" />
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
