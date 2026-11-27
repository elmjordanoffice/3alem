import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { freshInvitation } from "./db";
import { DEMO_PASSWORD, setPrefs, trackErrors } from "./helpers";

/** The public legal and trust pages (D-067). */
const PAGES = [
  { path: "/privacy", en: "Privacy policy", ar: "سياسة الخصوصية" },
  { path: "/terms", en: "Terms of service", ar: "شروط الخدمة" },
  { path: "/ai", en: "How Aalim uses AI", ar: "كيف يستخدم عالِم الذكاء الاصطناعي" },
  { path: "/security", en: "Security", ar: "الأمان" },
] as const;

async function violations(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude("nextjs-portal").analyze();
  return r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).slice(0, 3).join(", ")}`);
}

for (const locale of ["en", "ar"] as const) {
  test(`each legal page renders with its heading and contents (${locale})`, async ({ page, context, baseURL }) => {
    await setPrefs(context, baseURL!, { locale });
    const errors = trackErrors(page);
    for (const p of PAGES) {
      await page.goto(p.path);
      await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
      await expect(page.getByRole("heading", { level: 1, name: p[locale], exact: true })).toBeVisible();
      await expect(page.locator("main time[datetime]")).toBeVisible();
      // Every contents entry points at a section on the page.
      const anchors = await page.locator('nav[aria-label] a[href^="#"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
      expect(anchors.length, p.path).toBeGreaterThan(3);
      for (const href of new Set(anchors)) await expect(page.locator(`section${href}`)).toHaveCount(1);
      // No horizontal scroll at desktop width.
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test("the landing footer links to every legal page", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  for (const p of PAGES) {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Policies" }).getByRole("link", { name: p.en, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`${p.path}$`));
    await expect(page.getByRole("heading", { level: 1, name: p.en, exact: true })).toBeVisible();
    // On the page itself, its own footer link is marked as current.
    await expect(page.getByRole("navigation", { name: "Policies" }).getByRole("link", { name: p.en, exact: true })).toHaveAttribute("aria-current", "page");
  }
});

test("sign-up shows the consent line, linked to the terms and the privacy policy", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  await page.goto("/sign-up");
  await expect(page.getByText("By creating an account you agree to the")).toBeVisible();
  await expect(page.getByRole("link", { name: "Privacy policy", exact: true })).toHaveAttribute("href", "/privacy");
  await page.getByRole("link", { name: "Terms of service", exact: true }).click();
  await expect(page).toHaveURL(/\/terms$/);

  await setPrefs(context, baseURL!, { locale: "ar" });
  await page.goto("/sign-up");
  await expect(page.getByRole("link", { name: "شروط الخدمة", exact: true })).toHaveAttribute("href", "/terms");
  await expect(page.getByRole("link", { name: "سياسة الخصوصية", exact: true })).toHaveAttribute("href", "/privacy");
});

test("settings links to the policies", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  // Straight to settings after sign-in (a cold dev server can take a while to compile the app).
  await page.goto("/sign-in?next=%2Fapp%2Fsettings");
  await page.locator('input[name="email"]').fill("orgadmin@aalim.dev");
  await page.locator('input[name="password"]').fill(DEMO_PASSWORD);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/app\/settings$/, { timeout: 60_000 });
  const nav = page.getByRole("navigation", { name: "Policies" });
  await expect(nav.getByRole("link", { name: "Privacy policy" })).toHaveAttribute("href", "/privacy");
  await expect(nav.getByRole("link", { name: "Terms of service" })).toHaveAttribute("href", "/terms");
});

test("the candidate's start screen and AI sheet link to the privacy policy and the AI page", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  await page.goto(`/a/${await freshInvitation()}`);
  const dataUse = page.locator("section[aria-labelledby=data-use]");
  await expect(dataUse.getByRole("link", { name: /^Privacy policy/ })).toHaveAttribute("href", "/privacy");
  await expect(dataUse.getByRole("link", { name: /^How Aalim uses AI/ })).toHaveAttribute("target", "_blank");
  await page.getByRole("button", { name: "How AI is used in this assessment" }).click();
  const sheet = page.getByRole("dialog");
  await expect(sheet.getByRole("link", { name: /^How Aalim uses AI.*new tab/ })).toHaveAttribute("href", "/ai");
  await expect(sheet.getByRole("link", { name: /^Privacy policy/ })).toHaveAttribute("href", "/privacy");
});

test("robots.txt and the sitemap cover the public pages", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  for (const path of ["/app/", "/a/", "/r/", "/api", "/team-invite", "/print", "/preview", "/grow/session", "/design"]) expect(robots).toContain(`Disallow: ${path}`);
  expect(robots).toMatch(/Sitemap: .+\/sitemap\.xml/);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/sign-in", "/sign-up", "/privacy", "/terms", "/ai", "/security", "/brand"]) expect(sitemap).toContain(`${path}</loc>`);
});

for (const { locale, theme } of [
  { locale: "en", theme: "light" },
  { locale: "en", theme: "dark" },
  { locale: "ar", theme: "dark" },
] as const) {
  test(`the privacy and AI pages have no accessibility violations (${locale}, ${theme})`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ colorScheme: theme });
    await setPrefs(context, baseURL!, { locale });
    await context.addInitScript((t) => localStorage.setItem("theme", t), theme);
    const page = await context.newPage();
    for (const path of ["/privacy", "/ai"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      expect(await violations(page), path).toEqual([]);
    }
    // Phone width: the contents fold away and tables become cards, with no sideways scroll.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/privacy", { waitUntil: "networkidle" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await violations(page), "/privacy at 390px").toEqual([]);
    await context.close();
  });
}
