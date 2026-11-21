import * as React from "react";
import { Text, View, type TextProps, type TextStyle } from "react-native";
import { useLocale } from "../i18n";
import { fonts, useTheme } from "../theme";

export type Variant =
  | "display"
  | "displayMd"
  | "displaySm"
  | "title"
  | "title2"
  | "prompt"
  | "headline"
  | "body"
  | "bodyStrong"
  | "callout"
  | "subhead"
  | "footnote"
  | "caption"
  | "label"
  | "index";

export type Tone = "text" | "secondary" | "tertiary" | "muted" | "action" | "actionText" | "signal" | "signalInk" | "signalText" | "critical" | "warning" | "inkForeground" | "inkSecondary";

interface Spec {
  family: string;
  size: number;
  line: number;
  tracking?: number;
  upper?: boolean;
  /** Cap for Dynamic Type growth, so display type never breaks the layout. */
  maxScale: number;
}

/**
 * The type scale. Latin: IBM Plex Sans for reading, wide Archivo capitals for
 * display moments. Arabic: IBM Plex Sans Arabic one step larger with line
 * height of at least 1.7, Beiruti for display, and never any letter-spacing.
 */
const LATIN: Record<Variant, Spec> = {
  display: { family: fonts.wide, size: 30, line: 33, tracking: -0.3, upper: true, maxScale: 1.25 },
  displayMd: { family: fonts.wide, size: 25, line: 29, tracking: -0.2, upper: true, maxScale: 1.25 },
  displaySm: { family: fonts.wide, size: 20, line: 24, tracking: -0.1, upper: true, maxScale: 1.3 },
  title: { family: fonts.sans[600], size: 28, line: 34, tracking: -0.45, maxScale: 1.5 },
  title2: { family: fonts.sans[600], size: 21, line: 27, tracking: -0.2, maxScale: 1.6 },
  prompt: { family: fonts.sans[600], size: 22, line: 29, tracking: -0.3, maxScale: 1.6 },
  headline: { family: fonts.sans[600], size: 17, line: 23, tracking: -0.1, maxScale: 1.8 },
  body: { family: fonts.sans[400], size: 17, line: 26, maxScale: 2 },
  bodyStrong: { family: fonts.sans[500], size: 17, line: 25, maxScale: 2 },
  callout: { family: fonts.sans[400], size: 16, line: 24, maxScale: 2 },
  subhead: { family: fonts.sans[400], size: 15, line: 21, maxScale: 2 },
  footnote: { family: fonts.sans[400], size: 13, line: 18, maxScale: 1.8 },
  caption: { family: fonts.sans[500], size: 12, line: 16, maxScale: 1.6 },
  label: { family: fonts.wide, size: 10.5, line: 14, tracking: 1.3, upper: true, maxScale: 1.4 },
  index: { family: fonts.wide, size: 22, line: 26, tracking: 0.4, maxScale: 1.3 },
};

const ARABIC: Record<Variant, Spec> = {
  display: { family: fonts.arabicDisplay[900], size: 38, line: 52, maxScale: 1.25 },
  displayMd: { family: fonts.arabicDisplay[900], size: 34, line: 46, maxScale: 1.25 },
  displaySm: { family: fonts.arabicDisplay[700], size: 26, line: 38, maxScale: 1.3 },
  title: { family: fonts.arabicDisplay[700], size: 32, line: 46, maxScale: 1.5 },
  title2: { family: fonts.arabic[600], size: 21, line: 36, maxScale: 1.6 },
  prompt: { family: fonts.arabic[600], size: 22, line: 38, maxScale: 1.6 },
  headline: { family: fonts.arabic[600], size: 17, line: 29, maxScale: 1.8 },
  body: { family: fonts.arabic[400], size: 18, line: 31, maxScale: 2 },
  bodyStrong: { family: fonts.arabic[500], size: 18, line: 31, maxScale: 2 },
  callout: { family: fonts.arabic[400], size: 17, line: 29, maxScale: 2 },
  subhead: { family: fonts.arabic[400], size: 16, line: 27, maxScale: 2 },
  footnote: { family: fonts.arabic[400], size: 14, line: 24, maxScale: 1.8 },
  caption: { family: fonts.arabic[500], size: 13, line: 22, maxScale: 1.6 },
  label: { family: fonts.arabic[600], size: 13, line: 21, maxScale: 1.4 },
  // Numbers stay Latin and wide in both languages.
  index: { family: fonts.wide, size: 22, line: 28, tracking: 0.4, maxScale: 1.3 },
};

export function useTypeSpec(variant: Variant) {
  const { rtl } = useLocale();
  const { largerText } = useTheme();
  const s = (rtl ? ARABIC : LATIN)[variant];
  const k = largerText ? 1.15 : 1;
  return { ...s, size: Math.round(s.size * k * 2) / 2, line: Math.round(s.line * k) };
}

export function useTone(tone: Tone): string {
  const { c } = useTheme();
  switch (tone) {
    case "inkForeground":
      return "#F2F0EB";
    case "inkSecondary":
      return "#B9B4AA";
    default:
      return c[tone];
  }
}

export interface TProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  align?: "start" | "center" | "end";
  /** Force Latin type (numbers, codes) even in Arabic. */
  latin?: boolean;
  children?: React.ReactNode;
}

export function T({ variant = "body", tone = "text", align = "start", latin, style, children, ...rest }: TProps) {
  const { rtl } = useLocale();
  const { largerText } = useTheme();
  const spec = (rtl && !latin ? ARABIC : LATIN)[variant];
  const k = largerText ? 1.15 : 1;
  const color = useTone(tone);
  const base: TextStyle = {
    fontFamily: spec.family,
    fontSize: Math.round(spec.size * k * 2) / 2,
    lineHeight: Math.round(spec.line * k),
    color,
    textAlign: align,
    ...(spec.tracking && !(rtl && !latin) ? { letterSpacing: spec.tracking } : null),
    ...(spec.upper ? { textTransform: "uppercase" } : null),
  };
  return (
    <Text maxFontSizeMultiplier={spec.maxScale} {...rest} style={[base, style]}>
      {children}
    </Text>
  );
}

const BULLET = /^\s*[-•*–]\s+/;

/**
 * Running text split into its paragraphs (blank lines in the source), with
 * room between them, and "- " lines set as a list with hanging bullets:
 * emails, memos and scenarios read like the real thing.
 */
export function Paragraphs({ text, gap = 14, ...props }: Omit<TProps, "children"> & { text: string; gap?: number }) {
  const parts = React.useMemo(() => text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean), [text]);
  const block = (p: string, key: number) => {
    const lines = p.split("\n");
    if (!lines.some((l) => BULLET.test(l))) {
      return (
        <T key={key} {...props}>
          {p}
        </T>
      );
    }
    return (
      <View key={key} style={{ gap: 8 }}>
        {lines.map((l, j) =>
          BULLET.test(l) ? (
            <View key={j} style={{ flexDirection: "row", gap: 10 }}>
              <T {...props} style={[props.style, { width: 12 }]}>
                •
              </T>
              <T {...props} style={[props.style, { flex: 1 }]}>
                {l.replace(BULLET, "")}
              </T>
            </View>
          ) : (
            <T key={j} {...props}>
              {l}
            </T>
          ),
        )}
      </View>
    );
  };
  if (parts.length < 2) return block(text.trim(), 0);
  return <View style={{ gap }}>{parts.map(block)}</View>;
}
