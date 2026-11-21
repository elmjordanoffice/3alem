/**
 * Range, the Aalim brand, in React Native. The same values as the web app's
 * src/styles/tokens.css: bone canvas, white surfaces with hairlines, ink for
 * actions, one vermilion signal (the estimate dot, the progress accent, and the
 * single primary call to action on a screen). No shadows, no gradients.
 */
export const palette = {
  ink: "#141414",
  inkRaised: "#232220",
  inkForeground: "#F2F0EB",
  inkSecondary: "#B9B4AA",
  bone: "#F2F0EB",
  signal: "#F04A23",
} as const;

export interface Colors {
  scheme: "light" | "dark";
  canvas: string;
  surface: string;
  surfaceSubtle: string;
  surfaceSunken: string;
  hairline: string;
  hairlineStrong: string;
  text: string;
  secondary: string;
  tertiary: string;
  muted: string;
  /** The usual action colour: ink in light mode, bone in dark mode. */
  action: string;
  actionText: string;
  /** The one vermilion signal. Text on it is always ink. */
  signal: string;
  signalText: string;
  signalSubtle: string;
  signalInk: string;
  warning: string;
  warningSubtle: string;
  critical: string;
  criticalSubtle: string;
  success: string;
  chart: [string, string, string, string];
  chartGrid: string;
  /** Translucent fill behind blurred bars. */
  barFill: string;
  scrim: string;
}

export const light: Colors = {
  scheme: "light",
  canvas: "#F2F0EB",
  surface: "#FFFFFF",
  surfaceSubtle: "#F8F7F4",
  surfaceSunken: "#EBE8E1",
  hairline: "#E2DED5",
  hairlineStrong: "#CDC8BD",
  text: "#141414",
  secondary: "#4F4B45",
  tertiary: "#67635B",
  muted: "#ACA79C",
  action: "#141414",
  actionText: "#FFFFFF",
  signal: "#F04A23",
  signalText: "#141414",
  signalSubtle: "#FFE8E0",
  signalInk: "#B2300C",
  warning: "#9A5600",
  warningSubtle: "#FDF1DF",
  critical: "#B42318",
  criticalSubtle: "#FDECEB",
  success: "#1A7A47",
  chart: ["#141414", "#F04A23", "#0E7C66", "#6B5B95"],
  chartGrid: "#E2DED5",
  barFill: "rgba(242,240,235,0.72)",
  scrim: "rgba(20,20,20,0.32)",
};

export const dark: Colors = {
  scheme: "dark",
  canvas: "#0F0F0E",
  surface: "#191817",
  surfaceSubtle: "#1E1D1B",
  surfaceSunken: "#0B0B0A",
  hairline: "#2D2B28",
  hairlineStrong: "#423F3A",
  text: "#F2F0EB",
  secondary: "#C4BFB5",
  tertiary: "#A29D93",
  muted: "#6E6A63",
  action: "#F2F0EB",
  actionText: "#141414",
  signal: "#FF5A33",
  signalText: "#141414",
  signalSubtle: "#3B1A10",
  signalInk: "#FF9472",
  warning: "#F5B84A",
  warningSubtle: "#2B2010",
  critical: "#FF8578",
  criticalSubtle: "#2D1513",
  success: "#5FD08F",
  chart: ["#F2F0EB", "#FF6A45", "#3FC1A3", "#B3A3E0"],
  chartGrid: "#2D2B28",
  barFill: "rgba(15,15,14,0.7)",
  scrim: "rgba(0,0,0,0.5)",
};

export const radius = { control: 12, card: 18, sheet: 28, pill: 999 } as const;

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
  /** A small mark dropping into its place (the vermilion dot). */
  settle: { mass: 1, stiffness: 480, damping: 30 },
} as const;
