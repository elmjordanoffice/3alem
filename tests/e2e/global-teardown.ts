import { cleanupTestData } from "./cleanup";

export default async function globalTeardown() {
  if (process.env.E2E_KEEP_DATA) return;
  await cleanupTestData();
}
