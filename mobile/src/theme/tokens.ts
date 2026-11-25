/**
 * Night, the Aalim look, in React Native. The same values as the web app's
 * src/styles/tokens.css: a deep indigo canvas (dark is the default), violet
 * for actions and selection, glowing blue and teal for data, and one coral
 * signal (the estimate dot, the current chapter, the mark's dot). Cards are
 * soft and rounded and lifted with light rather than hairlines; the raised
 * violet "hero" card, a gradient lit from above, marks what to look at first.
 * The light theme is the same system on lavender and white.
 *
 * Every text/background pair used on screen meets WCAG AA (4.5:1 for body
 * text). `muted` is for non-text marks only (grips, dividers, disabled icons).
 */
export const palette = {
  /** The ground of the logo and the deepest indigo. */
  night: "#1B1840",
  white: "#FFFFFF",
  /** The bright coral of the mark's dot, on violet and indigo grounds in both themes. */
  coral: "#FF5C7C",
  /** The raised highlight card: violet, lit from above. White text on every stop is AA. */
  heroFrom: "#5847D6",
  heroVia: "#5040CE",
  heroTo: "#4836C4",
  heroText: "#FFFFFF",
  heroSecondary: "#E3DFFF",
  /** The logo tile: a glowing blue disc. */
  logoFrom: "#2A4BB0",
  logoTo: "#142966",
} as const;

/**
 * Stat tiles: bold gradient blocks (top to bottom) with a soft wave of light
 * across the top. Each text colour is AA (4.5:1) on both stops, even under the
 * wave: white on violet and blue, indigo on the bright teal and coral.
 */
export const tiles = {
  violet: { from: "#6C5CE7", to: "#5040CE", text: "#FFFFFF", glow: "#6C5CE7" },
  blue: { from: "#21409E", to: "#12245E", text: "#FFFFFF", glow: "#21409E" },
  teal: { from: "#25C6B6", to: "#12A597", text: "#1B1840", glow: "#12A597" },
  coral: { from: "#FF6D8A", to: "#FF5C7C", text: "#1B1840", glow: "#FF5C7C" },
} as const;
export type TileTone = keyof typeof tiles;

export interface Colors {
  scheme: "light" | "dark";
  canvas: string;
  surface: string;
  surfaceSubtle: string;
  surfaceSunken: string;
  /** Text fields: a soft well, a step below the surface. */
  field: string;
  /** Dividers inside a card and quiet control edges. Cards themselves have no line. */
  hairline: string;
  hairlineStrong: string;
  text: string;
  secondary: string;
  tertiary: string;
  /** Non-text marks only. */
  muted: string;
  /** The usual action colour: violet in both themes, white text on it. */
  action: string;
  actionText: string;
  /** Violet: primary actions and the current selection. */
  accent: string;
  accentPressed: string;
  /** Violet as text and icons on the canvas and on surfaces. */
  accentText: string;
  /** A quiet violet wash (selected rows, number badges). */
  accentSubtle: string;
  focus: string;
  /** The coral signal: the estimate dot, the current chapter. */
  signal: string;
  signalText: string;
  signalSubtle: string;
  /** The signal as text on surfaces. */
  signalInk: string;
  /** Data: glowing blue and teal. */
  blue: string;
  blueDeep: string;
  teal: string;
  tealDeep: string;
  /** The raised highlight card's gradient and its text. */
  heroFrom: string;
  heroVia: string;
  heroTo: string;
  heroText: string;
  heroSecondary: string;
  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  critical: string;
  criticalSubtle: string;
  info: string;
  infoSubtle: string;
  chart: [string, string, string, string];
  chartGrid: string;
  /** Translucent fill behind blurred bars. */
  barFill: string;
  scrim: string;
  /** The colour of a card's soft shadow. */
  shadow: string;
}

const hero = {
  heroFrom: palette.heroFrom,
  heroVia: palette.heroVia,
  heroTo: palette.heroTo,
  heroText: palette.heroText,
  heroSecondary: palette.heroSecondary,
} as const;

export const light: Colors = {
  scheme: "light",
  canvas: "#EFEDFB",
  surface: "#FFFFFF",
  surfaceSubtle: "#F7F6FE",
  surfaceSunken: "#E6E3F8",
  field: "#EEEBFA",
  hairline: "#E1DDF5",
  hairlineStrong: "#C3BCEC",
  text: "#1B1840",
  secondary: "#4A4575",
  tertiary: "#5F5A8C",
  muted: "#A9A3D4",
  action: "#5847D6",
  actionText: "#FFFFFF",
  accent: "#5847D6",
  accentPressed: "#4030B8",
  accentText: "#4636C2",
  accentSubtle: "#EBE8FF",
  focus: "#6C5CE7",
  signal: "#D6345D",
  signalText: "#FFFFFF",
  signalSubtle: "#FDE8EE",
  signalInk: "#B8284F",
  blue: "#22449F",
  blueDeep: "#172F80",
  teal: "#12A597",
  tealDeep: "#0B8579",
  ...hero,
  success: "#14784F",
  successSubtle: "#E3F6EE",
  warning: "#8A5600",
  warningSubtle: "#FDF1DF",
  critical: "#B4233C",
  criticalSubtle: "#FDE8EC",
  info: "#2A5BD7",
  infoSubtle: "#E8EFFF",
  chart: ["#5847D6", "#22449F", "#12A597", "#D6345D"],
  chartGrid: "#E6E3F8",
  barFill: "rgba(239,237,251,0.78)",
  scrim: "rgba(20,18,53,0.55)",
  shadow: "#2B1F7A",
};

export const dark: Colors = {
  scheme: "dark",
  canvas: "#1B1840",
  surface: "#26224F",
  surfaceSubtle: "#2C2858",
  surfaceSunken: "#141233",
  field: "#19173B",
  hairline: "#332E66",
  hairlineStrong: "#4A4485",
  text: "#FFFFFF",
  secondary: "#BDB8E3",
  tertiary: "#A09BCB",
  muted: "#5A548F",
  action: "#6C5CE7",
  actionText: "#FFFFFF",
  accent: "#6C5CE7",
  accentPressed: "#5847D6",
  accentText: "#B3A8FF",
  accentSubtle: "#342E72",
  focus: "#A99DFF",
  signal: "#FF5C7C",
  signalText: "#1B1840",
  signalSubtle: "#3E1F40",
  signalInk: "#FF8AA0",
  blue: "#3558C4",
  blueDeep: "#1F3D9E",
  teal: "#25C6B6",
  tealDeep: "#119C90",
  ...hero,
  success: "#4ADE9B",
  successSubtle: "#173A35",
  warning: "#FFC562",
  warningSubtle: "#3A3020",
  critical: "#FF8A96",
  criticalSubtle: "#3E1F36",
  info: "#82ADFF",
  infoSubtle: "#1E2A5E",
  chart: ["#8B7CFF", "#5874CC", "#25C6B6", "#FF5C7C"],
  chartGrid: "#2F2A5E",
  barFill: "rgba(27,24,64,0.78)",
  scrim: "rgba(10,8,30,0.7)",
  shadow: "#06041E",
};

/** Controls 12, text fields 16, cards 24, the sheet 32, pills fully round. */
export const radius = { control: 12, field: 16, card: 24, sheet: 32, pill: 999 } as const;

/** 4pt grid. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;

/** Minimum touch target. */
export const HIT = 44;

/** One spring language for the whole app: quick, settled, barely any overshoot. */
export const spring = {
  page: { mass: 1, stiffness: 340, damping: 36 },
  scene: { mass: 1, stiffness: 210, damping: 28 },
  pop: { mass: 1, stiffness: 420, damping: 26 },
  sheet: { mass: 1, stiffness: 380, damping: 40 },
  /** Text and rows arriving: settled, no visible overshoot. */
  rise: { mass: 1, stiffness: 260, damping: 30 },
  /** A stamp meeting paper: stiff and quick, a hair of give on contact. */
  land: { mass: 1, stiffness: 600, damping: 38 },
  /** A small mark dropping into its place (the coral dot). */
  settle: { mass: 1, stiffness: 480, damping: 30 },
} as const;
