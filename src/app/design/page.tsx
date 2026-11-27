import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { DOMAINS } from "@/lib/framework/data";
import { Gallery } from "./gallery";
import { samples } from "./samples";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("gallery");
  return { title: t("title"), robots: { index: false, follow: false } };
}

/** The internal component gallery: on in development and tests, off in production unless DESIGN_GALLERY=on. */
export default async function DesignPage() {
  if (process.env.NODE_ENV === "production" && process.env.DESIGN_GALLERY !== "on") notFound();
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";
  const domains = DOMAINS.map((d) => ({ key: d.key, label: d.name[locale], short: d.name[locale].split(/[\s/]+/)[0] ?? d.key }));
  return <Gallery samples={samples(locale)} domains={domains} />;
}
