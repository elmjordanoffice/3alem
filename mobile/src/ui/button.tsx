import * as React from "react";
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useLocale } from "../i18n";
import { HIT, radius, useTheme } from "../theme";
import { DrawnCheck } from "./motion";
import { Press } from "./press";
import { T } from "./text";

export type ButtonVariant = "primary" | "action" | "secondary" | "ghost" | "onInk";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  /**
   * primary: the one vermilion call to action on a screen (ink text on vermilion).
   * action: the usual ink button. secondary: hairline outline. ghost: text only.
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
  const { c, dark } = useTheme();
  const { rtl } = useLocale();
  const height = size === "lg" ? 56 : size === "md" ? 48 : 40;
  const off = disabled || loading || done;

  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: c.signal, fg: c.signalText },
    action: { bg: c.action, fg: c.actionText },
    secondary: { bg: c.surface, fg: c.text, border: c.hairlineStrong },
    ghost: { bg: "transparent", fg: c.text },
    onInk: { bg: "rgba(242,240,235,0.1)", fg: "#F2F0EB", border: "rgba(242,240,235,0.22)" },
  };
  let { bg, fg, border } = palette[variant];
  if (disabled && !loading && !done && (variant === "primary" || variant === "action")) {
    bg = dark ? c.hairline : c.surfaceSunken;
    fg = c.tertiary;
  }
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
          paddingHorizontal: size === "sm" ? 14 : 22,
          backgroundColor: bg,
          borderColor: border ?? "transparent",
          borderWidth: border ? StyleSheet.hairlineWidth * 2 : 0,
          borderRadius: size === "sm" ? radius.control : 16,
          alignSelf: full ? "stretch" : "flex-start",
        },
        style,
      ]}
    >
      {done ? (
        <DrawnCheck size={size === "sm" ? 20 : 26} color={fg} strokeWidth={2.4} duration={320} />
      ) : loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {Icon ? <Icon size={size === "sm" ? 16 : 19} color={fg} strokeWidth={2} style={iconStyle} /> : null}
          <T variant={size === "sm" ? "subhead" : "headline"} style={{ color: fg }} numberOfLines={1} align="center">
            {label}
          </T>
          {IconEnd ? <IconEnd size={size === "sm" ? 16 : 19} color={fg} strokeWidth={2} style={iconStyle} /> : null}
        </View>
      )}
    </Press>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
});
