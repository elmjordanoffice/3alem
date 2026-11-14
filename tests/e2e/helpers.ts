import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { expect, type BrowserContext, type Page } from "@playwright/test";

export const DEMO_PASSWORD = "aalim-demo-2026";

export async function setPrefs(context: BrowserContext, baseURL: string, prefs: { locale?: "en" | "ar"; numerals?: "latn" | "arab" }) {
  const cookies = [];
  if (prefs.locale) cookies.push({ name: "NEXT_LOCALE", value: prefs.locale, url: baseURL });
  if (prefs.numerals) cookies.push({ name: "AALIM_NUMERALS", value: prefs.numerals, url: baseURL });
  await context.addCookies(cookies);
}

export async function signIn(page: Page, email: string, password = DEMO_PASSWORD) {
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/app/);
}

/** Collect uncaught errors and console errors on a page. */
export function trackErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

/** Latest dev-mail message sent to an address (see src/lib/mail). */
export async function latestMail(to: string): Promise<{ subject: string; text: string } | null> {
  const dir = path.join(process.cwd(), ".mail");
  const files = (await readdir(dir).catch(() => [] as string[])).filter((f) => f.includes(to.replace(/[^a-z0-9@.]/gi, "_"))).sort();
  const last = files.at(-1);
  return last ? JSON.parse(await readFile(path.join(dir, last), "utf8")) : null;
}
