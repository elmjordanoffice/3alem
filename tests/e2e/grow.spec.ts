import { expect, test } from "@playwright/test";
import { withDb } from "./db";
import { runSession, ANSWER } from "./answer";
import { setPrefs, trackErrors } from "./helpers";

test.describe.configure({ timeout: 300_000 });

test("an individual onboards, takes a baseline, practises and talks to the coach", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  const errors = trackErrors(page);
  const email = `grow-${Date.now()}@test.aalim`;
  await page.goto("/sign-up");
  await page.getByLabel("Full name").fill("Layla Nasser");
  await page.getByLabel("Work email").fill(email);
  await page.getByLabel("Password").fill("grow-password-123");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.getByRole("radio", { name: /For myself/ }).click();
  await page.getByRole("link", { name: "Go to my space" }).click();

  await page.goto("/app/grow");
  await expect(page).toHaveURL(/\/app\/grow\/onboarding/);
  await page.getByLabel("Your current role").fill("Software engineer");
  await page.getByLabel("Your goal").fill("Move from engineer to team lead");
  await page.getByRole("radio", { name: "3 hours" }).click();
  // Their own view of one area; the rest left as "I'm not sure".
  await page.getByRole("radiogroup", { name: /Decision-making and judgment/ }).getByRole("radio", { name: "Often" }).click();
  await page.getByRole("button", { name: "Save and continue" }).click();
  await expect(page.getByRole("heading", { name: /Your development, Layla/ })).toBeVisible();
  await expect(page.getByText(/Everything here is private to you/)).toBeVisible();

  await page.getByRole("button", { name: "Start the baseline" }).click();
  await expect(page).toHaveURL(/\/grow\/session\//);
  await page.getByRole("button", { name: "I'm ready" }).click();
  await page.getByRole("button", { name: "Start chapter 1" }).click();
  await expect(page.locator("#task-label")).toBeVisible({ timeout: 20_000 });
  await runSession(page, /Your profile is on its way/);
  await page.getByRole("link", { name: "See my profile" }).click();
  await expect(page.getByRole("heading", { name: "Your development plan" })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("heading", { name: "Your view and the evidence" })).toBeVisible();
  // The candidate view hides hiring-only sections.
  await expect(page.getByRole("heading", { name: "Interview questions" })).toHaveCount(0);

  // Practice with feedback, then a twist round.
  await page.getByRole("button", { name: "Practise this" }).first().click();
  await expect(page).toHaveURL(/\/app\/grow\/practice\//);
  const editor = page.locator(".ProseMirror");
  if (await editor.count()) {
    await editor.click();
    await page.keyboard.type(ANSWER);
  }
  for (const g of await page.locator('main [role="radiogroup"]').all()) await g.locator("label").first().click();
  const numbers = page.locator('main input[type="number"]');
  if (await numbers.count()) await numbers.first().fill(String(Number((await page.getByText(/^Split \d+ points$/).first().textContent())?.match(/\d+/)?.[0] ?? 100)));
  for (const a of await page.locator("main textarea:not(#reflection)").all()) if ((await a.isVisible()) && !(await a.inputValue())) await a.fill(ANSWER);
  await page.getByRole("button", { name: "Get feedback" }).click();
  await expect(page.getByRole("heading", { name: "Feedback" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("One strong approach", { exact: true })).toBeVisible();
  await page.getByLabel("Reflection note").fill("Next time I will quantify the risk before deciding.");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByRole("button", { name: "Saved" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Where you are, and the next level" })).toBeVisible();

  // Deliberate practice: the same scenario again, with the first attempt's advice in view.
  const firstUrl = page.url();
  await page.getByRole("button", { name: "Try this one again" }).click();
  await expect(page).not.toHaveURL(firstUrl);
  await expect(page.getByText(/Second attempt: same scenario/)).toBeVisible();

  // Coach.
  await page.goto("/app/grow/coach");
  await page.getByRole("button", { name: "Plan my practice for this week" }).click();
  await expect(page.locator('[role="log"]')).toContainText(/hours|sessions/, { timeout: 20_000 });

  // Grow data is private: no organisation can read it.
  const leaked = await withDb(async (c) => (await c.query(`SELECT count(*)::int AS n FROM assessment_session s JOIN "user" u ON u.id = s."subjectUserId" WHERE u.email = $1 AND s."organizationId" IS NOT NULL`, [email])).rows[0].n);
  expect(leaked).toBe(0);
  expect(errors).toEqual([]);
});
