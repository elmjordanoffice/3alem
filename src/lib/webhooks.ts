import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { systemDb } from "@/lib/db";
import { decrypt, sign } from "./crypto";
import { lookup } from "node:dns/promises";
import { isPrivateAddress, validateWebhookUrl } from "./webhook-url";

export { validateWebhookUrl };

export const WEBHOOK_EVENTS = ["candidate.started", "candidate.completed", "report.ready"] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

/** Deliver an event to every subscribed webhook. Never throws; every attempt is logged. */
export async function dispatchWebhook(organizationId: string | null, event: WebhookEvent, data: Record<string, unknown>) {
  if (!organizationId) return;
  const hooks = await systemDb.webhook.findMany({ where: { organizationId, active: true, events: { has: event } } });
  for (const hook of hooks) {
    const payload = { event, createdAt: new Date().toISOString(), data };
    const body = JSON.stringify(payload);
    let status = "failed";
    let responseCode: number | null = null;
    let error: string | null = null;
    try {
      const check = validateWebhookUrl(hook.url);
      if (!check.ok) throw new Error(check.error);
      // Re-check where the name points now, so DNS can't be used to reach internal hosts.
      const local = process.env.NODE_ENV !== "production" && check.url.protocol === "http:";
      if (!local) {
        const addrs = await lookup(check.url.hostname, { all: true });
        if (addrs.some((a) => isPrivateAddress(a.address))) throw new Error("privateHost");
      }
      const res = await fetch(check.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "Aalim-Webhooks/1", "X-Aalim-Event": event, "X-Aalim-Signature": sign(decrypt(hook.secretEncrypted), body) },
        body,
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
      });
      responseCode = res.status;
      status = res.ok ? "delivered" : "failed";
    } catch (e) {
      error = e instanceof Error ? e.message.slice(0, 300) : String(e);
    }
    await systemDb.webhookDelivery.create({ data: { webhookId: hook.id, organizationId, event, payload: payload as Prisma.InputJsonValue, status, responseCode, error } });
  }
}
