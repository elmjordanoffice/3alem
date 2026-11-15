import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { withDb } from "./db";
import { setPrefs, signIn, trackErrors } from "./helpers";

test.describe.configure({ timeout: 120_000 });

async function axeClean(page: Page) {
  // Toasts animate in; their colours are checked when they're settled, not mid-fade.
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).exclude("[data-sonner-toaster]").analyze();
  return axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${v.id}: ${v.nodes[0]?.target}`);
}

test("security headers are sent", async ({ request }) => {
  const res = await request.get("/sign-in");
  const h = res.headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(h["permissions-policy"]).toContain("camera=()");
  const token = await request.get("/a/not-a-real-token");
  expect(token.headers()["referrer-policy"]).toBe("no-referrer");
  expect(token.headers()["x-robots-tag"]).toContain("noindex");
});

test("org admin tools: fairness, audit, integrations, library", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  const errors = trackErrors(page);
  await signIn(page, "orgadmin@aalim.dev");

  // Fairness: aggregates only, small groups suppressed. Organisation tools are tabs in the Organisation section.
  await page.getByRole("link", { name: "Organisation", exact: true }).click();
  await page.getByRole("link", { name: "Fairness" }).click();
  await expect(page.getByRole("heading", { name: "Fairness", level: 1 })).toBeVisible();
  await expect(page.getByText(/in groups smaller than 5 not shown/).first()).toBeVisible();
  expect(await axeClean(page)).toEqual([]);

  // Audit log lists recent activity with readable labels.
  await page.getByRole("link", { name: "Audit log" }).click();
  await expect(page.getByRole("heading", { name: "Audit log", level: 1 })).toBeVisible();
  await expect(page.getByRole("cell", { name: /Viewed a report|Candidate finished|Published an assessment/ }).first()).toBeVisible();
  expect(await axeClean(page)).toEqual([]);

  // Integrations: the secret is shown once; private addresses are refused.
  await page.getByRole("link", { name: "Integrations" }).click();
  await page.getByLabel("Endpoint URL").fill("https://10.0.0.8/hook");
  await page.getByRole("button", { name: "Add webhook" }).click();
  await expect(page.getByText("Private and internal addresses can't receive webhooks.")).toBeVisible();
  const url = `https://ats-${Date.now()}.example.com/hooks/aalim`;
  await page.getByLabel("Endpoint URL").fill(url);
  await page.getByRole("button", { name: "Add webhook" }).click();
  await expect(page.getByText("Copy your signing secret now")).toBeVisible();
  await expect(page.locator("code", { hasText: /^whsec_/ })).toBeVisible();
  await expect(page.getByText(url)).toBeVisible();
  const stored = await withDb(async (c) => (await c.query(`SELECT "secretEncrypted" FROM webhook WHERE url = $1`, [url])).rows[0]);
  expect(stored.secretEncrypted).not.toContain("whsec_");
  expect(await axeClean(page)).toEqual([]);
  await page.getByRole("button", { name: `Delete webhook ${url}` }).click({ trial: true });

  // Library: add an organisation skill; it appears in the framework.
  await page.getByRole("link", { name: "Competency library" }).click();
  await page.getByRole("button", { name: "Add a skill" }).click();
  const name = `Customer empathy ${Date.now() % 10000}`;
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("What it means").fill("Understands what customers need, even when they can't say it.");
  for (let l = 1; l <= 5; l++) await page.getByLabel(new RegExp(`^${l} · `)).fill(`Level ${l} behaviour, described observably.`);
  await page.getByRole("button", { name: "Save skill" }).click();
  await expect(page.getByRole("heading", { name, level: 3 })).toBeVisible();
  expect(await axeClean(page)).toEqual([]);
  await page.goto("/app/framework");
  await page.getByRole("navigation", { name: "Domains" }).getByRole("button", { name: /Critical thinking/ }).click();
  await expect(page.getByText(name)).toBeVisible();
  await withDb((c) => c.query(`DELETE FROM competency WHERE name->>'en' = $1`, [name]));
  await withDb((c) => c.query(`DELETE FROM webhook WHERE url = $1`, [url]));

  expect(errors).toEqual([]);
});

test("outcome ratings and candidate CSV export", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  await signIn(page, "orgadmin@aalim.dev");
  const sessionId = await withDb(async (c) => (await c.query(`SELECT "sessionId" FROM report WHERE kind = 'HIRE' AND status = 'READY' ORDER BY "createdAt" ASC LIMIT 1`)).rows[0].sessionId as string);
  await page.goto(`/app/reports/${sessionId}`);
  await expect(page.getByRole("heading", { name: "After the hire" })).toBeVisible();
  await page.getByRole("radiogroup", { name: "12 months in" }).getByRole("radio", { name: /Above/ }).first().click();
  await expect(page.getByText("Rating saved")).toBeVisible();
  const rating = await withDb(async (c) => (await c.query(`SELECT rating FROM outcome_rating WHERE "sessionId" = $1 AND period = 12`, [sessionId])).rows[0]?.rating);
  expect(rating).toBe(4);

  await page.goto("/app/assessments");
  await page.getByRole("link", { name: "Operations Team Lead" }).first().click();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Export CSV" }).click()]);
  const csv = await (await download.createReadStream()).toArray().then((chunks) => Buffer.concat(chunks).toString("utf8"));
  expect(csv).toContain('"name","email","status"');
  expect(csv.split("\r\n").length).toBeGreaterThan(5);
});

test("platform admin reviews the item bank", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  await signIn(page, "admin@aalim.dev");
  await page.goto("/app/admin/items");
  await expect(page.getByRole("heading", { name: "Item bank review", level: 1 })).toBeVisible();
  const row = page.getByRole("row").filter({ has: page.locator("code", { hasText: /^case-/ }) }).first();
  const id = await row.locator("code").first().textContent();
  await row.getByRole("button", { name: "Retire" }).click();
  await page.getByLabel("Reason").fill("Test retirement");
  await page.getByRole("dialog").getByRole("button", { name: "Retire" }).click();
  await expect(page.getByText("Item retired")).toBeVisible();
  const status = await withDb(async (c) => (await c.query(`SELECT status FROM bank_item_review WHERE "itemKey" = $1`, [id])).rows[0]?.status);
  expect(status).toBe("retired");
  await page.getByRole("row").filter({ has: page.locator("code", { hasText: id! }) }).getByRole("button", { name: "Restore" }).click();
  await expect(page.getByText("Item restored")).toBeVisible();
  expect(await axeClean(page)).toEqual([]);
});

test("a person exports and deletes their own data", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  const email = `delete-me-${Date.now()}@test.aalim`;
  await page.goto("/sign-up");
  await page.locator('input[name="name"]').fill("Delete Me");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill("a-strong-password-123");
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/(app|onboarding)/);
  await page.goto("/app/settings");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("link", { name: "Download" }).click()]);
  const json = JSON.parse(await (await download.createReadStream()).toArray().then((c) => Buffer.concat(c).toString("utf8")));
  expect(json.user.email).toBe(email);
  expect(await axeClean(page)).toEqual([]);

  await page.getByRole("button", { name: "Delete account" }).click();
  const confirm = page.getByRole("button", { name: "Delete everything" });
  await expect(confirm).toBeDisabled();
  await page.getByLabel(`Type ${email} to confirm`).fill(email);
  await confirm.click();
  await expect(page).toHaveURL(/\/(\?deleted=1)?$/);
  const left = await withDb(async (c) => (await c.query(`SELECT count(*)::int AS n FROM "user" WHERE email = $1`, [email])).rows[0].n);
  expect(left).toBe(0);
});
