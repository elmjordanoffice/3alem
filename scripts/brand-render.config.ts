import { defineConfig } from "@playwright/test";

/** Renders brand SVGs and social images to PNG (npm run brand:assets). */
export default defineConfig({
  testDir: ".",
  testMatch: "brand-render.spec.ts",
  reporter: [["list"]],
  workers: 1,
});
