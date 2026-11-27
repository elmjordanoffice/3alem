import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { siteUrl } from "@/lib/legal";

/**
 * robots.txt: the public pages may be crawled; the app, candidate and share
 * links, APIs and internal pages may not. (Pages also carry their own robots
 * meta: the site-wide default is noindex, see `publicRobots` in lib/legal.)
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection(); // read APP_URL at request time, not at build time
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // "/app$" and "/app/" rather than "/app", which would also match /apple-icon.png.
      disallow: ["/app$", "/app/", "/a/", "/r/", "/api", "/team-invite", "/print", "/preview", "/grow/session", "/design", "/onboarding"],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
