import { isIP } from "node:net";

/** Only public HTTPS endpoints (http://localhost allowed outside production). Guards against SSRF. */
export function validateWebhookUrl(raw: string): { ok: true; url: URL } | { ok: false; error: string } {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, error: "invalidUrl" };
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const dev = process.env.NODE_ENV !== "production";
  if (dev && url.protocol === "http:" && (host === "localhost" || host === "127.0.0.1")) return { ok: true, url };
  if (url.protocol !== "https:") return { ok: false, error: "httpsOnly" };
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return { ok: false, error: "privateHost" };
  if (isIP(host) && isPrivateAddress(host)) return { ok: false, error: "privateHost" };
  return { ok: true, url };
}

/** Loopback, private, link-local and unique-local addresses. */
export function isPrivateAddress(ip: string): boolean {
  const host = ip.toLowerCase();
  const private4 = /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.)/;
  const mapped = host.startsWith("::ffff:") ? host.slice(7) : host;
  return private4.test(mapped) || host === "::1" || host === "::" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80");
}
