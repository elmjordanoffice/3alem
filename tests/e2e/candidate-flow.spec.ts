import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { freshInvitation, withDb } from "./db";
import { setPrefs, trackErrors } from "./helpers";
import { runSession } from "./answer";

test.describe.configure({ timeout: 300_000 });

test("a candidate completes a full adaptive assessment and a report is produced", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  const errors = trackErrors(page);
  const token = await freshInvitation();
  await page.goto(`/a/${token}`);
  await expect(page.getByRole("heading", { name: /assessment for the Operations Team Lead role/ })).toBeVisible();
  await page.getByLabel(/I have read how my data is used/).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "I'm ready" }).click();
  await expect(page.getByRole("heading", { name: /A week at/ })).toBeVisible();
  await page.getByRole("button", { name: "Start chapter 1" }).click();

  const transitions = await runSession(page, /you're done/);
  await expect(page.getByRole("heading", { name: /you're done/ })).toBeVisible();

  // Moving between scenes feels immediate: p90 under 1.5 s.
  const sorted = [...transitions].sort((a, b) => a - b);
  const p90 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.9))]!;
  console.info(`[transitions] n=${sorted.length} median=${sorted[Math.floor(sorted.length / 2)]}ms p90=${p90}ms`);
  expect(p90).toBeLessThan(1500);

  // The completion screen is accessible, and the equal-opportunity questions are optional.
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(axe.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id)).toEqual([]);
  await expect(page.getByText(/Help us check that our assessments are fair/)).toBeVisible();
  await page.getByLabel("Age", { exact: true }).selectOption("25_34");
  await page.getByLabel("Gender", { exact: true }).selectOption("prefer_not");
  await page.getByRole("button", { name: "Send answers" }).click();
  await expect(page.getByRole("status").filter({ hasText: /^Thank you\./ })).toBeVisible();
  const fair = await withDb(async (c) =>
    (await c.query(`SELECT f.gender, f."ageBand" FROM fairness_response f JOIN assessment_session s ON s.id = f."sessionRef" JOIN invitation i ON i.id = s."invitationId" WHERE i.email LIKE 'cand-%' ORDER BY f."createdAt" DESC LIMIT 1`)).rows[0],
  );
  expect(fair).toEqual({ gender: null, ageBand: "25_34" });

  // The pipeline ran: scores with verbatim evidence, model snapshots, and a report.
  await expect
    .poll(
      async () =>
        withDb(async (c) => {
          const r = await c.query(
            `SELECT r.status FROM report r JOIN assessment_session s ON s.id = r."sessionId" JOIN invitation i ON i.id = s."invitationId" WHERE i.email LIKE 'cand-%' ORDER BY r."createdAt" DESC LIMIT 1`,
          );
          return r.rows[0]?.status ?? null;
        }),
      { timeout: 30_000 },
    )
    .toBe("READY");

  const stats = await withDb(async (c) => {
    const q = await c.query(
      `SELECT count(DISTINCT it.id)::int AS items, count(sc.id)::int AS scores, count(DISTINCT it.type)::int AS types
       FROM assessment_session s JOIN invitation i ON i.id = s."invitationId"
       JOIN item it ON it."sessionId" = s.id AND it.status = 'ANSWERED'
       LEFT JOIN item_score sc ON sc."itemId" = it.id
       WHERE i.email LIKE 'cand-%' AND s."completedAt" IS NOT NULL
       GROUP BY s.id ORDER BY max(s."completedAt") DESC LIMIT 1`,
    );
    return q.rows[0];
  });
  expect(stats.items).toBeGreaterThanOrEqual(6);
  expect(stats.scores).toBeGreaterThan(stats.items);
  expect(stats.types).toBeGreaterThanOrEqual(4);
  expect(errors).toEqual([]);
});
