import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider, type AbstractIntlMessages } from "next-intl";
// Night type: Plus Jakarta Sans for Latin, Readex Pro for Arabic, everywhere.
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/readex-pro";
// The wordmark is drawn from the same two fonts (outlined paths; see scripts/brand-assets.mts).
import "./globals.css";
import { Providers } from "@/components/providers";
import { NUMERALS_COOKIE, directionOf, isLocale, isNumeralSystem, DEFAULT_LOCALE } from "@/i18n/config";

const SITE = process.env.APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: "Aalim: evidence, not impressions", template: "%s · Aalim" },
  description: "Adaptive skills assessment. Realistic scenarios that adapt to every answer, and every score backed by the person’s own words.",
  applicationName: "Aalim",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "Aalim",
    title: "Aalim: evidence, not impressions",
    description: "Adaptive skills assessment. Every score comes with the person’s own words.",
    images: [{ url: "/brand/og-en.png", width: 1200, height: 630, alt: "Aalim: evidence, not impressions." }],
  },
  twitter: { card: "summary_large_image", images: ["/brand/og-en.png"] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efedfb" },
    { media: "(prefers-color-scheme: dark)", color: "#1b1840" },
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
  // The long-form legal pages render on the server; the browser only needs their link labels.
  const { legal, ...messages } = await getMessages();
  const legalLinks = typeof legal === "object" && legal !== null ? (legal as AbstractIntlMessages).links : undefined;
  const clientMessages: AbstractIntlMessages = legalLinks ? { ...messages, legal: { links: legalLinks } } : messages;

  return (
    <html lang={locale} dir={dir} data-text-size={textSize} suppressHydrationWarning>
      <body className="min-h-dvh">
        <NextIntlClientProvider messages={clientMessages}>
          <Providers locale={locale} numerals={numerals} dir={dir}>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
