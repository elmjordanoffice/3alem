import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { setPrefs, trackErrors } from "./helpers";

const COMBOS = [
  { locale: "en", theme: "light" },
  { locale: "en", theme: "dark" },
  { locale: "ar", theme: "light" },
  { locale: "ar", theme: "dark" },
] as const;

const SECTIONS = ["foundations", "controls", "navigation", "feedback", "assessment", "report"];

test.describe.configure({ timeout: 120_000 });

for (const { locale, theme } of COMBOS) {
  test(`design gallery renders every section (${locale}, ${theme})`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ colorScheme: theme });
    await setPrefs(context, baseURL!, { locale });
    const page = await context.newPage();
    const errors = trackErrors(page);
    await page.goto("/design", { waitUntil: "networkidle" });

    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.locator("html")).toHaveAttribute("lang", locale);
    if (theme === "dark") await expect(page.locator("html")).toHaveClass(/dark/);
    for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toBeVisible();

    // Spot-check the interactive specimens.
    await expect(page.locator("[data-specimen] ol li").first()).toBeVisible();
    await expect(page.getByRole("meter").first()).toBeVisible();
    await expect(page.getByRole("log")).toBeVisible();

    // No page may overflow horizontally.
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const serious = axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);

    expect(errors).toEqual([]);
    await context.close();
  });
}

test("ranking list reorders with the keyboard", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  await page.goto("/design");
  const list = page.getByRole("list", { name: "Ranking" });
  const first = list.getByRole("listitem").first();
  await expect(first).toContainText("Reply to Lina's email");
  await list.getByRole("button", { name: "Move Reply to Lina's email down" }).click();
  await expect(list.getByRole("listitem").nth(1)).toContainText("Reply to Lina's email");
  await expect(page.getByText(/moved to position 2 of 6/)).toBeAttached();
});

test("allocation never exceeds the budget", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  await page.goto("/design");
  const input = page.getByLabel("Support team training", { exact: true }).first();
  await input.fill("90");
  await expect(input).toHaveValue("15");
  await expect(page.getByText("All points allocated")).toBeVisible();
});

test("language switch flips direction", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  await page.goto("/design");
  await page.getByRole("button", { name: "Switch language" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByRole("button", { name: /تغيير اللغة|Switch language/ }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
