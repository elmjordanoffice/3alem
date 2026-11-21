import * as React from "react";
import { AccessibilityInfo, useColorScheme } from "react-native";
import { kv } from "../lib/storage";
import { dark, light, type Colors } from "./tokens";

export * from "./tokens";

/** Font families, loaded in app/_layout.tsx. Weight lives in the family, never in fontWeight. */
export const fonts = {
  sans: { 400: "IBMPlexSans_400Regular", 500: "IBMPlexSans_500Medium", 600: "IBMPlexSans_600SemiBold", 700: "IBMPlexSans_700Bold" },
  arabic: { 400: "IBMPlexSansArabic_400Regular", 500: "IBMPlexSansArabic_500Medium", 600: "IBMPlexSansArabic_600SemiBold", 700: "IBMPlexSansArabic_700Bold" },
  /** Archivo at 125% width, weight 800: the brand's wide display face (Latin only). */
  wide: "ArchivoExpanded-800",
  arabicDisplay: { 700: "Beiruti_700Bold", 900: "Beiruti_900Black" },
} as const;

interface ThemeValue {
  c: Colors;
  dark: boolean;
  /** The "Larger text" accommodation: every size steps up. */
  largerText: boolean;
  setLargerText: (v: boolean) => void;
  reduceMotion: boolean;
  screenReader: boolean;
}

const ThemeContext = React.createContext<ThemeValue>({
  c: light,
  dark: false,
  largerText: false,
  setLargerText: () => undefined,
  reduceMotion: false,
  screenReader: false,
});

const LARGER_KEY = "aalim:largerText";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [largerText, setLarger] = React.useState(false);
  const [reduceMotion, setReduceMotion] = React.useState(false);
  const [screenReader, setScreenReader] = React.useState(false);

  React.useEffect(() => {
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
