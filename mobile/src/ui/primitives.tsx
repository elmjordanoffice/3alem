import * as React from "react";
import { Platform, StyleSheet, TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, type LucideIcon } from "lucide-react-native";
import Animated, { useAnimatedStyle, withSpring, withTiming } from "react-native-reanimated";
import { useLocale } from "../i18n";
import { fonts, HIT, lift, radius, spring, tiles, useTheme, type TileTone } from "../theme";
import { haptic } from "../lib/haptics";
import { Press } from "./press";
import { T, useTypeSpec } from "./text";

export const hairline = StyleSheet.hairlineWidth * 2;

/** Text fields draw their own focus state; drop the browser ring on web. */
// (outline-style "auto" ignores width in Chrome, so the style itself must go.)
export const noOutline = Platform.OS === "web" ? ({ outlineWidth: 0, outlineStyle: "none" } as unknown as { outlineWidth: number }) : null;

/**
 * A card: the surface colour, round corners, lifted off the canvas by a soft
 * shadow rather than a line. `subtle` and `sunken` are quieter wells that sit
 * flat (inside a card, or for asides). Shadows need the card unclipped: put
 * anything that must be clipped to the corners in an inner view.
 */
export function Card({ children, style, padded = true, tone = "surface" }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean; tone?: "surface" | "subtle" | "sunken" }) {
  const { c } = useTheme();
  const bg = tone === "surface" ? c.surface : tone === "subtle" ? c.surfaceSubtle : c.surfaceSunken;
  return <View style={[{ backgroundColor: bg, borderRadius: radius.card }, tone === "surface" && lift("card", c), padded && { padding: 20 }, style]}>{children}</View>;
}

/** The highlight card's fill: violet, top to bottom, lit from its top corner. Absolute: put it first, inside a clipped view. */
export function HeroFill() {
  const { c } = useTheme();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient colors={[c.heroFrom, c.heroVia, c.heroTo]} locations={[0, 0.55, 1]} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={["rgba(255,255,255,0.13)", "rgba(255,255,255,0)"]} locations={[0, 0.6]} start={{ x: 0.1, y: 0 }} end={{ x: 0.7, y: 0.9 }} style={StyleSheet.absoluteFill} />
      {/* Light catching the top edge. */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.18)" }} />
    </View>
  );
}

/**
 * The raised highlight card: what to look at first on a screen. A violet
 * gradient with a violet glow under it; text on it is white (heroText) or
 * lavender (heroSecondary), both AA on every stop.
 */
export function HeroCard({ children, style, padded = true, testID }: { children?: React.ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean; testID?: string }) {
  const { c } = useTheme();
  return (
    <View testID={testID} style={[{ borderRadius: radius.card, backgroundColor: c.heroVia }, lift("raised", c), style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius.card, overflow: "hidden" }]}>
        <HeroFill />
      </View>
      <View style={padded ? { padding: 22 } : undefined}>{children}</View>
    </View>
  );
}

/** A stat tile: a bold gradient block glowing in its own colour, with a soft sheen of light across the top. */
export function Tile({ tone, children, style }: { tone: TileTone; children?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const t = tiles[tone];
  return (
    <View style={[{ borderRadius: 20, backgroundColor: t.to }, lift("glow", c, t.glow), style]}>
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: 20, overflow: "hidden" }]}>
        <LinearGradient colors={[t.from, t.to]} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0)"]} locations={[0, 0.5]} start={{ x: 0.3, y: 0 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      </View>
      {children}
    </View>
  );
}

/** A round badge for an icon: a violet wash (accent), a quiet well (sunken), or white glass on the highlight card (hero). */
export function IconCircle({ icon: Icon, size = 44, tone = "accent" }: { icon: LucideIcon; size?: number; tone?: "accent" | "sunken" | "hero" | "critical" }) {
  const { c } = useTheme();
  const bg = tone === "accent" ? c.accentSubtle : tone === "sunken" ? c.surfaceSunken : tone === "critical" ? c.criticalSubtle : "rgba(255,255,255,0.14)";
  const fg = tone === "accent" ? c.accentText : tone === "sunken" ? c.secondary : tone === "critical" ? c.critical : c.heroText;
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Icon size={Math.round(size * 0.45)} color={fg} strokeWidth={2} />
    </View>
  );
}

/** A number in a round violet badge (steps, ordered lists). */
export function NumberBadge({ n, size = 30, strong }: { n: number | string; size?: number; strong?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: strong ? c.accent : c.accentSubtle, alignItems: "center", justifyContent: "center" }}>
      <T variant="footnote" latin align="center" style={{ color: strong ? c.actionText : c.accentText, fontFamily: fonts.sans[700], fontVariant: ["tabular-nums"] }}>
        {n}
      </T>
    </View>
  );
}

export function Rule({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ height: hairline, backgroundColor: c.hairline }, style]} />;
}

/** A section opener: a short coral bar. */
export function SignalRule({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return <View style={[{ width: 28, height: 4, borderRadius: 2, backgroundColor: c.signal }, style]} />;
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
      <View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: checked ? 0 : 1.5, borderColor: c.hairlineStrong, backgroundColor: checked ? c.accent : c.field, alignItems: "center", justifyContent: "center", marginTop: 1 }}>
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

/** A pill-shaped segmented control: the chosen segment is a violet pill. */
export function Segmented<V extends string>({ value, options, onChange, label }: { value: V; options: { value: V; label: string; lang?: string }[]; onChange: (v: V) => void; label: string }) {
  const { c } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: "row", backgroundColor: c.surfaceSunken, borderRadius: radius.pill, padding: 4, gap: 4 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Press
            key={o.value}
            depth={0.97}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, checked: on }}
            accessibilityLabel={o.label}
            onPress={() => {
              if (!on) haptic.select();
              onChange(o.value);
            }}
            style={[{ flex: 1, height: 38, paddingHorizontal: 8, borderRadius: radius.pill, alignItems: "center", justifyContent: "center", backgroundColor: on ? c.accent : "transparent" }, on && lift("glow", c)]}
          >
            <T variant="subhead" align="center" numberOfLines={1} style={[{ color: on ? c.actionText : c.secondary, fontFamily: fonts.sans[on ? 700 : 500] }, o.lang ? { fontFamily: o.lang === "ar" ? fonts.arabic[600] : fonts.sans[700] } : null]}>
              {o.label}
            </T>
          </Press>
        );
      })}
    </View>
  );
}

/** A choice chip (triage, fairness answers, radio-like options): a pill that turns violet when chosen. */
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
      style={[{ minHeight: HIT, paddingHorizontal: 18, borderRadius: radius.pill, justifyContent: "center", backgroundColor: selected ? c.accent : c.surfaceSunken }, selected && lift("glow", c)]}
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

/** The look of a text field: a soft well with a quiet edge that turns violet (and thicker) while it has focus. */
export function useFieldStyle(focused: boolean, invalid?: boolean) {
  const { c } = useTheme();
  return {
    backgroundColor: c.field,
    borderWidth: focused || invalid ? 2 : hairline,
    borderColor: invalid ? c.critical : focused ? c.accent : c.hairline,
  } as const;
}

/**
 * A comfortable multi-line editor. It grows with its text instead of
 * scrolling inside itself, so the slide is the only scroller and the deck's
 * edge hand-off stays predictable.
 */
export function TextArea({ label, hint, minHeight = 132, value, onChangeText, onBigInsert, footer, style, editable = true, ...rest }: AreaProps) {
  const { c, dark } = useTheme();
  const { rtl } = useLocale();
  const spec = useTypeSpec("body");
  const [focused, setFocused] = React.useState(false);
  const field = useFieldStyle(focused);
  const last = React.useRef(value.length);
  // The border grows on focus; padding shrinks to match, so the text never shifts.
  const pad = (n: number) => n - (field.borderWidth - hairline);
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
        placeholderTextColor={c.tertiary}
        selectionColor={c.accent}
        cursorColor={c.accentText}
        keyboardAppearance={dark ? "dark" : "light"}
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
          ...field,
          backgroundColor: editable ? c.field : c.surfaceSubtle,
          borderRadius: radius.field,
          paddingHorizontal: pad(16),
          paddingTop: pad(14),
          paddingBottom: pad(14),
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

/** A quiet inline message in a soft wash of its tone; tones never shout. */
export function Notice({ tone = "info", children, action, icon: Icon }: { tone?: "info" | "warning" | "critical"; children: React.ReactNode; action?: React.ReactNode; icon?: LucideIcon }) {
  const { c } = useTheme();
  const bg = tone === "critical" ? c.criticalSubtle : tone === "warning" ? c.warningSubtle : c.accentSubtle;
  const fg = tone === "critical" ? c.critical : tone === "warning" ? c.warning : c.accentText;
  return (
    <View accessibilityRole="alert" style={{ backgroundColor: bg, borderRadius: radius.field, padding: 14, gap: 10 }}>
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
