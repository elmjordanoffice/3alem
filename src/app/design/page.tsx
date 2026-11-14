import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { isLocale } from "@/i18n/config";
import { DOMAINS } from "@/lib/framework/data";
import { Gallery } from "./gallery";
import { samples } from "./samples";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("gallery");
  return { title: t("title") };
}

export default async function DesignPage() {
  const raw = await getLocale();
  const locale = isLocale(raw) ? raw : "en";
  const domains = DOMAINS.map((d) => ({ key: d.key, label: d.name[locale], short: d.name[locale].split(/[\s/]+/)[0] ?? d.key }));
  return <Gallery samples={samples(locale)} domains={domains} />;
}
