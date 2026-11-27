import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isDev = process.env.NODE_ENV === "development";
const isHttps = (process.env.BETTER_AUTH_URL ?? process.env.APP_URL ?? "").startsWith("https://");

/**
 * Content Security Policy without nonces (pages are server-rendered per
 * request; inline scripts are Next's own bootstrap). No third-party origins:
 * fonts are self-hosted and every API call is same-origin.
 */
const cspFor = (https: boolean) =>
  [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(https ? ["upgrade-insecure-requests"] : []),
  ].join("; ");

const hsts = { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" };

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspFor(isHttps) },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // The microphone is used only for optional spoken role-play answers.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isHttps ? [hsts] : []),
];

/**
 * Headers are fixed at build time, and a container image is often built
 * without the public URL. Behind a TLS proxy the scheme is known per request,
 * so HTTPS-only headers also apply whenever the proxy says it was HTTPS.
 */
const httpsHeaders = [{ key: "Content-Security-Policy", value: cspFor(true) }, hsts];

/** Links that carry a credential in the path: never leak them, never index them. */
const tokenPathHeaders = [
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Cache-Control", value: "private, no-store" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: false,
  serverExternalPackages: ["pg", "@prisma/adapter-pg"],
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      { source: "/(.*)", has: [{ type: "header", key: "x-forwarded-proto", value: "https" }], headers: httpsHeaders },
      { source: "/a/:token*", headers: tokenPathHeaders },
      { source: "/r/:token*", headers: tokenPathHeaders },
      { source: "/team-invite/:token*", headers: tokenPathHeaders },
    ];
  },
};

export default withNextIntl(nextConfig);
