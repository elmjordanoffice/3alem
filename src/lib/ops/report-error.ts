/**
 * Server error reporting (D-065), dependency-free so it runs in any runtime:
 *
 * - Always: one structured JSON line on stderr, which every host collects.
 * - With SENTRY_DSN: the error goes to Sentry through its HTTP envelope API.
 * - With ERROR_WEBHOOK_URL: a short message to a chat webhook (Slack- and
 *   Teams-compatible `{ text }`).
 *
 * Nothing personal leaves the server: request headers (cookies, tokens) are
 * never sent, and the secret part of candidate and share links is masked.
 */

export interface ErrorReport {
  message: string;
  stack?: string;
  digest?: string;
  path?: string;
  method?: string;
  routePath?: string;
  routeType?: string;
}

/** Mask the token in private links, e.g. /a/<token> → /a/:token. */
export function maskPath(path: string | undefined): string | undefined {
  if (!path) return path;
  return path.replace(/\/(a|r|team-invite|api\/m|reset-password)\/[^/?#]+/g, "/$1/:token").replace(/([?&](token|code)=)[^&#]+/g, "$1:token");
}

export function toReport(err: unknown, request?: { path?: string; method?: string }, context?: { routePath?: string; routeType?: string }): ErrorReport {
  const e = err instanceof Error ? err : new Error(String(err));
  const digest = typeof err === "object" && err !== null && "digest" in err ? String((err as { digest: unknown }).digest) : undefined;
  return {
    message: e.message.slice(0, 1000),
    stack: e.stack?.split("\n").slice(0, 15).join("\n"),
    digest,
    path: maskPath(request?.path),
    method: request?.method,
    routePath: context?.routePath,
    routeType: context?.routeType,
  };
}

function sentryTarget(dsn: string): { url: string; auth: string } | null {
  try {
    const u = new URL(dsn);
    const project = u.pathname.replace(/^\//, "");
    if (!u.username || !project) return null;
    return { url: `${u.protocol}//${u.host}/api/${project}/envelope/`, auth: `Sentry sentry_version=7, sentry_key=${u.username}, sentry_client=aalim/1.0` };
  } catch {
    return null;
  }
}

export async function reportError(r: ErrorReport): Promise<void> {
  console.error(JSON.stringify({ level: "error", at: new Date().toISOString(), ...r }));
  const jobs: Promise<unknown>[] = [];
  const target = process.env.SENTRY_DSN ? sentryTarget(process.env.SENTRY_DSN) : null;
  if (target) {
    const eventId = crypto.randomUUID().replace(/-/g, "");
    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: "javascript",
      level: "error",
      environment: process.env.NODE_ENV,
      release: process.env.APP_VERSION,
      transaction: r.routePath,
      tags: { routeType: r.routeType, digest: r.digest },
      request: { url: r.path, method: r.method },
      exception: { values: [{ type: "Error", value: r.message, stacktrace: r.stack ? { frames: r.stack.split("\n").slice(1).reverse().map((l) => ({ function: l.trim() })) } : undefined }] },
    };
    const envelope = `${JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() })}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(event)}`;
    jobs.push(fetch(target.url, { method: "POST", headers: { "Content-Type": "application/x-sentry-envelope", "X-Sentry-Auth": target.auth }, body: envelope }).catch(() => undefined));
  }
  if (process.env.ERROR_WEBHOOK_URL) {
    const text = `Aalim error${r.routePath ? ` in ${r.routePath}` : ""}: ${r.message}${r.digest ? ` (digest ${r.digest})` : ""}`;
    jobs.push(fetch(process.env.ERROR_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: text.slice(0, 600) }) }).catch(() => undefined));
  }
  await Promise.all(jobs);
}
