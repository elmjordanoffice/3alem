import "server-only";
import { createTranslator } from "use-intl/core";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";

type Lang = "en" | "ar";
type Kind = "invite" | "renew" | "team" | "reset" | "report" | "rep";

function appUrl() {
  return (process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Range, for mail clients: bone around a white card, ink text, one vermilion
 * tick and one vermilion button with ink text (never bone on vermilion).
 * Colours are fixed hex (tokens don't reach an inbox) and every text pair
 * passes WCAG AA: ink 18.4:1 and stone 5.9:1 on white, ink 5.0:1 on vermilion.
 */
const C = {
  bone: "#f2f0eb",
  white: "#ffffff",
  ink: "#141414",
  stone700: "#4f4b45",
  stone600: "#67635b",
  hairline: "#e2ded5",
  signal: "#f04a23",
} as const;

/** logo-email.png is drawn at 3× (420 × 71) for a 140 px slot. */
const LOGO = { width: 140, height: 24 };

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
  const rtl = lang === "ar";
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";
  // Brand faces first for clients that have them; system faces carry the rest.
  const font = rtl ? "'IBM Plex Sans Arabic', Tahoma, Arial, sans-serif" : "'IBM Plex Sans', 'Segoe UI', Helvetica, Arial, sans-serif";
  const display = rtl ? "Beiruti, 'IBM Plex Sans Arabic', Tahoma, Arial, sans-serif" : "'Archivo', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  const leading = rtl ? 1.8 : 1.6;
  const base = appUrl();

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.bone};" bgcolor="${C.bone}">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all">${esc(k("preheader"))}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bone};" bgcolor="${C.bone}"><tr><td align="center" style="padding:40px 12px 48px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;" dir="${dir}">
    <tr><td align="${align}" style="padding:0 4px 24px;">
      <img src="${base}/brand/logo-email.png" width="${LOGO.width}" height="${LOGO.height}" alt="Aalim · عالم" style="display:block;border:0;outline:none;width:${LOGO.width}px;height:auto;">
    </td></tr>
    <tr><td align="${align}" bgcolor="${C.white}" style="background:${C.white};border:1px solid ${C.hairline};border-radius:16px;padding:32px 32px 30px;font-family:${font};color:${C.ink};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin:0 0 24px;"><tr><td width="40" height="3" bgcolor="${C.signal}" style="width:40px;height:3px;background:${C.signal};font-size:0;line-height:0;">&nbsp;</td></tr></table>
      <div style="clear:both;"></div>
      ${opts.org ? `<p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:${C.stone600};">${esc(opts.org)}</p>` : ""}
      <h1 style="margin:0 0 20px;font-family:${display};font-size:${rtl ? 28 : 26}px;line-height:${rtl ? 1.4 : 1.2};font-weight:800;letter-spacing:${rtl ? 0 : "-0.01em"};color:${C.ink};">${esc(heading)}</h1>
      ${paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:${leading};color:${C.stone700};">${esc(p)}</p>`).join("")}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin:28px 0 8px;"><tr><td bgcolor="${C.signal}" style="background:${C.signal};border-radius:10px;">
        <a href="${esc(opts.url)}" style="display:inline-block;padding:14px 26px;font-family:${font};font-size:16px;line-height:1.2;font-weight:600;color:${C.ink};text-decoration:none;border-radius:10px;">${esc(k("cta"))}</a>
      </td></tr></table>
      <div style="clear:both;"></div>
      ${note ? `<p style="margin:20px 0 0;font-size:14px;line-height:${leading};color:${C.stone600};">${esc(note)}</p>` : ""}
      <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${C.hairline};font-size:12px;line-height:1.6;color:${C.stone600};word-break:break-all;" dir="ltr" align="${align}">${esc(opts.url)}</p>
    </td></tr>
    <tr><td align="${align}" style="padding:24px 4px 0;font-family:${font};font-size:12px;line-height:1.6;color:${C.stone600};">
      <p style="margin:0;font-size:13px;font-weight:600;color:${C.ink};">${esc(t("footer.tagline"))}</p>
      <p style="margin:6px 0 0;">${esc(why)}</p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const text = [heading, "", ...paragraphs.flatMap((p) => [p, ""]), `${k("cta")}: ${opts.url}`, ...(note ? ["", note] : []), "", "—", t("footer.tagline"), why].join("\n");
  return { subject, html, text };
}
