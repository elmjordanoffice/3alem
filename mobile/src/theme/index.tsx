import * as React from "react";
import { AccessibilityInfo } from "react-native";
import { kv } from "../lib/storage";
import { dark, light, type Colors } from "./tokens";

export * from "./tokens";
export { alpha, lift, type LiftKind } from "./lift";

/**
 * Font families, loaded in app/_layout.tsx. Weight lives in the family, never in fontWeight.
 * Plus Jakarta Sans for Latin (bold and tight for headings), Readex Pro for Arabic.
 */
export const fonts = {
  sans: {
    400: "PlusJakartaSans_400Regular",
    500: "PlusJakartaSans_500Medium",
    600: "PlusJakartaSans_600SemiBold",
    700: "PlusJakartaSans_700Bold",
    800: "PlusJakartaSans_800ExtraBold",
  },
  /** Readex Pro stops at 700, its heaviest. */
  arabic: { 400: "ReadexPro_400Regular", 500: "ReadexPro_500Medium", 600: "ReadexPro_600SemiBold", 700: "ReadexPro_700Bold", 800: "ReadexPro_700Bold" },
} as const;

export type Scheme = "light" | "dark";

interface ThemeValue {
  c: Colors;
  dark: boolean;
  /** Night is dark unless the person picked light (kept on the device). */
  setScheme: (s: Scheme) => void;
  /** The "Larger text" accommodation: every size steps up. */
  largerText: boolean;
  setLargerText: (v: boolean) => void;
  reduceMotion: boolean;
  screenReader: boolean;
}

const ThemeContext = React.createContext<ThemeValue>({
  c: dark,
  dark: true,
  setScheme: () => undefined,
  largerText: false,
  setLargerText: () => undefined,
  reduceMotion: false,
  screenReader: false,
});

const LARGER_KEY = "aalim:largerText";
const SCHEME_KEY = "aalim:scheme";

/** The person's own choice, read once before the first frame (see loadScheme) so a light pick never flashes dark. */
let storedScheme: Scheme | null = null;
let schemeRead: Promise<void> | null = null;

/** Reads the saved theme choice. The root layout waits for it alongside the fonts. */
export function loadScheme(): Promise<void> {
  schemeRead ??= kv.get<Scheme>(SCHEME_KEY).then((v) => {
    storedScheme = v === "light" || v === "dark" ? v : null;
  });
  return schemeRead;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark is the default, whatever the system is set to; an explicit choice wins.
  const [scheme, setSchemeState] = React.useState<Scheme>(() => storedScheme ?? "dark");
  const [largerText, setLarger] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [screenReader, setScreenReader] = React.useState(false);

  React.useEffect(() => {
    void loadScheme().then(() => storedScheme && setSchemeState(storedScheme));
    kv.get<boolean>(LARGER_KEY).then((v) => v && setLarger(true));
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReader).catch(() => undefined);
    const a = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    const b = AccessibilityInfo.addEventListener("screenReaderChanged", setScreenReader);
    return () => {
      a.remove();
      b.remove();
    };
  }, []);

  const value = React.useMemo<ThemeValue>(
    () => ({
      c: scheme === "dark" ? dark : light,
      dark: scheme === "dark",
      setScheme: (s) => {
        storedScheme = s;
        setSchemeState(s);
        void kv.set(SCHEME_KEY, s);
      },
      largerText,
      setLargerText: (v) => {
        setLarger(v);
        void kv.set(LARGER_KEY, v);
      },
      reduceMotion,
      screenReader,
    }),
    [scheme, largerText, reduceMotion, screenReader],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return React.useContext(ThemeContext);
}
