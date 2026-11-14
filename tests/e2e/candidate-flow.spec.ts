import { expect, test, type Page } from "@playwright/test";
import { freshInvitation, withDb } from "./db";
import { setPrefs, trackErrors } from "./helpers";

const ANSWER =
  "First I would check the numbers in the materials and confirm the risk with the people involved. I would tell my manager today, explain the trade-off clearly, and agree on who does what by Friday.";

/** Answer whatever task is on screen, in a generic but complete way. */
async function answerCurrent(page: Page) {
  const main = page.locator("main");
  // Follow-ups and reasons: any empty textarea.
  // Choice / chain / forced choice: pick the first option in every radio group.
  const groups = main.locator('[role="radiogroup"]');
  for (let i = 0; i < (await groups.count()); i++) {
    const g = groups.nth(i);
    if (!(await g.isVisible())) continue;
    const first = g.locator("label").first();
    if (await first.count()) await first.click();
  }
  // Chain: walk through rounds.
  for (let r = 0; r < 6; r++) {
    const next = main.getByRole("button", { name: /Next round/ });
    if (!(await next.count()) || !(await next.isVisible())) break;
    await main.locator('[role="radiogroup"] label').first().click();
    await next.click();
  }
  if (await main.getByRole("button", { name: /Next round|Previous round/ }).count()) {
    await main.locator('[role="radiogroup"] label').first().click();
  }
  // Allocation: put everything on the first row.
  const numbers = main.locator('input[type="number"]');
  if (await numbers.count()) {
    const total = await page.getByText(/^Split \d+ points$/).first().textContent();
    const n = Number(total?.match(/\d+/)?.[0] ?? 100);
    await numbers.first().fill(String(n));
  }
  // Inbox: triage every message, reply to the first two.
  const inboxList = main.getByRole("list", { name: /Inbox/ });
  if (await inboxList.count()) {
    const items = inboxList.locator("li");
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      await items.nth(i).locator("button").first().click();
      const action = i < 2 ? "Reply now" : "Later";
      await main.getByRole("button", { name: action, exact: true }).click();
      if (i < 2) await main.locator('textarea[id^="reply-"]').fill(ANSWER);
    }
  }
  // Role-play: three turns, then end.
  const chatInput = main.locator("#roleplay-input");
  if (await chatInput.count()) {
    for (const line of ["I understand, and I'm sorry this has hit your team. Can you tell me which invoices are affected?", "I will check them today and send you a corrected summary by 4pm, with what we are changing.", "Would a short call tomorrow at 10 help to confirm everything is fixed?"]) {
      if (!(await chatInput.isEnabled())) break;
      await chatInput.fill(line);
      await main.getByRole("button", { name: "Send" }).click();
      await expect(main.locator('[role="log"]')).toContainText(line.slice(0, 20));
      await page.waitForTimeout(200);
    }
    const end = main.getByRole("button", { name: "End conversation" });
    if (await end.isEnabled()) await end.click();
  }
  // Rich-text editor.
  const editor = main.locator(".ProseMirror");
  if (await editor.count()) {
    await editor.first().click();
    await page.keyboard.type(ANSWER, { delay: 0 });
  }
  const areas = main.locator("textarea:not(#roleplay-input):not([id^=reply-])");
  for (let i = 0; i < (await areas.count()); i++) {
    const a = areas.nth(i);
    if ((await a.isVisible()) && (await a.isEnabled()) && !(await a.inputValue())) await a.fill(ANSWER);
  }
}

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

  const seenTypes = new Set<string>();
  for (let step = 0; step < 140; step++) {
    await page.waitForLoadState("networkidle");
    if (await page.getByRole("heading", { name: /you're done/ }).isVisible()) break;
    const startChapter = page.getByRole("button", { name: /^Start chapter \d/ });
    if (await startChapter.isVisible()) {
      await startChapter.click();
      await expect(startChapter).toBeHidden({ timeout: 20_000 });
      continue;
    }
    const label = await page.locator("#task-label").textContent({ timeout: 15_000 });
    const signature = `${await page.locator("h1").first().textContent()}|${label}`;
    seenTypes.add(label ?? "");
    await answerCurrent(page);
    const submit = page.getByRole("button", { name: /^(Continue|Submit answer)$/ }).last();
    await expect(submit).toBeEnabled({ timeout: 10_000 });
    await submit.click();
    // Wait until the screen moves on: a new stage, a new scene, a transition or the end.
    await expect
      .poll(
        async () => {
          if (await page.getByRole("heading", { name: /you're done/ }).isVisible()) return "done";
          if (await page.getByRole("button", { name: /^Start chapter \d/ }).isVisible()) return "transition";
          const h = await page.locator("h1").first().textContent().catch(() => "");
          const l = await page.locator("#task-label").textContent({ timeout: 500 }).catch(() => "");
          return `${h}|${l}`;
        },
        { timeout: 20_000 },
      )
      .not.toBe(signature);
  }
  await expect(page.getByRole("heading", { name: /you're done/ })).toBeVisible();

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
