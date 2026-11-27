/**
 * A tiny scheduler for hosts without a cron feature (and the one-server
 * Docker setup in deploy/): calls the app's two scheduled endpoints.
 *
 *   - every hour, at minute 0: POST /api/cron/reminders (opt-in Grow reminders)
 *   - every night, at 02:15 UTC: POST /api/cron/retention (deletes data past each organisation's retention period)
 *
 * Needs CRON_SECRET (the same value as the app) and the app's address in
 * SCHEDULER_TARGET (default http://app:3000, the Docker Compose service).
 *
 *   node scripts/scheduler.mjs           # run forever
 *   node scripts/scheduler.mjs --once    # call both now, then exit (to test)
 */
const target = (process.env.SCHEDULER_TARGET ?? process.env.APP_URL ?? "http://app:3000").replace(/\/$/, "");
const secret = process.env.CRON_SECRET;
if (!secret) {
  console.error("[scheduler] CRON_SECRET is not set");
  process.exit(1);
}

async function call(path) {
  const started = Date.now();
  try {
    const res = await fetch(`${target}${path}`, { method: "POST", headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(10 * 60_000) });
    const body = await res.text();
    console.log(JSON.stringify({ at: new Date().toISOString(), path, status: res.status, ms: Date.now() - started, body: body.slice(0, 300) }));
  } catch (e) {
    console.error(JSON.stringify({ at: new Date().toISOString(), path, error: String(e) }));
  }
}

if (process.argv.includes("--once")) {
  await call("/api/cron/reminders");
  await call("/api/cron/retention");
  process.exit(0);
}

console.log(`[scheduler] calling ${target} hourly (reminders) and nightly at 02:15 UTC (retention)`);
let lastHour = -1;
let lastDay = "";
setInterval(() => {
  const now = new Date();
  const hourKey = now.getUTCHours();
  if (now.getUTCMinutes() === 0 && hourKey !== lastHour) {
    lastHour = hourKey;
    void call("/api/cron/reminders");
  }
  const day = now.toISOString().slice(0, 10);
  if (now.getUTCHours() === 2 && now.getUTCMinutes() === 15 && day !== lastDay) {
    lastDay = day;
    void call("/api/cron/retention");
  }
}, 20_000);
