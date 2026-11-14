import { mkdir } from "node:fs/promises";
import { test } from "@playwright/test";
import { setPrefs, signIn } from "./helpers";

/**
 * Screenshots of every screen in light/dark × English/Arabic, at desktop and
 * phone widths, for design review. Output: screenshots/out/.
 */
const PUBLIC = [
  { name: "landing", path: "/" },
  { name: "sign-in", path: "/sign-in" },
  { name: "sign-up", path: "/sign-up" },
  { name: "forgot-password", path: "/forgot-password" },
  { name: "reset-password-expired", path: "/reset-password" },
  { name: "not-found", path: "/does-not-exist" },
  { name: "design", path: "/design" },
];
const PRIVATE = [
  { name: "home", path: "/app" },
  { name: "framework", path: "/app/framework" },
  { name: "members", path: "/app/org/members" },
  { name: "org-settings", path: "/app/org/settings" },
  { name: "settings", path: "/app/settings" },
  { name: "onboarding", path: "/onboarding" },
];
const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 860 },
  { name: "mobile", width: 390, height: 844 },
];

test("capture every screen", async ({ browser, baseURL }) => {
  await mkdir("screenshots/out", { recursive: true });
  for (const theme of ["light", "dark"] as const) {
    for (const locale of ["en", "ar"] as const) {
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({ colorScheme: theme, viewport: vp, deviceScaleFactor: 1 });
        await setPrefs(context, baseURL!, { locale });
        const page = await context.newPage();
        const shoot = async (name: string, path: string) => {
          await page.goto(path, { waitUntil: "networkidle" });
          await page.waitForTimeout(300);
          await page.screenshot({ path: `screenshots/out/${name}--${vp.name}-${theme}-${locale}.png`, fullPage: name !== "design" });
        };
        for (const s of PUBLIC) await shoot(s.name, s.path);
        await signIn(page, "orgadmin@aalim.dev");
        // Sign-in restores the profile's language; override it for this pass.
        await setPrefs(context, baseURL!, { locale });
        for (const s of PRIVATE) await shoot(s.name, s.path);
        await context.clearCookies();
        await setPrefs(context, baseURL!, { locale });
        await signIn(page, "admin@aalim.dev");
        await setPrefs(context, baseURL!, { locale });
        await shoot("admin", "/app/admin");
        await context.close();
      }
    }
  }
});
