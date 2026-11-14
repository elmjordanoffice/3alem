import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { createClients, type Db, type TenantContext } from "./db-core";

/**
 * Two database clients:
 *
 * - `systemDb` connects as the table owner. Row-level security does not apply.
 *   Use it only for trusted system work: auth, seeding, background jobs,
 *   AI call logging, platform-admin tools.
 * - `withTenant(ctx, fn)` runs `fn` in a transaction on the runtime role, with
 *   `app.org_id` and `app.user_id` set, so Postgres enforces tenant isolation
 *   even if application code forgets a `where` clause.
 */

const globalForDb = globalThis as unknown as { aalimDb?: ReturnType<typeof createClients> };

const clients =
  globalForDb.aalimDb ??
  createClients({
    systemUrl: requireEnv("DATABASE_URL"),
    appUrl: process.env.DATABASE_APP_URL ?? requireEnv("DATABASE_URL"),
    makeClient: (url) => new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) }),
  });

if (process.env.NODE_ENV !== "production") globalForDb.aalimDb = clients;

export const systemDb: Db = clients.system;
export const withTenant = clients.withTenant;
export type { Db, TenantContext };
export type { TenantTx as Tx } from "./db-core";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. Copy .env.example to .env.`);
  return value;
}
