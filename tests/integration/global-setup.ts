import { execSync } from "node:child_process";
import "dotenv/config";

/**
 * Integration tests run against a separate database (aalim_test) so they never
 * touch development data. Migrations are applied before the run.
 */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? "postgresql://aalim:aalim@localhost:5432/aalim_test";
  process.env.TEST_DATABASE_URL = url;
  process.env.TEST_DATABASE_APP_URL ??= url.replace("aalim:aalim@", "aalim_app:aalim_app@");
  try {
    execSync("npx prisma migrate deploy", { env: { ...process.env, DATABASE_URL: url }, stdio: "pipe" });
    process.env.AALIM_TEST_DB = "ready";
  } catch (e) {
    console.warn("[integration] test database unavailable; RLS tests will be skipped.\n", String(e).slice(0, 300));
  }
}
