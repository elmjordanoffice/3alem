import { expect, test } from "@playwright/test";
import { withDb } from "./db";
import { setPrefs, signIn, trackErrors } from "./helpers";

const JD = `Senior Data Analyst

We are hiring a Senior Data Analyst to own reporting for our retail marketplace. You will write SQL against our warehouse, design experiments, and turn analysis into clear recommendations for product and commercial teams.

Requirements
- 5+ years in analytics, strong SQL and statistics
- Experience with A/B testing and dashboard design
- Native English speaker
- Able to explain findings to senior stakeholders`;

test.describe.configure({ timeout: 120_000 });

test("create, review, publish and invite", async ({ page, browser, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  const errors = trackErrors(page);
  await signIn(page, "orgadmin@aalim.dev");
  await page.goto("/app/assessments/new");
  await page.getByLabel("Job description").fill(JD);
  await page.getByRole("button", { name: "Analyse job description" }).click();
  await expect(page).toHaveURL(/\/setup$/, { timeout: 30_000 });

  // The discriminatory requirement is flagged and blocks publishing until reviewed.
  await expect(page.getByText(/requirement.* to review/)).toBeVisible();
  await expect(page.getByText(/Native English speaker/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Publish" })).toBeDisabled();
  await expect(page.getByRole("textbox", { name: "Skill name" }).first()).toHaveValue(/SQL|query|Statistic|data/i);

  await page.getByLabel(/I've reviewed these/).click();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page).toHaveURL(/\/app\/assessments\/[^/]+$/);

  await page.getByRole("button", { name: "Invite candidates" }).click();
  await page.getByRole("tab", { name: "Links only" }).click();
  const email = `link-${Date.now()}@test.aalim`;
  await page.getByLabel(/Email addresses \(no emails are sent\)/).fill(`Noor Hassan, ${email}`);
  await page.getByRole("button", { name: "Create links" }).click();
  const link = await page.locator("code, .font-mono").filter({ hasText: "/a/" }).first().textContent();
  expect(link).toContain("/a/");

  const candidate = await browser.newContext();
  await candidate.addCookies([{ name: "NEXT_LOCALE", value: "en", url: baseURL! }]);
  const cp = await candidate.newPage();
  await cp.goto(link!.replace(/^https?:\/\/[^/]+/, baseURL!));
  await expect(cp.getByRole("heading", { name: /Noor, you're invited to an assessment for the Senior Data Analyst role/ })).toBeVisible();
  await candidate.close();
  expect(errors).toEqual([]);
});

test("share a report with an expiring link and export a PDF", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  const sessionId = await withDb(async (c) => (await c.query(`SELECT "sessionId" FROM report WHERE status='READY' ORDER BY "createdAt" DESC LIMIT 1`)).rows[0]?.sessionId as string | undefined);
  test.skip(!sessionId, "needs a completed session (run candidate-flow first)");
  await signIn(page, "orgadmin@aalim.dev");
  await page.goto(`/app/reports/${sessionId}`);
  for (const s of ["Summary", "Skill profile", "Strengths", "Hidden potential", "Development areas", "Work style", "How they decide", "Interview questions", "Confidence and integrity", "How these scores were produced"]) {
    await expect(page.getByRole("heading", { name: s, level: 2 })).toBeVisible();
  }
  await page.getByRole("button", { name: "Share" }).click();
  await page.getByRole("button", { name: "Create link" }).click();
  const link = await page.locator("code").filter({ hasText: "/r/" }).textContent();
  const pub = await page.context().browser()!.newContext();
  const pp = await pub.newPage();
  await pp.goto(link!.replace(/^https?:\/\/[^/]+/, baseURL!));
  await expect(pp.getByRole("heading", { name: "Summary", level: 2 })).toBeVisible();
  await pub.close();

  const pdf = await page.request.get(`/api/reports/${sessionId}/pdf`);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toBe("application/pdf");
});

test("hiring managers can read reports but not share them", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  const sessionId = await withDb(async (c) => (await c.query(`SELECT "sessionId" FROM report WHERE status='READY' LIMIT 1`)).rows[0]?.sessionId as string | undefined);
  test.skip(!sessionId, "needs a completed session");
  await signIn(page, "manager@aalim.dev");
  await page.goto(`/app/reports/${sessionId}`);
  await expect(page.getByRole("heading", { name: "Summary", level: 2 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Share" })).toHaveCount(0);
  await page.goto("/app/assessments/new");
  await expect(page).toHaveURL(/denied=1/);
});
