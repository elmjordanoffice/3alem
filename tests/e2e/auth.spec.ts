import { expect, test } from "@playwright/test";
import { latestMail, setPrefs, trackErrors } from "./helpers";

test.describe("authentication and organisations", () => {
  test("sign up, create an organisation, sign out, sign back in", async ({ page, context, baseURL }) => {
    await setPrefs(context, baseURL!, { locale: "en" });
    const errors = trackErrors(page);
    const email = `e2e-${Date.now()}@test.aalim`;

    await page.goto("/sign-up");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Enter your name.")).toBeVisible();
    await expect(page.getByText("Use at least 10 characters.")).toBeVisible();

    await page.getByLabel("Full name").fill("Mariam Haddad");
    await page.getByLabel("Work email").fill(email);
    await page.getByLabel("Password").fill("correct-horse-battery");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL(/\/onboarding/);
    await page.getByRole("radio", { name: /For my organisation/ }).click();
    await page.getByLabel("Organisation name").fill("Acme Freight");
    await page.getByRole("button", { name: "Create organisation" }).click();

    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { name: /Good to see you, Mariam/ })).toBeVisible();
    await expect(page.getByText(/, Acme Freight$/)).toBeVisible();

    await page.getByRole("link", { name: "Organisation", exact: true }).click();
    await expect(page.getByRole("cell", { name: /Mariam Haddad/ }).first()).toBeVisible();
    await expect(page.getByRole("cell", { name: /Organisation admin/ }).first()).toBeVisible();

    // The last admin cannot be demoted.
    await page.getByRole("button", { name: "Actions for Mariam Haddad" }).click();
    await page.getByRole("menuitem", { name: "Change roles" }).click();
    await page.getByRole("checkbox", { name: /Organisation admin/ }).click();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText(/Every organisation needs at least one admin/)).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    // Sign out from the account menu, then back in.
    await page.getByRole("button", { name: /Mariam Haddad/ }).first().click();
    await page.getByRole("menuitem", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/sign-in/);

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("wrong-password-123");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText(/That email and password do not match/)).toBeVisible();

    await page.getByLabel("Password").fill("correct-horse-battery");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/app$/);

    expect(errors.filter((e) => !e.includes("401"))).toEqual([]);
  });

  test("resets a forgotten password by email", async ({ page, context, baseURL }) => {
    await setPrefs(context, baseURL!, { locale: "en" });
    const email = `reset-${Date.now()}@test.aalim`;
    await page.goto("/sign-up");
    await page.getByLabel("Full name").fill("Kofi Mensah");
    await page.getByLabel("Work email").fill(email);
    await page.getByLabel("Password").fill("first-password-1");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/onboarding/);
    await context.clearCookies();

    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

    await expect.poll(async () => (await latestMail(email))?.text ?? "").toContain("reset-password");
    const mail = await latestMail(email);
    const link = mail!.text.match(/https?:\/\/\S+/)![0];
    await page.goto(link.replace(/^https?:\/\/[^/]+/, baseURL!));
    await expect(page).toHaveURL(/\/reset-password\?token=/);
    await page.getByLabel("New password").fill("second-password-2");
    await page.getByRole("button", { name: "Save new password" }).click();
    await expect(page).toHaveURL(/\/sign-in\?reset=1/);
    await expect(page.getByText(/Your password has been changed/)).toBeVisible();

    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("second-password-2");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/app/);
  });

  test("redirects signed-out visitors to sign in", async ({ page }) => {
    await page.goto("/app/org/members");
    await expect(page).toHaveURL(/\/sign-in/);
  });
});
