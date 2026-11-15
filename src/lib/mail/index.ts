import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface Mail {
  to: string;
  subject: string;
  text: string;
  /** Branded HTML version (see templates.ts). */
  html?: string;
}

/**
 * Mail transport. Development and tests write each message to `.mail/` and the
 * console; production will use an SMTP / provider transport (see
 * docs/decisions.md, D-012). Nothing is ever sent to an external service here.
 */
export async function sendMail(mail: Mail): Promise<void> {
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
