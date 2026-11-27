import { expect, test } from "@playwright/test";
import { latestMail, setPrefs, signIn, trackErrors } from "./helpers";
import { withDb } from "./db";

test.describe.configure({ timeout: 180_000 });

test("a team of six shows a named heatmap, pipeline and pairings", async ({ page, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  const teamId = await withDb(async (c) => (await c.query(`SELECT id FROM team WHERE name = 'Regional Operations' LIMIT 1`)).rows[0]?.id as string | undefined);
  test.skip(!teamId, "run npm run db:seed:demo first");
  const errors = trackErrors(page);
  await signIn(page, "team@aalim.dev");
  await page.getByRole("link", { name: "Teams" }).click();
  await page.getByRole("link", { name: /Regional Operations/ }).click();
  await expect(page.getByText("A development tool, not a performance review")).toBeVisible();
  await expect(page.getByRole("table")).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Rania Aziz" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Coverage and gaps" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Leadership pipeline" })).toBeVisible();

  // A member who did not share answers: levels only, no quotes.
  const noShare = await withDb(async (c) => (await c.query(`SELECT id FROM team_member WHERE "teamId" = $1 AND "shareRawAnswers" = false AND status = 'ASSESSED' LIMIT 1`, [teamId])).rows[0].id as string);
  await page.goto(`/app/teams/${teamId}/members/${noShare}`);
  await expect(page.getByText(/hasn't shared their answers/).filter({ visible: true }).first()).toBeVisible();
  await expect(page.locator("blockquote")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("a small team stays anonymous and nothing happens without consent", async ({ page, browser, context, baseURL }) => {
  await setPrefs(context, baseURL!, { locale: "en" });
  await signIn(page, "team@aalim.dev");
  await page.goto("/app/teams");
  await page.getByRole("button", { name: "New team" }).first().click();
  await page.getByLabel("Team name").fill(`Pilot ${Date.now()}`);
  await page.getByRole("checkbox").first().click();
  await page.getByRole("button", { name: "Create team" }).click();
  await expect(page).toHaveURL(/\/app\/teams\/[^/]+$/);
  const teamUrl = page.url();

  const email = `member-${Date.now()}@test.aalim`;
  await page.getByRole("button", { name: "Invite members" }).click();
  await page.getByLabel("Email addresses").fill(email);
  await page.getByRole("button", { name: "Send invitations" }).click();
  await expect(page.getByText(/Invited/).first()).toBeVisible();
  await expect(page.getByText(/only anonymised team totals/).filter({ visible: true }).first()).toBeVisible();

  await expect.poll(async () => (await latestMail(email))?.text ?? "").toContain("/team-invite/");
  const link = (await latestMail(email))!.text.match(/https?:\/\/\S+\/team-invite\/\S+/)![0];

  const member = await browser.newContext();
  await member.addCookies([{ name: "NEXT_LOCALE", value: "en", url: baseURL! }]);
  const mp = await member.newPage();
  await mp.goto(link.replace(/^https?:\/\/[^/]+/, baseURL!));
  await mp.getByRole("link", { name: "Create an account" }).click();
  await mp.getByLabel("Full name").fill("Omar Saleh");
  await mp.getByLabel("Work email").fill(email);
  await mp.getByLabel("Password").fill("member-password-1");
  await mp.getByRole("button", { name: "Create account" }).click();
  await expect(mp.getByText("This is for development, not evaluation")).toBeVisible();
  await expect(mp.getByRole("button", { name: "Take part" })).toBeDisabled();
  await mp.getByLabel("I agree to take part in this team assessment.").click();
  await mp.getByRole("button", { name: "Take part" }).click();
  await expect(mp).toHaveURL(/\/grow\/session\//);
  await member.close();

  await page.goto(teamUrl);
  await expect(page.getByText("Taking part")).toBeVisible();
  await expect(page.getByRole("table")).toHaveCount(0);
});

test("a team's gaps become a drafted role for the next hire", async ({ page, context, baseURL }) => {
  const teamId = await withDb(async (c) => (await c.query(`SELECT id FROM team WHERE name = 'Regional Operations' LIMIT 1`)).rows[0]?.id as string | undefined);
  test.skip(!teamId, "run npm run db:seed:demo first");
  await signIn(page, "orgadmin@aalim.dev");
  await setPrefs(context, baseURL!, { locale: "en" });
  await page.goto(`/app/teams/${teamId}`, { waitUntil: "networkidle" });
  const brief = page.getByRole("region", { name: /Next steps for Regional Operations/ });
  await expect(brief).toContainText(/Hiring soon\? Someone strong in/);
  await brief.getByRole("link", { name: "Draft the role" }).click();
  await expect(page).toHaveURL(/\/app\/assessments\/new\?team=/);
  await expect(page.getByText("A first draft for your next hire")).toBeVisible();
  await expect(page.getByLabel("Job description")).toHaveValue(/^Regional Operations: new team member/);
});
