import * as React from "react";
import { View, type LayoutChangeEvent } from "react-native";
import { GestureDetector, usePanGesture, useTapGesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Minus, Plus } from "lucide-react-native";
import { useLocale, useT } from "../i18n";
import { radius, spring, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { draftKey, useDraft } from "../state/drafts";
import { Press } from "../ui/press";
import { hairline } from "../ui/primitives";
import { T } from "../ui/text";
import { Editor, SummaryLine, TaskHeader } from "./parts";
import { RankList } from "./rank-list";
import { MIN_REASON, type TaskContext, type TaskResult } from "./types";

/** Rank 5–7 entries, then say what made the top two the top two. */
export function useRankingTask(ctx: TaskContext): TaskResult {
  const t = useT("candidate");
  const tm = useT("mobile.deck");
  const { content, item, locked } = ctx;
  const entries = content.task.rankItems ?? [];
  const [draft, setDraft] = useDraft(draftKey(item.id, "MAIN"), { order: entries.map((e) => e.id), reasoning: "" }, ctx.onSaveState);
  const value = draft.reasoning.trim().length >= MIN_REASON ? { kind: "ranking" as const, order: draft.order, reasoning: draft.reasoning } : null;
  const label = (id: string) => entries.find((e) => e.id === id)?.label ?? id;

  const slides = [
    {
      key: "rank",
      node: (
        <View style={{ gap: 18 }}>
          <TaskHeader label={t("item.yourTask")} prompt={content.task.prompt} />
          <T variant="footnote" tone="tertiary">
            {tm("holdToDrag")}
          </T>
          <RankList label={content.task.prompt} entries={entries} order={draft.order} disabled={locked} onChange={(order) => setDraft((d) => ({ ...d, order }))} onDragging={(on) => ctx.setPagingEnabled(!on)} />
        </View>
      ),
    },
    {
      key: "why",
      node: (
        <View style={{ gap: 18 }}>
          <TaskHeader label={t("item.yourTask")} context={draft.order.slice(0, 2).map((id, i) => `${i + 1}. ${label(id)}`).join("   ")} />
          <Editor label={t("tasks.rankingReasonLabel")} hint={t("tasks.rankingReasonHint")} value={draft.reasoning} disabled={locked} minHeight={180} onChange={(s) => setDraft((d) => ({ ...d, reasoning: s }))} />
        </View>
      ),
    },
  ];

  const summary = (
    <View style={{ gap: 12 }}>
      <SummaryLine value={draft.order.map((id, i) => `${i + 1}. ${label(id)}`).join("\n")} />
      {draft.reasoning ? <SummaryLine label={t("tasks.rankingReasonLabel")} value={draft.reasoning} /> : null}
    </View>
  );
  return { slides, value, summary };
}

/** Split a fixed budget. A row can never take more than what's left. */
export function useAllocationTask(ctx: TaskContext): TaskResult {
  const t = useT("candidate");
  const ta = useT("components.allocation");
  const { c } = useTheme();
  const { content, item, locked } = ctx;
  const alloc = content.task.allocation!;
  const [draft, setDraft] = useDraft(draftKey(item.id, "MAIN"), { values: {} as Record<string, number>, reasoning: "" }, ctx.onSaveState);
  const used = alloc.rows.reduce((s, r) => s + (draft.values[r.id] ?? 0), 0);
  const remaining = alloc.total - used;
  const ok = used === alloc.total && draft.reasoning.trim().length >= MIN_REASON;
  const value = ok ? { kind: "allocation" as const, values: Object.fromEntries(alloc.rows.map((r) => [r.id, draft.values[r.id] ?? 0])), reasoning: draft.reasoning } : null;

  const set = (id: string, raw: number) =>
    setDraft((d) => {
      const others = alloc.rows.reduce((s, r) => s + (r.id === id ? 0 : (d.values[r.id] ?? 0)), 0);
      const next = Math.max(0, Math.min(Math.round(raw), alloc.total - others));
      if (next === (d.values[id] ?? 0)) return d;
      return { ...d, values: { ...d.values, [id]: next } };
    });
  const step = alloc.total >= 50 ? 5 : 1;

  const slides = [
    {
      key: "split",
      node: (
        <View style={{ gap: 18 }}>
          <TaskHeader label={t("item.yourTask")} prompt={content.task.prompt} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, paddingHorizontal: 14, borderRadius: radius.control, backgroundColor: c.surfaceSunken }}>
            <T variant="subhead" tone="secondary">
              {ta("total", { total: alloc.total })}
            </T>
            <T variant="headline" accessibilityLiveRegion="polite" style={{ color: remaining === 0 ? c.text : c.signalInk }}>
              {remaining === 0 ? ta("allAllocated") : ta("remaining", { count: remaining, formatted: String(remaining) })}
            </T>
          </View>
          <View style={{ gap: 14 }}>
            {alloc.rows.map((r) => (
              <AllocationRow key={r.id} label={r.label} detail={r.detail} value={draft.values[r.id] ?? 0} total={alloc.total} max={(draft.values[r.id] ?? 0) + remaining} step={step} disabled={locked} onChange={(v) => set(r.id, v)} unit={ta("points")} onSliding={(on) => ctx.setPagingEnabled(!on)} />
            ))}
          </View>
        </View>
      ),
    },
    {
      key: "why",
      node: (
        <View style={{ gap: 18 }}>
          <TaskHeader label={t("item.yourTask")} />
          <Editor label={t("tasks.allocationReasonLabel")} hint={t("tasks.allocationReasonHint")} value={draft.reasoning} disabled={locked} minHeight={180} onChange={(s) => setDraft((d) => ({ ...d, reasoning: s }))} />
        </View>
      ),
    },
  ];

  const summary = (
    <View style={{ gap: 12 }}>
      <SummaryLine value={alloc.rows.map((r) => `${r.label}: ${draft.values[r.id] ?? 0}`).join("\n")} />
      {draft.reasoning ? <SummaryLine label={t("tasks.allocationReasonLabel")} value={draft.reasoning} /> : null}
    </View>
  );
  return { slides, value, summary };
}

function AllocationRow({ label, detail, value, total, max, step, disabled, onChange, unit, onSliding }: { label: string; detail?: string; value: number; total: number; max: number; step: number; disabled?: boolean; onChange: (v: number) => void; unit: string; onSliding: (on: boolean) => void }) {
  const { c } = useTheme();
  const { rtl } = useLocale();
  const [width, setWidth] = React.useState(0);
  const w = useSharedValue(0);
  const fill = useAnimatedStyle(() => ({ width: withSpring(w.value ? (value / total) * w.value : 0, spring.pop) }));
  const last = React.useRef(value);

  const setFromX = React.useCallback(
    (x: number) => {
      if (!width) return;
      const k = Math.max(0, Math.min(1, (rtl ? width - x : x) / width));
      const v = Math.min(max, Math.round(k * total));
      if (v !== last.current) {
        last.current = v;
        if (v === max && max < total) haptic.boundary();
        else if (v % step === 0) haptic.tick();
        onChange(v);
      }
    },
    [width, rtl, max, total, step, onChange],
  );
  last.current = value;

  const pan = usePanGesture({
    enabled: !disabled,
    activeOffsetX: [-4, 4],
    failOffsetY: [-14, 14],
    onActivate: () => {
      "worklet";
      scheduleOnRN(onSliding, true);
    },
    onUpdate: (e) => {
      "worklet";
      scheduleOnRN(setFromX, e.x);
    },
    onFinalize: () => {
      "worklet";
      scheduleOnRN(onSliding, false);
    },
  });
  const tap = useTapGesture({
    enabled: !disabled,
    onActivate: (e) => {
      "worklet";
      scheduleOnRN(setFromX, e.x);
    },
  });

  const bump = (d: number) => {
    const next = Math.max(0, Math.min(max, value + d));
    if (next !== value) {
      haptic.select();
      onChange(next);
    } else haptic.boundary();
  };

  return (
    <View style={{ gap: 10, padding: 14, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: hairline, borderColor: c.hairline }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <T variant="subhead" style={{ color: c.text }}>
            {label}
          </T>
          {detail ? (
            <T variant="caption" tone="secondary">
              {detail}
            </T>
          ) : null}
        </View>
        <Press depth={0.9} disabled={disabled || value <= 0} onPress={() => bump(-step)} accessibilityLabel={`− ${step} ${unit}, ${label}`} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceSunken, opacity: value <= 0 ? 0.4 : 1 }}>
          <Minus size={18} color={c.text} />
        </Press>
        <View style={{ minWidth: 52, alignItems: "center" }}>
          <T variant="headline" latin align="center" style={{ fontVariant: ["tabular-nums"] }}>
            {value}
          </T>
          <T variant="caption" tone="tertiary" align="center">
            {unit}
          </T>
        </View>
        <Press depth={0.9} disabled={disabled || value >= max} onPress={() => bump(step)} accessibilityLabel={`+ ${step} ${unit}, ${label}`} style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: c.surfaceSunken, opacity: value >= max ? 0.4 : 1 }}>
          <Plus size={18} color={c.text} />
        </Press>
      </View>
      <GestureDetector gesture={pan}>
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={label}
          accessibilityValue={{ min: 0, max: total, now: value, text: `${value} ${unit}` }}
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={(e) => bump(e.nativeEvent.actionName === "increment" ? step : -step)}
          onLayout={(e: LayoutChangeEvent) => {
            setWidth(e.nativeEvent.layout.width);
            w.value = e.nativeEvent.layout.width;
          }}
          style={{ height: 28, justifyContent: "center" }}
        >
          <GestureDetector gesture={tap}>
            <View style={{ height: 28, justifyContent: "center" }}>
              <View style={{ height: 6, borderRadius: 3, backgroundColor: c.surfaceSunken, overflow: "hidden", flexDirection: "row" }}>
                <Animated.View style={[{ height: 6, borderRadius: 3, backgroundColor: c.text }, fill]} />
              </View>
            </View>
          </GestureDetector>
        </View>
      </GestureDetector>
    </View>
  );
}
