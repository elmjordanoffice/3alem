import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { withDb } from "./db";
import { setPrefs, signIn } from "./helpers";

/** The redesigned key surfaces pass WCAG AA in both themes and both languages. */
const COMBOS = [
  { locale: "en", theme: "light" },
  { locale: "ar", theme: "dark" },
] as const;

async function serious(page: import("@playwright/test").Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude("[data-sonner-toaster]").exclude("nextjs-portal").analyze();
  return r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`);
}

for (const { locale, theme } of COMBOS) {
  test(`landing, sign-in, home and report are accessible (${locale}, ${theme})`, async ({ browser, baseURL }) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({ colorScheme: theme });
    await setPrefs(context, baseURL!, { locale });
    const page = await context.newPage();
    for (const path of ["/", "/sign-in", "/brand", "/missing-page"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(2200); // let the one hero animation finish
      expect(await serious(page), path).toEqual([]);
    }
    await signIn(page, "orgadmin@aalim.dev");
    await setPrefs(context, baseURL!, { locale });
    await page.goto("/app", { waitUntil: "networkidle" });
    expect(await serious(page), "/app").toEqual([]);
    const sessionId = await withDb(async (c) => (await c.query(`SELECT "sessionId" FROM report WHERE kind = 'HIRE' AND status = 'READY' ORDER BY "createdAt" LIMIT 1`)).rows[0].sessionId as string);
    await page.goto(`/app/reports/${sessionId}`, { waitUntil: "networkidle" });
    expect(await serious(page), "report").toEqual([]);
    await context.close();
  });
}

test("the command menu finds candidates and pages", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  await signIn(page, "orgadmin@aalim.dev");
  await page.getByRole("button", { name: "Search" }).first().click();
  await page.keyboard.type("hana");
  await expect(page.getByRole("option", { name: /Hana Al-Sayed/ })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/app\/reports\//);
  await page.keyboard.press("Control+k");
  await page.keyboard.type("fairness");
  await page.getByRole("option", { name: /Fairness/ }).click();
  await expect(page).toHaveURL(/\/app\/org\/fairness/);
});
