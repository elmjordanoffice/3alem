import "server-only";
import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import type { JobName, JobPayloads } from "./index";

const QUEUE = "aalim";
let queue: Queue | null = null;
let connection: IORedis | null = null;

function conn() {
  connection ??= new IORedis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
  return connection;
}

export function getQueue(): Queue {
  queue ??= new Queue(QUEUE, { connection: conn() });
  return queue;
}

/** Start a worker that runs every registered job handler. */
export async function startWorker(concurrency = 4) {
  await import("./handlers");
  const { runHandler } = await import("./run-handler");
  return new Worker(
    QUEUE,
    async (job) => runHandler(job.name as JobName, job.data as JobPayloads[JobName]),
    { connection: conn(), concurrency },
  );
}
