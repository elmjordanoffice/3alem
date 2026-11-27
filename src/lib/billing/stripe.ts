import "server-only";
import Stripe from "stripe";
import { systemDb } from "@/lib/db";
import { PLANS, type Interval, type PaidPlanKey } from "./plans";

/**
 * Stripe: the client, Checkout for new subscriptions and the billing portal
 * for everything after (plan changes, cards, invoices, cancelling). The
 * client is created on first use, so nothing needs STRIPE_SECRET_KEY unless
 * billing is on.
 */

let client: Stripe | null = null;

export function stripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Billing is off: STRIPE_SECRET_KEY is not set.");
  client ??= new Stripe(key, { maxNetworkRetries: 2, appInfo: { name: "Aalim" } });
  return client;
}

/** Can money actually be taken? (Billing can be forced on locally without Stripe.) */
export function stripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** The Stripe price id for a plan and interval, or null when it isn't configured. */
export function priceIdFor(plan: PaidPlanKey, interval: Interval): string | null {
  const name = PLANS[plan].priceEnv![interval];
  return process.env[name]?.trim() || null;
}

/** Yearly billing is offered only when every paid plan has a yearly price. */
export function yearlyAvailable(): boolean {
  return (["starter", "growth"] as const).every((p) => priceIdFor(p, "year"));
}

function appUrl() {
  return (process.env.APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** The organisation's Stripe customer, created once with its id in the metadata. */
async function customerFor(org: { id: string; name: string }, email: string): Promise<string> {
  const row = await systemDb.organizationBilling.findUniqueOrThrow({ where: { organizationId: org.id } });
  if (row.stripeCustomerId) return row.stripeCustomerId;
  const customer = await stripe().customers.create(
    { name: org.name, email, metadata: { organizationId: org.id } },
    // A double click within a day reuses the same customer.
    { idempotencyKey: `aalim-customer-${org.id}` },
  );
  await systemDb.organizationBilling.update({ where: { organizationId: org.id }, data: { stripeCustomerId: customer.id } });
  return customer.id;
}

/** A Checkout session for a new subscription; returns the URL to send the admin to. */
export async function createCheckoutSession(opts: { org: { id: string; name: string }; email: string; plan: PaidPlanKey; interval: Interval }): Promise<string> {
  const price = priceIdFor(opts.plan, opts.interval);
  if (!price) throw new Error(`No Stripe price for ${opts.plan}/${opts.interval}`);
  const customer = await customerFor(opts.org, opts.email);
  const tax = process.env.STRIPE_AUTOMATIC_TAX === "on";
  const metadata = { organizationId: opts.org.id, plan: opts.plan };
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: opts.org.id,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: true,
    metadata,
    subscription_data: { metadata },
    locale: "auto",
    success_url: `${appUrl()}/app/org/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl()}/app/org/billing?checkout=canceled`,
    ...(tax
      ? {
          automatic_tax: { enabled: true },
          tax_id_collection: { enabled: true },
          billing_address_collection: "required" as const,
          // Required for tax with an existing customer: save what Checkout collects onto it.
          customer_update: { address: "auto" as const, name: "auto" as const },
        }
      : {}),
  });
  if (!session.url) throw new Error("Stripe returned no Checkout URL");
  return session.url;
}

/** A billing portal session (plans, cards, invoices, cancelling); returns its URL. */
export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe().billingPortal.sessions.create({ customer: customerId, return_url: `${appUrl()}/app/org/billing` });
  return session.url;
}
