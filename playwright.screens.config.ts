import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

/** Captures every screen in light/dark × English/Arabic × desktop/mobile. */
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: ["**/screens.spec.ts"],
  timeout: 300_000,
});
