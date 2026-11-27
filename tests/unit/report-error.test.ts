import { afterEach, describe, expect, it, vi } from "vitest";
import { maskPath, reportError, toReport } from "@/lib/ops/report-error";

describe("error reporting", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.SENTRY_DSN;
    delete process.env.ERROR_WEBHOOK_URL;
  });

  it("masks the secret part of private links", () => {
    expect(maskPath("/a/AbC123xyz")).toBe("/a/:token");
    expect(maskPath("/r/share-token/print")).toBe("/r/:token/print");
    expect(maskPath("/api/m/tok_9?x=1")).toBe("/api/m/:token?x=1");
    expect(maskPath("/reset-password?token=secret&x=1")).toBe("/reset-password?token=:token&x=1");
    expect(maskPath("/app/assessments/abc")).toBe("/app/assessments/abc");
  });

  it("builds a report without request headers", () => {
    const err = Object.assign(new Error("boom"), { digest: "123" });
    const r = toReport(err, { path: "/a/tok", method: "GET" }, { routePath: "/a/[token]", routeType: "render" });
    expect(r).toMatchObject({ message: "boom", digest: "123", path: "/a/:token", method: "GET", routePath: "/a/[token]" });
    expect(JSON.stringify(r)).not.toMatch(/cookie|authorization/i);
  });

  it("logs a JSON line and posts to Sentry and a webhook when configured", async () => {
    process.env.SENTRY_DSN = "https://publickey@o1.ingest.sentry.io/42";
    process.env.ERROR_WEBHOOK_URL = "https://hooks.example.test/x";
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const posted: { url: string; body: string; headers: Record<string, string> }[] = [];
    vi.stubGlobal("fetch", async (url: string, init: { body: string; headers: Record<string, string> }) => {
      posted.push({ url, body: init.body, headers: init.headers });
      return new Response("ok");
    });
    await reportError({ message: "boom", path: "/a/:token", routePath: "/a/[token]" });
    expect(JSON.parse(String(logged.mock.calls[0]?.[0]))).toMatchObject({ level: "error", message: "boom" });
    expect(posted.map((p) => p.url).sort()).toEqual(["https://hooks.example.test/x", "https://o1.ingest.sentry.io/api/42/envelope/"]);
    const sentry = posted.find((p) => p.url.includes("sentry"))!;
    expect(sentry.headers["X-Sentry-Auth"]).toContain("sentry_key=publickey");
    expect(sentry.body.split("\n")).toHaveLength(3);
    vi.unstubAllGlobals();
  });
});
