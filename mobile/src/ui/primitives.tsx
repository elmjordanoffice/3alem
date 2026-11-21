import * as React from "react";
import { Platform, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { Check, type LucideIcon } from "lucide-react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useLocale } from "../i18n";
import { fonts, HIT, radius, spring, useTheme } from "../theme";
import { haptic } from "../lib/haptics";
import { Press } from "./press";
import { T, useTypeSpec } from "./text";

export const hairline = StyleSheet.hairlineWidth * 2;

/** Text fields draw their own focus state; drop the browser ring on web. */
// (outline-style "auto" ignores width in Chrome, so the style itself must go.)
export const noOutline = Platform.OS === "web" ? ({ outlineWidth: 0, outlineStyle: "none" } as unknown as { outlineWidth: number }) : null;

/** A white surface with a hairline: the only kind of card. */
export function Card({ children, style, padded = true, tone = "surface" }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean; tone?: "surface" | "subtle" | "sunken" }) {
  const { c } = useTheme();
  const bg = tone === "surface" ? c.surface : tone === "subtle" ? c.surfaceSubtle : c.surfaceSunken;
  return <View style={[{ backgroundColor: bg, borderRadius: radius.card, borderWidth: hairline, borderColor: c.hairline }, padded && { padding: 18 }, style]}>{children}</View>;
}

export function Rule({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ height: hairline, backgroundColor: c.hairline }, style]} />;
}

/** The brand's rule: a short vermilion lead into a hairline. */
export function SignalRule({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <View style={[{ flexDirection: "row", height: 3, alignItems: "center" }, style]}>
      <View style={{ width: 28, height: 3, borderRadius: 2, backgroundColor: c.signal }} />
      <View style={{ flex: 1, height: hairline, backgroundColor: c.hairline }} />
    </View>
  );
}

/** A tick box with its label; the whole row is the target. */
export function CheckRow({ checked, onChange, label, description, disabled, testID }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean; testID?: string }) {
  const { c } = useTheme();
  const box = useAnimatedStyle(() => ({ transform: [{ scale: withSpring(checked ? 1 : 0.6, spring.pop) }], opacity: withTiming(checked ? 1 : 0, { duration: 120 }) }));
  return (
    <Press
      testID={testID}
      depth={0.985}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      accessibilityHint={description}
      disabled={disabled}
      onPress={() => {
        haptic.select();
        onChange(!checked);
      }}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: 14, minHeight: HIT, paddingVertical: 6 }}
    >
      <View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: checked ? 0 : hairline * 1.2, borderColor: c.hairlineStrong, backgroundColor: checked ? c.action : c.surface, alignItems: "center", justifyContent: "center", marginTop: 1 }}>
        <Animated.View style={box}>
          <Check size={17} color={c.actionText} strokeWidth={3} />
        </Animated.View>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <T variant="callout">{label}</T>
        {description ? (
          <T variant="footnote" tone="secondary">
            {description}
          </T>
        ) : null}
      </View>
    </Press>
  );
}

/** iOS-style segmented control. */
export function Segmented<V extends string>({ value, options, onChange, label }: { value: V; options: { value: V; label: string; lang?: string }[]; onChange: (v: V) => void; label: string }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: "row", backgroundColor: c.surfaceSunken, borderRadius: radius.control + 2, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Press
            key={o.value}
            depth={0.98}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, checked: on }}
            accessibilityLabel={o.label}
            onPress={() => {
              if (!on) haptic.select();
              onChange(o.value);
            }}
            style={{ flex: 1, height: 40, borderRadius: radius.control, alignItems: "center", justifyContent: "center", backgroundColor: on ? c.surface : "transparent", borderWidth: on ? hairline : 0, borderColor: c.hairline }}
          >
            <T variant="subhead" tone={on ? "text" : "secondary"} align="center" style={o.lang ? { fontFamily: o.lang === "ar" ? fonts.arabic[600] : fonts.sans[600] } : undefined}>
              {o.label}
            </T>
          </Press>
        );
      })}
    </View>
  );
}

/** A choice chip (triage, fairness answers, radio-like options). */
export function Chip({ label, selected, onPress, testID, accessibilityRole = "radio" }: { label: string; selected: boolean; onPress: () => void; testID?: string; accessibilityRole?: "radio" | "button" }) {
  const { c } = useTheme();
  return (
    <Press
      testID={testID}
      depth={0.96}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={label}
      onPress={() => {
        haptic.select();
        onPress();
      }}
      style={{ minHeight: HIT, paddingHorizontal: 16, borderRadius: radius.pill, justifyContent: "center", backgroundColor: selected ? c.action : c.surface, borderWidth: hairline, borderColor: selected ? c.action : c.hairlineStrong }}
    >
      <T variant="subhead" style={{ color: selected ? c.actionText : c.text }} align="center">
        {label}
      </T>
    </Press>
  );
}

interface AreaProps extends Omit<TextInputProps, "style" | "onChange"> {
  label?: string;
  hint?: string;
  minHeight?: number;
  value: string;
  onChangeText: (s: string) => void;
  /** Reported for reviewer context only (a paste-sized insertion). */
  onBigInsert?: (chars: number) => void;
  footer?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 * A comfortable multi-line editor. It grows with its text instead of
 * scrolling inside itself, so the slide is the only scroller and the deck's
 * edge hand-off stays predictable.
 */
export function TextArea({ label, hint, minHeight = 132, value, onChangeText, onBigInsert, footer, style, editable = true, ...rest }: AreaProps) {
  const { c } = useTheme();
  const { rtl } = useLocale();
  const spec = useTypeSpec("body");
  const [focused, setFocused] = React.useState(false);
  const last = React.useRef(value.length);
  return (
    <View style={[{ gap: 8 }, style]}>
      {label ? <T variant="headline">{label}</T> : null}
      {hint ? (
        <T variant="subhead" tone="secondary">
          {hint}
        </T>
      ) : null}
      <TextInput
        multiline
        scrollEnabled={false}
        value={value}
        editable={editable}
        accessibilityLabel={label}
        accessibilityHint={hint}
        placeholderTextColor={c.muted}
        selectionColor={c.signal}
        cursorColor={c.text}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChangeText={(s) => {
          if (s.length - last.current > 40) onBigInsert?.(s.length - last.current);
          last.current = s.length;
          onChangeText(s);
        }}
        textAlignVertical="top"
        {...rest}
        style={{
          minHeight,
          fontFamily: spec.family,
          fontSize: spec.size,
          lineHeight: spec.line,
          color: c.text,
          backgroundColor: editable ? c.surface : c.surfaceSubtle,
          borderRadius: radius.card,
          borderWidth: focused ? hairline * 1.25 : hairline,
          borderColor: focused ? c.text : c.hairlineStrong,
          paddingHorizontal: 16,
          paddingTop: 14,
          paddingBottom: 14,
          // "start" follows the screen's direction on iOS, Android and web alike.
          textAlign: "start",
          writingDirection: rtl ? "rtl" : "ltr",
          ...noOutline,
        }}
      />
      {footer}
    </View>
  );
}

/** A quiet inline message; tones never shout. */
export function Notice({ tone = "info", children, action, icon: Icon }: { tone?: "info" | "warning" | "critical"; children: React.ReactNode; action?: React.ReactNode; icon?: LucideIcon }) {
  const { c } = useTheme();
  const bg = tone === "critical" ? c.criticalSubtle : tone === "warning" ? c.warningSubtle : c.surfaceSubtle;
  const fg = tone === "critical" ? c.critical : tone === "warning" ? c.warning : c.secondary;
  return (
    <View accessibilityRole="alert" style={{ backgroundColor: bg, borderRadius: radius.control, borderWidth: hairline, borderColor: c.hairline, padding: 14, gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
        {Icon ? <Icon size={18} color={fg} style={{ marginTop: 3 }} /> : null}
        <T variant="subhead" style={{ flex: 1, color: tone === "info" ? c.text : fg }}>
          {children}
        </T>
      </View>
      {action}
    </View>
  );
}

export function wordCount(s: string) {
  const m = s.trim().match(/\S+/g);
  return m ? m.length : 0;
}
