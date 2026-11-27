import { createHash, randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import { setPrefs, signIn, trackErrors } from "./helpers";
import { withDb } from "./db";

/**
 * Billing (D-066). The suite runs with billing off (no STRIPE_SECRET_KEY), so
 * the first test checks the "off" state. The gating test needs billing on for
 * one organisation only: start the dev server (never production) with
 * BILLING_FORCE=e2e-billing-org, and set the same variable for Playwright.
 */
const ORG = "e2e-billing-org";
const forced = (process.env.BILLING_FORCE ?? "").split(",").map((s) => s.trim()).includes(ORG);

async function removeTestOrg() {
  await withDb((c) => c.query(`DELETE FROM organization WHERE id = $1`, [ORG]));
}

test.describe("billing", () => {
  test.beforeEach(async ({ context, baseURL }) => setPrefs(context, baseURL!, { locale: "en" }));

  test("with billing off, the billing page says so and nothing is limited", async ({ page }) => {
    const errors = trackErrors(page);
    await signIn(page, "orgadmin@aalim.dev");
    await page.goto("/app/org/members");
    await page.getByRole("navigation", { name: "Northwind Logistics" }).getByRole("link", { name: "Billing" }).click();
    await expect(page).toHaveURL(/\/app\/org\/billing$/);
    await expect(page.getByRole("heading", { name: "Billing", level: 1 })).toBeVisible();
    await expect(page.getByText("Billing is off on this installation")).toBeVisible();
    await expect(page.getByText(/Everything here is unlimited/)).toBeVisible();
    await expect(page.getByRole("button", { name: /Choose Starter/ })).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("only org admins can open billing", async ({ page }) => {
    await signIn(page, "recruiter@aalim.dev");
    await page.goto("/app/org/members");
    await expect(page.getByRole("navigation", { name: "Northwind Logistics" }).getByRole("link", { name: "Billing" })).toHaveCount(0);
    await page.goto("/app/org/billing");
    await expect(page).toHaveURL(/denied=1/);
  });

  test.describe("with billing on for one organisation", () => {
    test.skip(!forced, `start the dev server with BILLING_FORCE=${ORG} (and set it for Playwright) to run this`);
    test.describe.configure({ timeout: 120_000 });
    test.afterAll(removeTestOrg);

    test("an exhausted Starter allowance refuses new invitations, and an invited candidate still gets in", async ({ page, context, baseURL }) => {
      await removeTestOrg();
      const stamp = Date.now();
      const email = `billing-admin-${stamp}@test.aalim`;

      // An admin of the test organisation (signed up for real, then made a member).
      await page.goto("/sign-up");
      await page.getByLabel("Full name").fill("Billie Gate");
      await page.getByLabel("Work email").fill(email);
      await page.getByLabel("Password").fill("correct-horse-battery");
      await page.getByRole("button", { name: "Create account" }).click();
      await expect(page).toHaveURL(/\/onboarding/);

      // The organisation, a published role (copied from the demo), a Starter plan with all
      // 25 invitations used this period, and one of those candidates' links.
      const token = randomBytes(24).toString("base64url");
      const { templateId, teamId } = await withDb(async (c) => {
        const user = (await c.query(`SELECT id FROM "user" WHERE email = $1`, [email])).rows[0].id as string;
        await c.query(`INSERT INTO organization (id, name, slug, "createdAt", "updatedAt") VALUES ($1, 'Billing Gate Ltd', $2, now(), now())`, [ORG, `e2e-billing-${stamp}`]);
        await c.query(`INSERT INTO membership (id, "organizationId", "userId", roles, "createdAt", "updatedAt") VALUES ($1, $2, $3, '{ORG_ADMIN,RECRUITER}', now(), now())`, [`m_${stamp}`, ORG, user]);
        const demo = (await c.query(`SELECT id FROM assessment_template WHERE title = 'Operations Team Lead' ORDER BY "createdAt" LIMIT 1`)).rows[0].id as string;
        const templateId = `t_e2e_${stamp}`;
        await c.query(
          `INSERT INTO assessment_template (id, "organizationId", "createdById", title, "jobDescription", analysis, "technicalSkillMap", language, "durationMinutes", accommodations, status, "publishedAt", "createdAt", "updatedAt")
           SELECT $1, $2, $3, title, "jobDescription", analysis, "technicalSkillMap", language, "durationMinutes", accommodations, 'PUBLISHED', now(), now(), now() FROM assessment_template WHERE id = $4`,
          [templateId, ORG, user, demo],
        );
        await c.query(
          `INSERT INTO template_skill_weight (id, "organizationId", "templateId", "skillKey", importance, weight)
           SELECT 'w_' || md5(random()::text || "skillKey"), $1, $2, "skillKey", importance, weight FROM template_skill_weight WHERE "templateId" = $3`,
          [ORG, templateId, demo],
        );
        await c.query(
          `INSERT INTO organization_billing (id, "organizationId", plan, status, interval, "trialStartedAt", "trialEndsAt", "currentPeriodStart", "currentPeriodEnd", "createdAt", "updatedAt")
           VALUES ($1, $2, 'starter', 'ACTIVE', 'MONTH', now() - interval '40 days', now() - interval '26 days', now() - interval '3 days', now() + interval '27 days', now(), now())`,
          [`b_${stamp}`, ORG],
        );
        for (let i = 0; i < 25; i++) {
          const hash = i === 0 ? createHash("sha256").update(token).digest("hex") : randomBytes(32).toString("hex");
          await c.query(
            `INSERT INTO invitation (id, "organizationId", "templateId", email, name, "tokenHash", status, accommodations, "expiresAt", "invitedById", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', '{}', now() + interval '10 days', $7, now() - interval '1 day', now())`,
            [`inv_e2e_${stamp}_${i}`, ORG, templateId, `gate-${stamp}-${i}@test.aalim`, i === 0 ? "Noor Salem" : null, hash, user],
          );
        }
        const teamId = `team_e2e_${stamp}`;
        await c.query(`INSERT INTO team (id, "organizationId", name, "managerUserId", goals, "createdAt", "updatedAt") VALUES ($1, $2, 'Pilot billing team', $3, '{"domains":[],"description":""}', now(), now())`, [teamId, ORG, user]);
        return { templateId, teamId };
      });

      // The billing page shows the plan and that nothing is left this period.
      await page.goto("/app/org/billing");
      await expect(page.getByRole("heading", { name: "Starter", level: 2 })).toBeVisible();
      await expect(page.getByText("None left this period")).toBeVisible();
      await expect(page.getByRole("img", { name: "25 of 25 candidate invitations used" })).toBeVisible();

      // A new invitation is refused, with the upgrade message and a way to the plans.
      await page.goto(`/app/assessments/${templateId}`);
      await page.getByRole("button", { name: "Invite candidates" }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("Candidate invitations left this month: 0 of 25")).toBeVisible();
      await dialog.getByLabel("Email addresses").fill(`new-${stamp}@test.aalim`);
      await dialog.getByRole("button", { name: "Send invitations" }).click();
      await expect(dialog.getByText("Not enough invitations left")).toBeVisible();
      await expect(dialog.getByText(/This period's candidate invitations are used up/)).toBeVisible();
      await expect(dialog.getByRole("link", { name: "See plans" })).toHaveAttribute("href", "/app/org/billing");
      expect(await withDb(async (c) => (await c.query(`SELECT count(*)::int AS n FROM invitation WHERE "organizationId" = $1`, [ORG])).rows[0].n)).toBe(25);
      await page.keyboard.press("Escape");

      // Team mode is limited the same way.
      await page.goto(`/app/teams/${teamId}`);
      await page.getByRole("button", { name: "Invite members" }).click();
      await page.getByRole("dialog").getByRole("textbox").fill(`member-${stamp}@test.aalim`);
      await page.getByRole("dialog").getByRole("button", { name: "Send invitations" }).click();
      await expect(page.getByRole("dialog").getByText("Not enough invitations left")).toBeVisible();
      await page.keyboard.press("Escape");

      // Home tells the admin when a payment has failed.
      await withDb((c) => c.query(`UPDATE organization_billing SET status = 'PAST_DUE', "pastDueSince" = now() - interval '2 days' WHERE "organizationId" = $1`, [ORG]));
      await page.goto("/app");
      const banner = page.getByRole("complementary", { name: "Billing" });
      await expect(banner).toContainText("Your last payment didn't go through");
      await expect(banner.getByRole("link", { name: "Update payment" })).toHaveAttribute("href", "/app/org/billing");

      // Someone without billing rights is told to ask an admin instead.
      await withDb((c) => c.query(`UPDATE membership SET roles = '{RECRUITER}' WHERE "organizationId" = $1`, [ORG]));
      await page.goto(`/app/assessments/${templateId}`);
      await page.getByRole("button", { name: "Invite candidates" }).click();
      await page.getByRole("dialog").getByLabel("Email addresses").fill(`new-${stamp}@test.aalim`);
      await page.getByRole("dialog").getByRole("button", { name: "Send invitations" }).click();
      await expect(page.getByRole("dialog").getByText("Ask an admin of your organisation to choose a plan.")).toBeVisible();
      await expect(page.getByRole("dialog").getByRole("link", { name: "See plans" })).toHaveCount(0);

      // A candidate invited before the limit can still open their link and start.
      const candidate = await context.browser()!.newContext();
      await setPrefs(candidate, baseURL!, { locale: "en" });
      const cand = await candidate.newPage();
      await cand.goto(`/a/${token}`);
      await expect(cand.getByRole("heading", { name: /assessment for the Operations Team Lead role/ })).toBeVisible();
      await cand.getByLabel(/I have read how my data is used/).click();
      await cand.getByRole("button", { name: "Continue" }).click();
      await cand.getByRole("button", { name: "I'm ready" }).click();
      await expect(cand.getByRole("heading", { name: /A week at/ })).toBeVisible();
      await candidate.close();
    });
  });
});
