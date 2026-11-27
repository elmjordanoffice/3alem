import "server-only";
import type Stripe from "stripe";
import type { OrganizationBilling } from "@/generated/prisma/client";
import { systemDb } from "@/lib/db";
import { audit } from "@/lib/audit";
import { sendMail } from "@/lib/mail";
import { brandedEmail } from "@/lib/mail/templates";
import { reduceSubscription, type SubscriptionLike } from "./core";
import { forgetPlanBudget } from "./index";
import { GRACE_DAYS } from "./plans";

/**
 * Stripe webhook events → the organisation's billing row (D-066).
 *
 * - Idempotent: each event id is recorded before it is applied, so a retried
 *   delivery changes nothing; if applying fails the record is removed and
 *   Stripe's retry runs it again.
 * - Order-proof: subscription state is read back from Stripe rather than
 *   taken from the event, since events can arrive out of order.
 * - Audit-logged, and a failed payment emails the organisation's admins once
 *   per invoice.
 */

export const HANDLED_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
] as const;

export interface WebhookDeps {
  /** The subscription as Stripe has it now. */
  retrieveSubscription: (id: string) => Promise<SubscriptionLike>;
  now: () => Date;
}

const defaults: WebhookDeps = {
  retrieveSubscription: async (id) => (await import("./stripe")).stripe().subscriptions.retrieve(id),
  now: () => new Date(),
};

export type WebhookOutcome = { status: "processed" | "duplicate" | "ignored"; organizationId?: string };

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : (v?.id ?? null));

export async function handleStripeEvent(event: Stripe.Event, deps: Partial<WebhookDeps> = {}): Promise<WebhookOutcome> {
  if (!(HANDLED_EVENTS as readonly string[]).includes(event.type)) return { status: "ignored" };
  const d = { ...defaults, ...deps };
  try {
    await systemDb.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return { status: "duplicate" };
    throw e;
  }
  try {
    const organizationId = await apply(event, d);
    if (!organizationId) return { status: "ignored" };
    await systemDb.stripeEvent.update({ where: { id: event.id }, data: { organizationId } });
    return { status: "processed", organizationId };
  } catch (e) {
    await systemDb.stripeEvent.delete({ where: { id: event.id } }).catch(() => undefined);
    throw e;
  }
}

async function apply(event: Stripe.Event, d: WebhookDeps): Promise<string | null> {
  switch (event.type) {
    case "checkout.session.completed":
      return applyCheckoutSession(event.data.object, d, { eventId: event.id });

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const obj = event.data.object;
      const deleted = event.type === "customer.subscription.deleted";
      const sub = deleted ? obj : await d.retrieveSubscription(obj.id);
      const row = await applySubscription(sub, d.now(), obj.metadata?.organizationId);
      if (!row) return null;
      await audit({
        organizationId: row.organizationId,
        action: deleted ? "billing.subscription_canceled" : "billing.subscription_updated",
        targetType: "subscription",
        targetId: sub.id,
        metadata: { stripeEvent: event.id, plan: row.plan, status: row.status, cancelAtPeriodEnd: row.cancelAtPeriodEnd },
      });
      return row.organizationId;
    }

    case "invoice.paid":
    case "invoice.payment_failed": {
      const invoice = event.data.object;
      const subId = subscriptionOfInvoice(invoice);
      if (!subId) return null; // Not a subscription invoice.
      const row = await applySubscription(await d.retrieveSubscription(subId), d.now());
      if (!row) return null;
      const amount = { amount: (event.type === "invoice.paid" ? invoice.amount_paid : invoice.amount_due) / 100, currency: invoice.currency };
      if (event.type === "invoice.paid") {
        await audit({ organizationId: row.organizationId, action: "billing.invoice_paid", targetType: "invoice", targetId: invoice.id, metadata: { stripeEvent: event.id, ...amount } });
        return row.organizationId;
      }
      const already = await systemDb.auditLog.findFirst({ where: { organizationId: row.organizationId, action: "billing.payment_failed", targetId: invoice.id }, select: { id: true } });
      await audit({ organizationId: row.organizationId, action: "billing.payment_failed", targetType: "invoice", targetId: invoice.id, metadata: { stripeEvent: event.id, attempt: invoice.attempt_count, ...amount } });
      if (!already) await emailAdmins(row.organizationId, amount);
      return row.organizationId;
    }
  }
  return null;
}

/** The subscription an invoice belongs to (current API: parent.subscription_details; older: subscription). */
export function subscriptionOfInvoice(invoice: Stripe.Invoice): string | null {
  const legacy = (invoice as unknown as { subscription?: string | { id: string } | null }).subscription;
  return idOf(invoice.parent?.subscription_details?.subscription ?? legacy);
}

/**
 * After Checkout: link the customer and subscription to the organisation
 * (client_reference_id) and apply the subscription. Also used by the billing
 * page on return from Checkout, so the page is right before the webhook lands.
 */
export async function applyCheckoutSession(session: Stripe.Checkout.Session, deps: Partial<WebhookDeps> = {}, opts: { eventId?: string; expectOrganizationId?: string } = {}): Promise<string | null> {
  const d = { ...defaults, ...deps };
  if (session.mode !== "subscription") return null;
  const organizationId = session.client_reference_id ?? session.metadata?.organizationId ?? null;
  const subId = idOf(session.subscription);
  if (!organizationId || !subId) return null;
  if (opts.expectOrganizationId && opts.expectOrganizationId !== organizationId) return null;
  const row = await systemDb.organizationBilling.findUnique({ where: { organizationId } });
  if (!row) return null;
  const customer = idOf(session.customer);
  if (customer && !row.stripeCustomerId) await systemDb.organizationBilling.update({ where: { id: row.id }, data: { stripeCustomerId: customer } });
  const updated = await applySubscription(await d.retrieveSubscription(subId), d.now(), organizationId);
  if (opts.eventId && updated) {
    await audit({ organizationId, action: "billing.checkout_completed", targetType: "subscription", targetId: subId, metadata: { stripeEvent: opts.eventId, plan: updated.plan, interval: updated.interval, status: updated.status } });
  }
  return organizationId;
}

/** The billing row a subscription belongs to: by its metadata, then by subscription, then by customer. */
async function billingFor(sub: SubscriptionLike, hint?: string | null): Promise<OrganizationBilling | null> {
  const orgId = sub.metadata?.organizationId || hint;
  if (orgId) {
    const row = await systemDb.organizationBilling.findUnique({ where: { organizationId: orgId } });
    if (row) return row;
  }
  const bySub = await systemDb.organizationBilling.findUnique({ where: { stripeSubscriptionId: sub.id } });
  if (bySub) return bySub;
  const customer = idOf(sub.customer);
  return customer ? systemDb.organizationBilling.findUnique({ where: { stripeCustomerId: customer } }) : null;
}

async function applySubscription(sub: SubscriptionLike, now: Date, hint?: string | null): Promise<OrganizationBilling | null> {
  const row = await billingFor(sub, hint);
  if (!row) return null;
  // A replaced subscription winding down must not end the one that replaced it.
  const ending = ["canceled", "incomplete", "incomplete_expired"].includes(sub.status);
  if (row.stripeSubscriptionId && row.stripeSubscriptionId !== sub.id && row.status !== "CANCELED" && ending) return row;
  const patch = reduceSubscription(row, sub, now);
  // Keep the first customer linked to the organisation; Stripe ids are unique across rows.
  if (row.stripeCustomerId) delete patch.stripeCustomerId;
  const updated = await systemDb.organizationBilling.update({ where: { id: row.id }, data: patch });
  forgetPlanBudget(row.organizationId);
  return updated;
}

async function emailAdmins(organizationId: string, amount: { amount: number; currency: string }) {
  const org = await systemDb.organization.findUnique({ where: { id: organizationId }, select: { name: true, defaultLocale: true } });
  const admins = await systemDb.membership.findMany({ where: { organizationId, roles: { has: "ORG_ADMIN" } }, select: { user: { select: { email: true, name: true, locale: true } } } });
  const base = (process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  for (const a of admins) {
    const lang = (a.user.locale ?? org?.defaultLocale) === "ar" ? "ar" : "en";
    const money = new Intl.NumberFormat(lang === "ar" ? "ar-u-nu-latn" : "en-GB", { style: "currency", currency: amount.currency.toUpperCase(), currencyDisplay: lang === "ar" ? "code" : "symbol" }).format(amount.amount);
    const mail = brandedEmail("paymentFailed", lang, { name: a.user.name.split(" ")[0] ?? a.user.name, org: org?.name ?? "", amount: money, days: GRACE_DAYS }, { url: `${base}/app/org/billing`, org: org?.name });
    await sendMail({ to: a.user.email, ...mail });
  }
}
