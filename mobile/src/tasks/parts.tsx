import * as React from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { ChartPie, Check, CircleDot, Inbox, LayoutTemplate, ListOrdered, MessagesSquare, PenLine, Scale, Signpost, type LucideIcon } from "lucide-react-native";
import { CARD_PAD } from "../deck/pager-context";
import { useLocale, useT } from "../i18n";
import { fonts, radius, spring, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { Press } from "../ui/press";
import { TextArea, wordCount } from "../ui/primitives";
import { T, useTypeSpec } from "../ui/text";
import { usePasteReporter } from "../state/integrity";

/** The scene's task kind, for the "how you answer" chip on a task card's header. */
export const TaskKindContext = React.createContext<string | null>(null);

const ANSWER_ICONS: Record<string, LucideIcon> = {
  choice: CircleDot,
  ranking: ListOrdered,
  allocation: ChartPie,
  written: PenLine,
  inbox: Inbox,
  roleplay: MessagesSquare,
  design: LayoutTemplate,
  chain: Signpost,
  forced_choice: Scale,
};

/**
 * The top of a task card: a soft header band across the card (the coral dot,
 * the label, and on the task's first page a violet pill saying how you
 * answer), then the instruction, large. The band bleeds to the card's edges,
 * so it must be the first thing on the page.
 */
export function TaskHeader({ label, prompt, meta, context, tone = "task", showKind }: { label: string; prompt?: string; meta?: string; context?: string; tone?: "task" | "follow" | "change"; showKind?: boolean }) {
  const { c } = useTheme();
  const kind = React.useContext(TaskKindContext);
  const ta = useT("mobile.answerBy");
  const Icon = kind ? (ANSWER_ICONS[kind] ?? PenLine) : null;
  const chip = showKind && kind && Icon ? { Icon, text: ta(kind) } : null;
  return (
    <View style={{ gap: 14 }}>
      <View style={{ marginHorizontal: -CARD_PAD, marginTop: -CARD_PAD, paddingHorizontal: CARD_PAD, paddingVertical: 10, minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surfaceSubtle }}>
        <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: tone === "change" ? c.warning : tone === "follow" ? c.accent : c.signal }} />
        <T variant="label" tone="secondary" accessibilityRole="header" numberOfLines={1} style={{ flexShrink: 1 }}>
          {label}
        </T>
        <View style={{ flex: 1 }} />
        {chip ? (
          <View accessible accessibilityLabel={chip.text} style={{ flexDirection: "row", alignItems: "center", gap: 6, height: 32, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: c.accentSubtle, flexShrink: 1 }}>
            <chip.Icon size={14} color={c.accentText} strokeWidth={2.2} />
            <T variant="caption" tone="accentText" numberOfLines={1} style={{ flexShrink: 1 }}>
              {chip.text}
            </T>
          </View>
        ) : meta ? (
          <T variant="caption" tone="tertiary" numberOfLines={1} style={{ flexShrink: 1 }}>
            {meta}
          </T>
        ) : null}
      </View>
      {chip && meta ? (
        <T variant="caption" tone="tertiary">
          {meta}
        </T>
      ) : null}
      {context ? (
        <View style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.control, backgroundColor: c.surfaceSunken }}>
          <T variant="footnote" tone="secondary" numberOfLines={2}>
            {context}
          </T>
        </View>
      ) : null}
      {prompt ? <Prompt text={prompt} /> : null}
    </View>
  );
}

/** The instruction, large; a long one steps down a size so it never fills the card on its own. */
function Prompt({ text }: { text: string }) {
  const { rtl } = useLocale();
  const spec = useTypeSpec("prompt");
  const long = text.length > 170;
  const k = long ? 19 / 22 : 1;
  return (
    <T variant="prompt" style={long ? { fontSize: Math.round(spec.size * k), lineHeight: Math.round(spec.line * (rtl ? 0.9 : 0.88)) } : undefined}>
      {text}
    </T>
  );
}

/** A big, calm option card. The selected one is ringed in violet on a violet wash, its letter a filled violet disc. */
export function OptionCard({ letter, label, detail, selected, onPress, disabled, testID }: { letter?: string; label: string; detail?: string; selected: boolean; onPress: () => void; disabled?: boolean; testID?: string }) {
  const { c } = useTheme();
  // The border is always 2pt (only its colour changes), so nothing inside shifts when it is chosen.
  const ring = useAnimatedStyle(() => ({ borderColor: withTiming(selected ? c.accent : c.hairline, { duration: 140 }), backgroundColor: withTiming(selected ? c.accentSubtle : c.surfaceSubtle, { duration: 140 }) }));
  const badge = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(selected ? 1.06 : 1, spring.pop) }] }));
  return (
    <Press
      testID={testID}
      depth={0.98}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, selected, disabled }}
      accessibilityLabel={detail ? `${label}. ${detail}` : label}
      onPress={() => {
        haptic.select();
        onPress();
      }}
    >
      <Animated.View style={[{ flexDirection: "row", gap: 14, padding: 16, borderRadius: 20, borderWidth: 2, opacity: disabled && !selected ? 0.6 : 1 }, ring]}>
        {letter ? (
          <Animated.View style={[{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: selected ? c.accent : c.hairline, marginTop: 1 }, badge]}>
            {selected ? <Check size={16} color={c.actionText} strokeWidth={3} /> : <T variant="footnote" latin tone="secondary" align="center" style={{ fontFamily: fonts.sans[700] }}>{letter}</T>}
          </Animated.View>
        ) : null}
        <View style={{ flex: 1, gap: 4 }}>
          <T variant="bodyStrong">{label}</T>
          {detail ? (
            <T variant="subhead" tone="secondary">
              {detail}
            </T>
          ) : null}
        </View>
      </Animated.View>
    </Press>
  );
}

/** A written answer with a live word count. */
export function Editor({ label, hint, value, onChange, disabled, minHeight = 220, placeholder, autoFocus }: { label: string; hint?: string; value: string; onChange: (s: string) => void; disabled?: boolean; minHeight?: number; placeholder?: string; autoFocus?: boolean }) {
  const tw = useT("components.editor");
  const paste = usePasteReporter();
  const words = wordCount(value);
  return (
    <TextArea
      label={label}
      hint={hint}
      value={value}
      onChangeText={onChange}
      editable={!disabled}
      minHeight={minHeight}
      placeholder={placeholder ?? tw("placeholder")}
      autoFocus={autoFocus}
      onBigInsert={paste}
      footer={
        <T variant="caption" tone="tertiary" align="end" accessibilityLiveRegion="polite">
          {tw("words", { count: words, formatted: String(words) })}
        </T>
      }
    />
  );
}

/** One line of a sealed answer's digest. */
export function SummaryLine({ label, value }: { label?: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      {label ? (
        <T variant="footnote" tone="tertiary">
          {label}
        </T>
      ) : null}
      <T variant="callout" numberOfLines={6}>
        {value}
      </T>
    </View>
  );
}

export const letterFor = (i: number) => String.fromCharCode(65 + i);
