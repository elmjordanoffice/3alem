import { test, expect } from "@playwright/test";
import { withDb } from "./db";
import { signIn } from "./helpers";

/** A ready Hire report in the demo organisation with no human review pending (seeded by db:seed:demo). */
async function demoReportSession(): Promise<string> {
  return withDb(async (c) => {
    const r = await c.query(
      `SELECT r."sessionId" FROM report r JOIN assessment_session s ON s.id = r."sessionId" WHERE s.mode = 'HIRE' AND r.status = 'READY' AND NOT s."humanReviewRequested" ORDER BY r."createdAt" DESC LIMIT 1`,
    );
    return r.rows[0].sessionId as string;
  });
}

test("an interviewer scores blind, then sees the assessment and records a decision with a reason", async ({ page }) => {
  const sessionId = await demoReportSession();
  const clean = () => withDb(async (c) => {
    await c.query(`DELETE FROM interview_scorecard WHERE "sessionId" = $1`, [sessionId]);
    await c.query(`DELETE FROM hiring_decision WHERE "sessionId" = $1`, [sessionId]);
  });
  await clean();
  try {
    await signIn(page, "orgadmin@aalim.dev");
    await page.goto(`/app/reports/${sessionId}`, { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /^Decision/ })).toContainText("Not recorded yet");
    await page.getByRole("link", { name: /Interview kit/ }).click();

    // Blind: questions and a scorecard, no assessment levels yet.
    await expect(page.getByRole("heading", { level: 1, name: "Interview kit" })).toBeVisible();
    await expect(page.getByText(/Rate before you look/)).toBeVisible();
    await expect(page.getByText("The assessment", { exact: true })).toHaveCount(0);
    const first = page.locator("article").first();
    await expect(first.getByText("Listen for")).toBeVisible();
    await first.getByRole("radio", { name: /^4/ }).click();
    await first.getByPlaceholder(/What they said and did/).fill("Named who they told and when, and what they asked for.");
    await page.getByRole("radio", { name: "Yes", exact: true }).check({ force: true });
    await page.getByLabel("Summary for the hiring team").fill("Clear ownership and concrete next steps in every answer.");
    await page.getByRole("button", { name: "Submit scorecard" }).click();

    // Revealed: the assessment's levels and the debrief.
    await expect(page.getByRole("heading", { name: "Debrief" })).toBeVisible();
    await expect(page.getByText("The assessment", { exact: true }).first()).toBeVisible();

    // Record the decision on the report.
    await page.getByRole("link", { name: /^Report for/ }).click();
    await page.getByRole("button", { name: "Record decision" }).click();
    await page.getByText("Invite to interview", { exact: true }).click();
    await page.getByLabel("Why (required)").fill("Strong evidence on judgment; test stakeholder management in person.");
    await page.getByRole("button", { name: "Save decision" }).click();
    await expect(page.getByRole("heading", { name: /^Decision/ })).toContainText("Invite to interview");
    await expect(page.getByText(/test stakeholder management in person/)).toBeVisible();

    const row = await withDb(async (c) => (await c.query(`SELECT outcome FROM hiring_decision WHERE "sessionId" = $1`, [sessionId])).rows[0]);
    expect(row?.outcome).toBe("ADVANCE");
  } finally {
    await clean();
  }
});
