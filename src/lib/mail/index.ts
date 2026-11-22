import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Transporter } from "nodemailer";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  /** Branded HTML version (see templates.ts). */
  html?: string;
}

/**
 * Mail transport (D-012, D-060).
 *
 * - With `SMTP_URL` set (any provider's SMTP: Resend, Postmark, Amazon SES,
 *   Mailgun, Google Workspace…), messages are sent for real, from `MAIL_FROM`.
 * - Without it (development and tests), each message is written to `.mail/`
 *   and the console, and nothing leaves the machine.
 */
let transporter: Transporter | null = null;

async function smtp(): Promise<Transporter> {
  if (!transporter) {
    const mod = await import("nodemailer");
    const create = mod.createTransport ?? (mod as unknown as { default: typeof mod }).default.createTransport;
    transporter = create(process.env.SMTP_URL!);
  }
  return transporter;
}

export async function sendMail(mail: Mail): Promise<void> {
  if (process.env.SMTP_URL) {
    const from = process.env.MAIL_FROM ?? "Aalim <no-reply@localhost>";
    await (await smtp()).sendMail({ from, to: mail.to, subject: mail.subject, text: mail.text, html: mail.html });
    return;
  }
  const dir = path.join(process.cwd(), ".mail");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${Date.now()}-${mail.to.replace(/[^a-z0-9@.]/gi, "_")}.json`);
  await writeFile(file, JSON.stringify(mail, null, 2));
  // An HTML copy next to it, to preview the branded email in a browser.
  if (mail.html) await writeFile(file.replace(/\.json$/, ".html"), mail.html);
  if (process.env.NODE_ENV !== "test") {
    console.info(`[mail] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
  }
}
