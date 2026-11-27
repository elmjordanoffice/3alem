import { stripe, stripeConfigured } from "@/lib/billing/stripe";
import { handleStripeEvent } from "@/lib/billing/webhook";
import { reportError, toReport } from "@/lib/ops/report-error";

/**
 * Stripe webhook (D-066). Point a Stripe webhook endpoint at /api/billing/webhook
 * with the events in HANDLED_EVENTS, and set STRIPE_WEBHOOK_SECRET to its
 * signing secret. The signature is checked over the raw body, so the body is
 * read as bytes and never parsed first.
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeConfigured() || !secret) return new Response("Billing is off", { status: 404 });
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  const body = Buffer.from(await req.arrayBuffer());
  let event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }
  try {
    const outcome = await handleStripeEvent(event);
    return Response.json({ received: true, ...outcome });
  } catch (e) {
    // A 500 makes Stripe retry later; the event wasn't recorded, so the retry applies it.
    await reportError(toReport(e, { path: "/api/billing/webhook", method: "POST" }, { routePath: "/api/billing/webhook", routeType: "route" }));
    return new Response("Webhook handler failed", { status: 500 });
  }
}
