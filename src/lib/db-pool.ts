import pg from "pg";

/**
 * A pg client that runs one query at a time.
 *
 * Prisma's query engine can issue relation sub-queries concurrently inside an
 * interactive transaction (our `withTenant`). pg 8 queues them internally but
 * warns that this is deprecated and will be removed in pg 9. Serialising here,
 * in the order the queries were issued, keeps the exact same semantics without
 * relying on that queue. Callback and submittable forms keep pg's behaviour.
 */
export class SerialClient extends pg.Client {
  #tail: Promise<unknown> = Promise.resolve();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override query(...args: any[]): any {
    const last = args[args.length - 1];
    const first = args[0];
    if (typeof last === "function" || (first && typeof first === "object" && typeof first.submit === "function")) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (super.query as (...a: any[]) => any)(...args);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const run = () => (super.query as (...a: any[]) => Promise<unknown>)(...args);
    const result = this.#tail.then(run, run);
    this.#tail = result.catch(() => undefined);
    return result;
  }
}

/** A connection pool whose clients serialise their queries. */
export function serialPool(connectionString: string): pg.Pool {
  return new pg.Pool({ connectionString, Client: SerialClient });
}
