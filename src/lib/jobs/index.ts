import "server-only";

/**
 * Background jobs: scoring responses, pre-generating items, building reports,
 * retention sweeps.
 *
 * With REDIS_URL set, jobs go through BullMQ (durable, retried, can run in a
 * separate `npm run worker` process). Without it, they run in-process right
 * after the request, serialised per key so one candidate's jobs never race.
 * JOBS_MODE=sync runs them inline (tests).
 */

export type JobName = "score-response" | "pregenerate" | "build-report" | "retention-sweep";
export interface JobPayloads {
  "score-response": { responseId: string; sessionId: string };
  pregenerate: { sessionId: string };
  "build-report": { sessionId: string };
  "retention-sweep": Record<string, never>;
}

type Handler<N extends JobName> = (payload: JobPayloads[N]) => Promise<void>;
const handlers = new Map<JobName, Handler<JobName>>();

export function registerHandler<N extends JobName>(name: N, handler: Handler<N>) {
  handlers.set(name, handler as Handler<JobName>);
}

/** In-process chains, one per serialisation key (usually the session id). */
const chains = new Map<string, Promise<void>>();
const pendingBySession = new Map<string, number>();

async function runInline<N extends JobName>(name: N, payload: JobPayloads[N]) {
  const handler = handlers.get(name);
  if (!handler) {
    await import("./handlers");
  }
  const h = handlers.get(name);
  if (!h) throw new Error(`No handler for job ${name}`);
  let attempt = 0;
  for (;;) {
    try {
      await h(payload);
      return;
    } catch (e) {
      attempt++;
      console.error(`[jobs] ${name} failed (attempt ${attempt})`, e);
      if (attempt >= 3) return;
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

export async function enqueue<N extends JobName>(name: N, payload: JobPayloads[N], key?: string): Promise<void> {
  const mode = process.env.JOBS_MODE ?? (process.env.REDIS_URL ? "bullmq" : "inline");
  if (mode === "sync") return runInline(name, payload);
  if (mode === "bullmq") {
    const { getQueue } = await import("./bullmq");
    await getQueue().add(name, payload, { attempts: 3, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: 1000, removeOnFail: 5000 });
    return;
  }
  const k = key ?? name;
  pendingBySession.set(k, (pendingBySession.get(k) ?? 0) + 1);
  const prev = chains.get(k) ?? Promise.resolve();
  const next = prev
    .then(() => runInline(name, payload))
    .finally(() => {
      const n = (pendingBySession.get(k) ?? 1) - 1;
      if (n <= 0) pendingBySession.delete(k);
      else pendingBySession.set(k, n);
    });
  chains.set(k, next);
}

/** Wait (up to `ms`) for this key's in-process jobs to finish. BullMQ mode returns immediately. */
export async function settle(key: string, ms: number): Promise<boolean> {
  const chain = chains.get(key);
  if (!chain) return true;
  let done = false;
  await Promise.race([chain.then(() => (done = true)), new Promise((r) => setTimeout(r, ms))]);
  return done || !pendingBySession.has(key);
}
