import { test, expect } from "@playwright/test";
import { freshInvitation, withDb } from "./db";
import { setPrefs, signIn } from "./helpers";

/** A ready Hire report in the demo organisation (seeded by db:seed:demo). */
async function demoReportSession(): Promise<string> {
  return withDb(async (c) => {
    const r = await c.query(`SELECT r."sessionId" FROM report r JOIN assessment_session s ON s.id = r."sessionId" WHERE s.mode = 'HIRE' AND r.status = 'READY' ORDER BY r."createdAt" LIMIT 1`);
    return r.rows[0].sessionId as string;
  });
}

test("before starting, a candidate can read how AI is used, practise, and ask for a human review", async ({ browser, baseURL }) => {
  const token = await freshInvitation(`ai-${Date.now()}@test.aalim`, "Sam Carter");
  const c = await browser.newContext();
  await setPrefs(c, baseURL!, { locale: "en" });
  const p = await c.newPage();
  await p.goto(`/a/${token}`, { waitUntil: "networkidle" });

  await p.getByRole("button", { name: "How AI is used in this assessment" }).click();
  await expect(p.getByRole("dialog")).toContainText("What AI never does");
  await p.getByLabel("Ask for a person to review every score").click();
  await p.getByRole("button", { name: "Done" }).click();
  await expect(p.getByText("You asked for a person to review every score.")).toBeVisible();

  await p.getByRole("button", { name: "Try a practice scene" }).click();
  await p.getByRole("radio", { name: /Ask the client/ }).click();
  await p.getByLabel(/Why\?/).fill("Tomorrow's meeting decides what matters most.");
  await p.getByRole("button", { name: "Finish practice" }).click();
  await expect(p.getByRole("status")).toContainText("That's how a scene works.");
  await p.getByRole("button", { name: "Back to the start" }).click();

  await p.locator("#consent").click();
  await p.getByRole("button", { name: "Continue" }).click();
  await expect(p.getByText("One way, like a real week")).toBeVisible();
  const requested = await withDb(async (db) => (await db.query(`SELECT s."humanReviewRequested" FROM assessment_session s JOIN invitation i ON i.id = s."invitationId" WHERE i.email LIKE 'ai-%@test.aalim' ORDER BY s."createdAt" DESC LIMIT 1`)).rows[0]?.humanReviewRequested);
  expect(requested).toBe(true);
  await c.close();
});

test("a reviewer reads the full answer behind a quote and adjusts a level with a note", async ({ page }) => {
  const sessionId = await demoReportSession();
  await signIn(page, "orgadmin@aalim.dev");
  await page.goto(`/app/reports/${sessionId}`, { waitUntil: "networkidle" });

  await page.locator("#strengths").getByRole("button", { name: "Read the full answer" }).first().click();
  await expect(page.getByRole("dialog")).toContainText("Answer");
  await page.keyboard.press("Escape");

  const note = `Reviewer check ${Date.now()}: the replies show clear ownership.`;
  await page.locator("#profile").getByRole("button", { name: /^Adjust / }).first().click();
  await page.getByRole("radio", { name: /4$/ }).click();
  await page.getByLabel("Why (required)").fill(note);
  await page.getByRole("button", { name: "Save adjustment" }).click();
  await expect(page.locator("#profile").getByText(note)).toBeVisible();

  // Restore, so the demo report stays as seeded.
  await page.locator("#profile").getByRole("button", { name: /^Adjust / }).first().click();
  await page.getByRole("button", { name: "Restore the assessment's estimate" }).click();
  await expect(page.locator("#profile").getByText(note)).toHaveCount(0);
});

test("when a candidate asked for a human review, sharing waits until someone confirms it", async ({ page }) => {
  const sessionId = await demoReportSession();
  const reset = (on: boolean) =>
    withDb((c) => c.query(`UPDATE assessment_session SET "humanReviewRequested" = $2, "humanReviewedAt" = NULL, "humanReviewedById" = NULL, "humanReviewNote" = NULL WHERE id = $1`, [sessionId, on]));
  await reset(true);
  try {
    await signIn(page, "orgadmin@aalim.dev");
    await page.goto(`/app/reports/${sessionId}`, { waitUntil: "networkidle" });
    await expect(page.getByText(/asked for a person to review every score/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Share" })).toBeDisabled();
    await page.getByRole("button", { name: "Confirm review" }).click();
    await page.getByLabel("Review note").fill("Read every answer; the levels match the evidence.");
    await page.getByRole("dialog").getByRole("button", { name: "Confirm review" }).click();
    await expect(page.getByText("Reviewed by a person")).toBeVisible();
    await expect(page.getByRole("button", { name: "Share" })).toBeEnabled();
  } finally {
    await reset(false);
  }
});
