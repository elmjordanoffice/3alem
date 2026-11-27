import "server-only";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

/**
 * Company details for the public legal and trust pages (/privacy, /terms,
 * /ai, /security), read from the environment at request time.
 *
 * Nothing here has a real-looking default: an unset value renders as a
 * visible placeholder, and while LEGAL_ENTITY_NAME is unset every legal page
 * shows a draft notice and asks search engines not to index it, so
 * placeholders can't ship silently (D-067, docs/legal/README.md).
 */

/** The date the policy texts were last changed. Bump it with any change to the `legal` messages. */
export const LEGAL_LAST_UPDATED = "2026-11-27";

/** Fixed parts of the stack: the AI provider (named only in the privacy policy's subprocessor list) and payments. */
export const AI_PROVIDER_NAME = "Anthropic";
export const PAYMENTS_PROVIDER_NAME = "Stripe";

export interface CompanyDetails {
  entity: string | null;
  address: string | null;
  contactEmail: string | null;
  privacyEmail: string | null;
  securityEmail: string | null;
  governingLaw: string | null;
  hostingProvider: string | null;
  hostingRegion: string | null;
  emailProvider: string | null;
  databaseProvider: string | null;
  /** Error monitoring is optional; listed as a subprocessor only when SENTRY_DSN is set. */
  errorMonitoring: string | null;
  /** True until the legal entity is filled in. */
  isDraft: boolean;
}

const env = (name: string): string | null => {
  const v = process.env[name]?.trim();
  return v ? v : null;
};

const email = (name: string): string | null => {
  const v = env(name);
  return v && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v) ? v : null;
};

/**
 * The free-text details (name, address, governing law, region) may have an
 * Arabic version in `<NAME>_AR`, used on the Arabic pages; otherwise the one
 * value is shown in both languages. Provider names are proper names and stay as written.
 */
export function companyDetails(locale: "en" | "ar" = "en"): CompanyDetails {
  const text = (name: string) => (locale === "ar" ? env(`${name}_AR`) : null) ?? env(name);
  const contactEmail = email("CONTACT_EMAIL");
  const entity = text("LEGAL_ENTITY_NAME");
  return {
    entity,
    address: text("LEGAL_ADDRESS"),
    contactEmail,
    privacyEmail: email("PRIVACY_EMAIL") ?? contactEmail,
    securityEmail: email("SECURITY_EMAIL") ?? contactEmail,
    governingLaw: text("GOVERNING_LAW"),
    hostingProvider: env("HOSTING_PROVIDER"),
    hostingRegion: text("HOSTING_REGION"),
    emailProvider: env("EMAIL_PROVIDER"),
    databaseProvider: env("DATABASE_PROVIDER"),
    errorMonitoring: env("SENTRY_DSN") ? "Sentry" : null,
    isDraft: !env("LEGAL_ENTITY_NAME"),
  };
}

/** The public site's base URL, for robots.txt, the sitemap and canonical links. */
export function siteUrl(): string {
  return (process.env.APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/+$/, "");
}

export const LEGAL_DOCS = ["privacy", "terms", "ai", "security"] as const;
export type LegalDoc = (typeof LEGAL_DOCS)[number];
export const LEGAL_PATHS: Record<LegalDoc, string> = { privacy: "/privacy", terms: "/terms", ai: "/ai", security: "/security" };

/**
 * Robots metadata for the public pages listed in the sitemap. The site-wide
 * default (root layout) is noindex; public pages become indexable once the
 * company details are filled in, so a draft or staging site is never indexed.
 */
export function publicRobots(): Metadata["robots"] {
  return companyDetails().isDraft ? { index: false, follow: false } : { index: true, follow: true };
}

export async function legalMetadata(doc: LegalDoc): Promise<Metadata> {
  const t = await getTranslations("legal.meta");
  return {
    title: t(`${doc}.title`),
    description: t(`${doc}.description`),
    alternates: { canonical: LEGAL_PATHS[doc] },
    robots: publicRobots(),
  };
}
