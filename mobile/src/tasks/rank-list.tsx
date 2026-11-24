import * as React from "react";
import { AccessibilityInfo, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withSpring, withTiming, type SharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react-native";
import { useT } from "../i18n";
import { fonts, radius, spring, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { Press } from "../ui/press";
import { T } from "../ui/text";

export interface RankEntry {
  id: string;
  label: string;
  detail?: string;
}

const GAP = 8;

/**
 * Drag to reorder: press and hold a row, then move it. Rows part with a spring
 * as it passes, with a haptic tick at every slot. Up/down buttons on each row
 * are a second, simpler path for VoiceOver, TalkBack and switch users.
 */
export function RankList({ entries, order, onChange, disabled, onDragging, label }: { entries: RankEntry[]; order: string[]; onChange: (order: string[]) => void; disabled?: boolean; onDragging?: (on: boolean) => void; label: string }) {
  const t = useT("components.ranking");
  const rowH = entries.some((e) => e.detail) ? 84 : 66;
  const slot = rowH + GAP;
  const ids = order.filter((id) => entries.some((e) => e.id === id));
  const positions = useSharedValue<Record<string, number>>(Object.fromEntries(ids.map((id, i) => [id, i])));
  const dragging = useSharedValue<string>("");

  // Keep positions in step with the committed order (buttons, drafts).
  React.useEffect(() => {
    positions.value = Object.fromEntries(ids.map((id, i) => [id, i]));
  }, [ids.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  const move = React.useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= ids.length || from === to) return;
      const next = [...ids];
      const [x] = next.splice(from, 1);
      next.splice(to, 0, x!);
      onChange(next);
      haptic.select();
      const e = entries.find((en) => en.id === x);
      AccessibilityInfo.announceForAccessibility(t("moved", { item: e?.label ?? "", position: to + 1, total: ids.length }));
    },
    [ids, onChange, entries, t],
  );

  const commit = React.useCallback(
    (pos: Record<string, number>) => {
      const next = [...ids].sort((a, b) => (pos[a] ?? 0) - (pos[b] ?? 0));
      if (next.join("|") !== ids.join("|")) onChange(next);
    },
    [ids, onChange],
  );

  return (
    <View accessibilityLabel={label} style={{ height: ids.length * slot - GAP }}>
      {ids.map((id, index) => {
        const e = entries.find((x) => x.id === id)!;
        return <Row key={id} entry={e} index={index} total={ids.length} rowH={rowH} slot={slot} positions={positions} dragging={dragging} disabled={disabled} onMove={move} onCommit={commit} onDragging={onDragging} />;
      })}
    </View>
  );
}

function Row({
  entry,
  index,
  total,
  rowH,
  slot,
  positions,
  dragging,
  disabled,
  onMove,
  onCommit,
  onDragging,
}: {
  entry: RankEntry;
  index: number;
  total: number;
  rowH: number;
  slot: number;
  positions: SharedValue<Record<string, number>>;
  dragging: SharedValue<string>;
  disabled?: boolean;
  onMove: (from: number, to: number) => void;
  onCommit: (pos: Record<string, number>) => void;
  onDragging?: (on: boolean) => void;
}) {
  const { c } = useTheme();
  const t = useT("components.ranking");
  const id = entry.id;
  const top = useSharedValue(index * slot);
  const lifted = useSharedValue(0);
  const startTop = useSharedValue(0);
  const [pos, setPos] = React.useState(index);

  // Follow the shared order unless this row is the one under the finger.
  useAnimatedReaction(
    () => positions.value[id] ?? 0,
    (p, prev) => {
      if (dragging.value !== id && p !== prev) top.value = withSpring(p * slot, spring.page);
      if (p !== prev) scheduleOnRN(setPos, p);
    },
    [slot],
  );

  const tick = React.useCallback(() => haptic.tick(), []);
  const lift = React.useCallback(() => {
    haptic.lift();
    onDragging?.(true);
  }, [onDragging]);
  const drop = React.useCallback(
    (p: Record<string, number>) => {
      onDragging?.(false);
      onCommit(p);
    },
    [onCommit, onDragging],
  );

  const pan = usePanGesture({
    enabled: !disabled,
    activateAfterLongPress: 220,
    onActivate: () => {
      "worklet";
      dragging.value = id;
      startTop.value = top.value;
      lifted.value = withSpring(1, spring.pop);
      scheduleOnRN(lift);
    },
    onUpdate: (e) => {
      "worklet";
      if (dragging.value !== id) return;
      const max = (total - 1) * slot;
      const y = Math.max(-12, Math.min(max + 12, startTop.value + e.translationY));
      top.value = y;
      const from = positions.value[id] ?? 0;
      const to = Math.max(0, Math.min(total - 1, Math.round(y / slot)));
      if (to !== from) {
        const next: Record<string, number> = { ...positions.value };
        for (const k of Object.keys(next)) {
          const p = next[k]!;
          if (k === id) continue;
          if (from < to && p > from && p <= to) next[k] = p - 1;
          else if (from > to && p < from && p >= to) next[k] = p + 1;
        }
        next[id] = to;
        positions.value = next;
        scheduleOnRN(tick);
      }
    },
    onFinalize: () => {
      "worklet";
      if (dragging.value !== id) return;
      dragging.value = "";
      lifted.value = withTiming(0, { duration: 160 });
      top.value = withSpring((positions.value[id] ?? 0) * slot, spring.page);
      scheduleOnRN(drop, positions.value);
    },
  });

  const style = useAnimatedStyle(() => ({
    top: top.value,
    zIndex: lifted.value > 0.01 ? 10 : 1,
    transform: [{ scale: 1 + lifted.value * 0.03 }],
    borderColor: lifted.value > 0.5 ? c.accent : c.hairline,
    backgroundColor: lifted.value > 0.5 ? c.surface : c.surfaceSubtle,
  }));

  return (
    <Animated.View style={[{ position: "absolute", left: 0, right: 0, height: rowH, borderRadius: radius.field, borderWidth: 2 }, style]}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", paddingStart: 4, paddingEnd: 6, gap: 6 }}>
        <GestureDetector gesture={pan}>
          <View accessible accessibilityLabel={`${pos + 1}. ${entry.label}${entry.detail ? `. ${entry.detail}` : ""}`} accessibilityHint={t("handle", { item: entry.label })} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 6, height: rowH }}>
            <View style={{ width: 30, height: rowH, alignItems: "center", justifyContent: "center" }}>
              <GripVertical size={18} color={c.muted} />
            </View>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.accentSubtle, alignItems: "center", justifyContent: "center" }}>
              <T variant="caption" latin tone="accentText" align="center" style={{ fontFamily: fonts.sans[700] }}>
                {pos + 1}
              </T>
            </View>
            <View style={{ flex: 1, paddingVertical: 8, gap: 2, justifyContent: "center" }}>
              <T variant="subhead" numberOfLines={2}>
                {entry.label}
              </T>
              {entry.detail ? (
                <T variant="caption" tone="secondary" numberOfLines={1}>
                  {entry.detail}
                </T>
              ) : null}
            </View>
          </View>
        </GestureDetector>
        <View style={{ flexDirection: "row" }}>
          <Press depth={0.9} disabled={disabled || index === 0} onPress={() => onMove(index, index - 1)} accessibilityLabel={t("moveUp", { item: entry.label })} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: index === 0 ? 0.3 : 1 }}>
            <ChevronUp size={20} color={c.secondary} />
          </Press>
          <Press depth={0.9} disabled={disabled || index === total - 1} onPress={() => onMove(index, index + 1)} accessibilityLabel={t("moveDown", { item: entry.label })} style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", opacity: index === total - 1 ? 0.3 : 1 }}>
            <ChevronDown size={20} color={c.secondary} />
          </Press>
        </View>
      </View>
    </Animated.View>
  );
}
