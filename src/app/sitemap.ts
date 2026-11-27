import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { LEGAL_DOCS, LEGAL_LAST_UPDATED, LEGAL_PATHS, siteUrl } from "@/lib/legal";

/** The public pages. URLs carry no locale (D-006): each page serves English or Arabic from the visitor's choice. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection(); // read APP_URL at request time, not at build time
  const base = siteUrl();
  const legalUpdated = new Date(`${LEGAL_LAST_UPDATED}T00:00:00Z`);
  return [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/sign-up`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/sign-in`, changeFrequency: "yearly", priority: 0.4 },
    ...LEGAL_DOCS.map((doc) => ({ url: `${base}${LEGAL_PATHS[doc]}`, lastModified: legalUpdated, changeFrequency: "yearly" as const, priority: doc === "ai" ? 0.7 : 0.5 })),
    { url: `${base}/brand`, changeFrequency: "monthly", priority: 0.3 },
  ];
}
