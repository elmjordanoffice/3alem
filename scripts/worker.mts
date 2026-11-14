/**
 * Background worker for BullMQ mode (REDIS_URL set): scoring, item
 * pre-generation, reports and the nightly retention sweep.
 *   npm run worker
 */
import { startWorker } from "../src/lib/jobs/bullmq";

if (!process.env.REDIS_URL) {
  console.error("REDIS_URL is not set; jobs run inside the web server instead.");
  process.exit(1);
}
const worker = await startWorker(Number(process.env.WORKER_CONCURRENCY ?? 4));
console.log("[worker] running");
const stop = async () => {
  await worker.close();
  process.exit(0);
};
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
