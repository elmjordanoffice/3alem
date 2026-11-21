import * as React from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { Check } from "lucide-react-native";
import { useT } from "../i18n";
import { radius, spring, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { Press } from "../ui/press";
import { hairline, TextArea, wordCount } from "../ui/primitives";
import { T } from "../ui/text";
import { usePasteReporter } from "../state/integrity";

/** The top of a task page: a small label, then the instruction. */
export function TaskHeader({ label, prompt, meta, context, tone = "task" }: { label: string; prompt?: string; meta?: string; context?: string; tone?: "task" | "follow" | "change" }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: tone === "change" ? c.warning : c.text }} />
        <T variant="label" tone="secondary" accessibilityRole="header" numberOfLines={1} style={{ flexShrink: 0 }}>
          {label}
        </T>
        {meta ? (
          <T variant="caption" tone="tertiary" numberOfLines={1} align="end" style={{ flex: 1 }}>
            {meta}
          </T>
        ) : null}
      </View>
      {context ? (
        <View style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.control, backgroundColor: c.surfaceSunken }}>
          <T variant="footnote" tone="secondary" numberOfLines={2}>
            {context}
          </T>
        </View>
      ) : null}
      {prompt ? <T variant="title2">{prompt}</T> : null}
    </View>
  );
}

/** A big, calm option card. The selected one is outlined in ink with a filled letter. */
export function OptionCard({ letter, label, detail, selected, onPress, disabled, testID }: { letter?: string; label: string; detail?: string; selected: boolean; onPress: () => void; disabled?: boolean; testID?: string }) {
  const { c } = useTheme();
  const ring = useAnimatedStyle(() => ({ borderColor: withTiming(selected ? c.text : c.hairline, { duration: 140 }), borderWidth: selected ? hairline * 2.4 : hairline }));
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
      <Animated.View style={[{ flexDirection: "row", gap: 14, padding: 16, borderRadius: radius.card, backgroundColor: c.surface, opacity: disabled && !selected ? 0.6 : 1 }, ring]}>
        {letter ? (
          <Animated.View style={[{ width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: selected ? c.text : "transparent", borderWidth: selected ? 0 : hairline * 1.4, borderColor: c.hairlineStrong, marginTop: 1 }, badge]}>
            {selected ? <Check size={16} color={c.canvas} strokeWidth={3} /> : <T variant="footnote" latin tone="secondary" align="center" style={{ fontFamily: "IBMPlexSans_600SemiBold" }}>{letter}</T>}
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
