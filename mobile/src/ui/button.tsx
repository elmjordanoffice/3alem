import * as React from "react";
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useLocale } from "../i18n";
import { HIT, lift, useTheme } from "../theme";
import { DrawnCheck } from "./motion";
import { Press } from "./press";
import { T } from "./text";

export type ButtonVariant = "primary" | "action" | "secondary" | "ghost" | "onHero";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  /**
   * primary: the screen's main call to action, violet with a soft violet glow.
   * action: the usual violet button, without the glow (sheets, cards).
   * secondary: a quiet well with a soft edge. ghost: text only.
   * onHero: white glass, for a button on the violet highlight card.
   */
  variant?: ButtonVariant;
  size?: "lg" | "md" | "sm";
  disabled?: boolean;
  loading?: boolean;
  /** It worked: the label gives way to a check that draws itself, and the button rests. */
  done?: boolean;
  icon?: LucideIcon;
  iconEnd?: LucideIcon;
  /** Mirror directional icons in Arabic. */
  flipIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  full?: boolean;
}

export function Button({ label, onPress, variant = "action", size = "lg", disabled, loading, done, icon: Icon, iconEnd: IconEnd, flipIcon, style, accessibilityLabel, accessibilityHint, testID, full }: ButtonProps) {
  const { c } = useTheme();
  const { rtl } = useLocale();
  const height = size === "lg" ? 56 : size === "md" ? 48 : 40;
  const off = disabled || loading || done;

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.accent, fg: c.actionText },
    action: { bg: c.action, fg: c.actionText },
    secondary: { bg: c.surfaceSubtle, fg: c.text, border: c.hairlineStrong },
    ghost: { bg: "transparent", fg: c.accentText },
    onHero: { bg: "rgba(255,255,255,0.14)", fg: c.heroText, border: "rgba(255,255,255,0.24)" },
  };
  let { bg, fg, border } = palette[variant];
  const filled = variant === "primary" || variant === "action";
  const resting = disabled && !loading && !done && filled;
  if (resting) {
    bg = c.surfaceSunken;
    fg = c.tertiary;
  }
  // The glow: only on a live primary button (not while it rests, disabled).
  const glow = variant === "primary" && !resting ? lift("glow", c) : null;
  const iconStyle = flipIcon && rtl ? { transform: [{ scaleX: -1 }] } : undefined;

  return (
    <Press
      testID={testID}
      onPress={off ? undefined : onPress}
      disabled={off}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: Boolean(disabled || done), busy: Boolean(loading && !done) }}
      hitSlop={height < HIT ? { top: (HIT - height) / 2, bottom: (HIT - height) / 2 } : undefined}
      style={[
        styles.base,
        {
          height,
          minWidth: height,
          paddingHorizontal: size === "sm" ? 16 : 24,
          backgroundColor: bg,
          borderColor: border ?? "transparent",
          borderWidth: border ? 1 : 0,
          borderRadius: size === "lg" ? 16 : size === "md" ? 14 : 12,
          alignSelf: full ? "stretch" : "flex-start",
        },
        glow,
        style,
      ]}
    >
      {done ? (
        <DrawnCheck size={size === "sm" ? 20 : 26} color={fg} strokeWidth={2.4} duration={320} />
      ) : loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {Icon ? <Icon size={size === "sm" ? 16 : 19} color={fg} strokeWidth={2.2} style={iconStyle} /> : null}
          <T variant={size === "sm" ? "subhead" : "headline"} style={{ color: fg }} numberOfLines={1} align="center">
            {label}
          </T>
          {IconEnd ? <IconEnd size={size === "sm" ? 16 : 19} color={fg} strokeWidth={2.2} style={iconStyle} /> : null}
        </View>
      )}
    </Press>
  );
}

/** A round icon button (the reference's bells and toggles): a quiet disc, or white glass on the highlight card. */
export function RoundButton({ icon: Icon, onPress, accessibilityLabel, accessibilityHint, size = 44, tone = "surface", testID }: { icon: LucideIcon; onPress: () => void; accessibilityLabel: string; accessibilityHint?: string; size?: number; tone?: "surface" | "sunken" | "hero"; testID?: string }) {
  const { c } = useTheme();
  const bg = tone === "surface" ? c.surface : tone === "sunken" ? c.surfaceSunken : "rgba(255,255,255,0.14)";
  const fg = tone === "hero" ? c.heroText : c.text;
  return (
    <Press
      testID={testID}
      depth={0.92}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={size < HIT ? (HIT - size) / 2 : undefined}
      style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }, tone === "surface" && lift("card", c)]}
    >
      <Icon size={Math.round(size * 0.43)} color={fg} strokeWidth={2} />
    </Press>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
