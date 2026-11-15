import "server-only";
import { createTranslator } from "use-intl/core";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";

type Lang = "en" | "ar";
type Kind = "invite" | "renew" | "team" | "reset" | "report";

function appUrl() {
  return (process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * One branded email layout for every message Aalim sends: table-based so it
 * renders in mail clients, RTL for Arabic, with a plain-text twin.
 */
export function brandedEmail(kind: Kind, lang: Lang, vars: Record<string, string | number>, opts: { url: string; org?: string; named?: boolean }) {
  const t = createTranslator({ locale: lang, messages: lang === "ar" ? ar : en, namespace: "emails" });
  const k = (key: string) => t(`${kind}.${key}` as "invite.cta", vars);
  const has = (key: string) => t.has(`${kind}.${key}` as "invite.cta");
  const subject = k("subject");
  const heading = opts.named && has("headingNamed") ? k("headingNamed") : k("heading");
  const paragraphs = ["p1", "p2"].filter(has).map(k);
  const note = has("note") ? k("note") : null;
  const why = opts.org ? t("footer.whyOrg", { org: opts.org }) : t("footer.whyAccount");
  const dir = lang === "ar" ? "rtl" : "ltr";
  const align = lang === "ar" ? "right" : "left";
  const font = lang === "ar" ? "'IBM Plex Sans Arabic', Tahoma, Arial, sans-serif" : "'IBM Plex Sans', 'Segoe UI', Helvetica, Arial, sans-serif";
  const display = lang === "ar" ? "Alexandria, 'IBM Plex Sans Arabic', Tahoma, Arial, sans-serif" : "Alexandria, 'IBM Plex Sans', 'Segoe UI', Helvetica, Arial, sans-serif";
  const base = appUrl();

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#fafaf9;">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(k("preheader"))}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fafaf9;padding:32px 12px;"><tr><td align="center">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;" dir="${dir}">
    <tr><td style="background:#17184a;border-radius:16px 16px 0 0;padding:22px 32px;" align="${align}">
      <img src="${base}/brand/logo-email.png" width="140" alt="Aalim" style="display:block;border:0;width:140px;height:auto;">
    </td></tr>
    <tr><td style="background:#ffffff;border:1px solid #e7e5e4;border-top:0;border-radius:0 0 16px 16px;padding:36px 32px 32px;font-family:${font};color:#1c1917;" align="${align}">
      ${opts.org ? `<p style="margin:0 0 12px;font-size:13px;color:#736d68;">${esc(opts.org)}</p>` : ""}
      <h1 style="margin:0 0 20px;font-family:${display};font-size:26px;line-height:${lang === "ar" ? 1.4 : 1.2};font-weight:600;color:#1c1917;">${esc(heading)}</h1>
      ${paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:${lang === "ar" ? 1.8 : 1.6};color:#44403c;">${esc(p)}</p>`).join("")}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;"><tr><td style="background:#3b3fd8;border-radius:8px;">
        <a href="${esc(opts.url)}" style="display:inline-block;padding:13px 24px;font-family:${font};font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;">${esc(k("cta"))}</a>
      </td></tr></table>
      ${note ? `<p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#736d68;">${esc(note)}</p>` : ""}
      <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#a8a29e;word-break:break-all;" dir="ltr">${esc(opts.url)}</p>
    </td></tr>
    <tr><td style="padding:22px 32px 0;font-family:${font};font-size:12px;line-height:1.6;color:#736d68;" align="${align}">
      <p style="margin:0;font-family:${display};font-weight:600;color:#17184a;">${esc(t("footer.tagline"))}</p>
      <p style="margin:6px 0 0;">${esc(why)}</p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const text = [heading, "", ...paragraphs.flatMap((p) => [p, ""]), `${k("cta")}: ${opts.url}`, ...(note ? ["", note] : []), "", "—", t("footer.tagline"), why].join("\n");
  return { subject, html, text };
}
