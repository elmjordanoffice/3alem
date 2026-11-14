import type { PrismaClient } from "@/generated/prisma/client";

export type Db = PrismaClient;
/** The client available inside a tenant transaction. */
export type TenantTx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export interface TenantContext {
  /** The signed-in person, if any. */
  userId?: string | null;
  /** The organisation they are acting in, if any. */
  organizationId?: string | null;
}

/**
 * Builds the system and runtime clients. Kept free of `server-only` so the
 * row-level security integration tests can use it directly.
 */
export function createClients(opts: {
  systemUrl: string;
  appUrl: string;
  makeClient: (url: string) => PrismaClient;
}) {
  const system = opts.makeClient(opts.systemUrl);
  const app = opts.appUrl === opts.systemUrl ? system : opts.makeClient(opts.appUrl);

  async function withTenant<T>(ctx: TenantContext, fn: (tx: TenantTx) => Promise<T>): Promise<T> {
    return app.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.org_id', ${ctx.organizationId ?? ""}, true), set_config('app.user_id', ${ctx.userId ?? ""}, true)`;
      return fn(tx);
    });
  }

  return { system, app, withTenant };
}
