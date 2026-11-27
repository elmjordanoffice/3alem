import "server-only";
import { createTranslator } from "use-intl/core";
import en from "../../../messages/en.json";
import ar from "../../../messages/ar.json";

type Lang = "en" | "ar";
type Kind = "invite" | "renew" | "team" | "reset" | "report" | "rep" | "budgetNear" | "budgetReached";

function appUrl() {
  return (process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Night, for mail clients (D-061): the light theme, since inboxes vary. A
 * lavender ground around a rounded white card, indigo text, a violet tick and
 * one violet button with white text. Colours are fixed hex (tokens don't reach
 * an inbox) and every text pair passes WCAG AA on white: indigo 15.9:1,
 * secondary 9.0:1, tertiary 6.4:1, and white on violet 6.1:1.
 */
const C = {
  ground: "#efedfb",
  white: "#ffffff",
  text: "#1b1840",
  secondary: "#4a4575",
  tertiary: "#5f5a8c",
  hairline: "#e1ddf5",
  accent: "#5847d6",
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
  const font = rtl ? "'Readex Pro', Tahoma, Arial, sans-serif" : "'Plus Jakarta Sans', 'Segoe UI', Helvetica, Arial, sans-serif";
  const display = font;
  const leading = rtl ? 1.8 : 1.6;
  const base = appUrl();

  const html = `<!doctype html>
<html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.ground};" bgcolor="${C.ground}">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;mso-hide:all">${esc(k("preheader"))}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.ground};" bgcolor="${C.ground}"><tr><td align="center" style="padding:40px 12px 48px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;" dir="${dir}">
    <tr><td align="${align}" style="padding:0 4px 24px;">
      <img src="${base}/brand/logo-email.png" width="${LOGO.width}" height="${LOGO.height}" alt="Aalim · عالم" style="display:block;border:0;outline:none;width:${LOGO.width}px;height:auto;">
    </td></tr>
    <tr><td align="${align}" bgcolor="${C.white}" style="background:${C.white};border:1px solid ${C.hairline};border-radius:24px;padding:32px 32px 30px;font-family:${font};color:${C.text};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin:0 0 24px;"><tr><td width="40" height="4" bgcolor="${C.accent}" style="width:40px;height:4px;background:${C.accent};border-radius:4px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
      <div style="clear:both;"></div>
      ${opts.org ? `<p style="margin:0 0 10px;font-size:13px;line-height:1.5;color:${C.tertiary};">${esc(opts.org)}</p>` : ""}
      <h1 style="margin:0 0 20px;font-family:${display};font-size:${rtl ? 28 : 26}px;line-height:${rtl ? 1.4 : 1.2};font-weight:800;letter-spacing:${rtl ? 0 : "-0.01em"};color:${C.text};">${esc(heading)}</h1>
      ${paragraphs.map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:${leading};color:${C.secondary};">${esc(p)}</p>`).join("")}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}" style="margin:28px 0 8px;"><tr><td bgcolor="${C.accent}" style="background:${C.accent};border-radius:999px;">
        <a href="${esc(opts.url)}" style="display:inline-block;padding:14px 28px;font-family:${font};font-size:16px;line-height:1.2;font-weight:700;color:${C.white};text-decoration:none;border-radius:999px;">${esc(k("cta"))}</a>
      </td></tr></table>
      <div style="clear:both;"></div>
      ${note ? `<p style="margin:20px 0 0;font-size:14px;line-height:${leading};color:${C.tertiary};">${esc(note)}</p>` : ""}
      <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid ${C.hairline};font-size:12px;line-height:1.6;color:${C.tertiary};word-break:break-all;" dir="ltr" align="${align}">${esc(opts.url)}</p>
    </td></tr>
    <tr><td align="${align}" style="padding:24px 4px 0;font-family:${font};font-size:12px;line-height:1.6;color:${C.tertiary};">
      <p style="margin:0;font-size:13px;font-weight:600;color:${C.text};">${esc(t("footer.tagline"))}</p>
      <p style="margin:6px 0 0;">${esc(why)}</p>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const text = [heading, "", ...paragraphs.flatMap((p) => [p, ""]), `${k("cta")}: ${opts.url}`, ...(note ? ["", note] : []), "", "—", t("footer.tagline"), why].join("\n");
  return { subject, html, text };
}
