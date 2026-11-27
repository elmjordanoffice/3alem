"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { Direction } from "radix-ui";
import type { AppLocale, NumeralSystem } from "@/i18n/config";
import { formatDuration, formatLevel, formatNumber, formatRange } from "@/lib/i18n/format";
import { TooltipProvider } from "@/components/ui/menu";
import { Toaster } from "@/components/ui/toaster";

interface LocaleSettings {
  locale: AppLocale;
  numerals: NumeralSystem;
  dir: "ltr" | "rtl";
}

const LocaleSettingsContext = React.createContext<LocaleSettings>({ locale: "en", numerals: "latn", dir: "ltr" });

export function Providers({ children, ...settings }: LocaleSettings & { children: React.ReactNode }) {
  // Print layouts (PDF export) are always light, whatever the person's theme.
  const forcedTheme = usePathname()?.startsWith("/print") ? "light" : undefined;
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange forcedTheme={forcedTheme}>
      <LocaleSettingsContext.Provider value={settings}>
        <Direction.Provider dir={settings.dir}>
          <TooltipProvider>
            {children}
            <Toaster dir={settings.dir} />
          </TooltipProvider>
        </Direction.Provider>
      </LocaleSettingsContext.Provider>
    </ThemeProvider>
  );
}

export function useLocaleSettings() {
  return React.useContext(LocaleSettingsContext);
}

/** Number formatting that respects the person's numeral preference. */
export function useNumbers() {
  const { locale, numerals } = useLocaleSettings();
  return React.useMemo(
    () => ({
      number: (n: number, o?: Intl.NumberFormatOptions) => formatNumber(n, locale, numerals, o),
      level: (n: number) => formatLevel(n, locale, numerals),
      range: (lo: number, hi: number) => formatRange(lo, hi, locale, numerals),
      duration: (s: number) => formatDuration(s, locale, numerals),
    }),
    [locale, numerals],
  );
}
