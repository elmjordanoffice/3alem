import { expect, test } from "@playwright/test";
import { setPrefs, signIn } from "./helpers";

test.describe("roles", () => {
  test.beforeEach(async ({ context, baseURL }) => setPrefs(context, baseURL!, { locale: "en" }));

  test("org admin can manage members and settings", async ({ page }) => {
    await signIn(page, "orgadmin@aalim.dev");
    await page.getByRole("link", { name: "Organisation", exact: true }).click();
    await expect(page.getByRole("navigation", { name: "Northwind Logistics" }).getByRole("link", { name: "Settings" })).toBeVisible();
    await page.goto("/app/org/members");
    await expect(page.getByRole("button", { name: "Add member" })).toBeVisible();
    await page.goto("/app/org/settings");
    await expect(page.getByRole("heading", { name: "Organisation settings" })).toBeVisible();
  });

  test("hiring manager cannot open organisation settings", async ({ page }) => {
    await signIn(page, "manager@aalim.dev");
    await page.goto("/app/org/members");
    await expect(page.getByRole("navigation", { name: "Northwind Logistics" }).getByRole("link", { name: "Settings" })).toHaveCount(0);
    await page.goto("/app/org/settings");
    await expect(page).toHaveURL(/denied=1/);
    await expect(page.getByText("You do not have access to that page")).toBeVisible();
    await page.goto("/app/org/members");
    await expect(page.getByRole("button", { name: "Add member" })).toHaveCount(0);
  });

  test("individuals get a personal space", async ({ page }) => {
    await signIn(page, "candidate@aalim.dev");
    await expect(page.getByText("Your personal space. Only you can see it.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Members" })).toHaveCount(0);
  });

  test("only platform admins see the admin area", async ({ page }) => {
    await signIn(page, "admin@aalim.dev");
    await page.getByRole("link", { name: "Platform admin" }).click();
    await expect(page.getByRole("heading", { name: "Platform admin" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Northwind Logistics" })).toBeVisible();
  });

  test("the framework library lists all nine domains", async ({ page }) => {
    await signIn(page, "recruiter@aalim.dev");
    await page.goto("/app/framework");
    await expect(page.getByRole("navigation", { name: "Domains" }).getByRole("button")).toHaveCount(9);
    await page.getByRole("button", { name: /Communication/ }).click();
    await expect(page.getByRole("heading", { name: "Communication", level: 2 })).toBeVisible();
  });
});
