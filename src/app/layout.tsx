import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource-variable/alexandria";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { NUMERALS_COOKIE, directionOf, isLocale, isNumeralSystem, DEFAULT_LOCALE } from "@/i18n/config";

export const metadata: Metadata = {
  title: { default: "Aalim", template: "%s · Aalim" },
  description: "Adaptive skills assessment and training.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e0d" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : DEFAULT_LOCALE;
  const jar = await cookies();
  const numeralsCookie = jar.get(NUMERALS_COOKIE)?.value;
  const numerals = isNumeralSystem(numeralsCookie) ? numeralsCookie : "latn";
  const textSize = jar.get("AALIM_TEXT_SIZE")?.value === "large" ? "large" : undefined;
  const dir = directionOf(locale);

  return (
    <html lang={locale} dir={dir} data-text-size={textSize} suppressHydrationWarning>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <Providers locale={locale} numerals={numerals} dir={dir}>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
