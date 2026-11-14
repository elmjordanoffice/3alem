import "server-only";
import type { JobName, JobPayloads } from "./index";

export async function runHandler<N extends JobName>(name: N, payload: JobPayloads[N]) {
  const { HANDLERS } = await import("./handlers");
  const fn = HANDLERS[name] as (p: JobPayloads[N]) => Promise<void>;
  if (!fn) throw new Error(`No handler for ${name}`);
  await fn(payload);
}
