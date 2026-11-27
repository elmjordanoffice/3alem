import { systemDb } from "@/lib/db";
import { aiMode } from "@/lib/ai/run";

/**
 * Liveness and readiness for the host's health check and uptime monitors:
 * 200 when the database answers, 503 when it doesn't. Says which AI and email
 * modes are on, never any secret.
 */
export async function GET() {
  const started = Date.now();
  let db: "ok" | "down" = "ok";
  try {
    await systemDb.$queryRaw`SELECT 1`;
  } catch {
    db = "down";
  }
  const body = {
    status: db === "ok" ? "ok" : "degraded",
    db,
    ai: aiMode(),
    email: process.env.SMTP_URL ? "smtp" : "file",
    billing: process.env.STRIPE_SECRET_KEY ? "on" : "off",
    version: process.env.APP_VERSION ?? process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.RENDER_GIT_COMMIT ?? "dev",
    ms: Date.now() - started,
  };
  return Response.json(body, { status: db === "ok" ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
