"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePermission, requireViewer } from "@/lib/auth/session";
import { systemDb } from "@/lib/db";
import { audit } from "@/lib/audit";
import { billingEnabled, ensureBilling, forgetPlanBudget } from "@/lib/billing";
import { createCheckoutSession, createPortalSession, priceIdFor, stripeConfigured } from "@/lib/billing/stripe";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const checkoutSchema = z.object({ plan: z.enum(["starter", "growth"]), interval: z.enum(["month", "year"]) });

/** Start Checkout for a paid plan. Org admins only; returns the Stripe URL to go to. */
export async function startCheckout(input: z.input<typeof checkoutSchema>): Promise<Result<{ url: string }>> {
  const viewer = await requirePermission("billing.manage");
  const p = checkoutSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  const org = viewer.activeOrganization;
  if (!billingEnabled(org.id)) return { ok: false, error: "off" };
  if (!stripeConfigured() || !priceIdFor(p.data.plan, p.data.interval)) return { ok: false, error: "notConfigured" };
  const row = await ensureBilling(org.id);
  // One subscription per organisation: changes to a live one go through the billing portal.
  if (row.stripeSubscriptionId && row.status !== "CANCELED") return { ok: false, error: "usePortal" };
  let url: string;
  try {
    url = await createCheckoutSession({ org: { id: org.id, name: org.name }, email: viewer.user.email, plan: p.data.plan, interval: p.data.interval });
  } catch (e) {
    console.error("[billing] checkout failed", e);
    return { ok: false, error: "stripe" };
  }
  await audit({ organizationId: org.id, actorUserId: viewer.user.id, action: "billing.checkout_started", targetType: "organization", targetId: org.id, metadata: p.data });
  return { ok: true, url };
}

/** Open the Stripe billing portal: change plan, update the card, download invoices, cancel. Org admins only. */
export async function openBillingPortal(): Promise<Result<{ url: string }>> {
  const viewer = await requirePermission("billing.manage");
  const org = viewer.activeOrganization;
  if (!billingEnabled(org.id)) return { ok: false, error: "off" };
  if (!stripeConfigured()) return { ok: false, error: "notConfigured" };
  const row = await ensureBilling(org.id);
  if (!row.stripeCustomerId) return { ok: false, error: "noCustomer" };
  let url: string;
  try {
    url = await createPortalSession(row.stripeCustomerId);
  } catch (e) {
    console.error("[billing] portal failed", e);
    return { ok: false, error: "stripe" };
  }
  await audit({ organizationId: org.id, actorUserId: viewer.user.id, action: "billing.portal_opened", targetType: "organization", targetId: org.id });
  return { ok: true, url };
}

const adminSchema = z.object({
  organizationId: z.string().min(1),
  plan: z.enum(["trial", "enterprise"]),
  customInvitations: z.number().int().min(0).max(1_000_000).nullable(),
  customAiBudgetUsd: z.number().int().min(0).max(1_000_000).nullable(),
  trialEndsOn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
});

/**
 * Platform admins: put an organisation on Enterprise (custom invitations and
 * AI budget, invoiced outside Stripe), or back on a trial ending on a given
 * day (to extend one).
 */
export async function adminUpdateBilling(input: z.input<typeof adminSchema>): Promise<Result> {
  const viewer = await requireViewer();
  if (!viewer.user.isPlatformAdmin) return { ok: false, error: "denied" };
  const p = adminSchema.safeParse(input);
  if (!p.success) return { ok: false, error: "invalid" };
  const d = p.data;
  const org = await systemDb.organization.findUnique({ where: { id: d.organizationId }, select: { id: true } });
  if (!org) return { ok: false, error: "notFound" };
  await ensureBilling(org.id);
  if (d.plan === "enterprise") {
    await systemDb.organizationBilling.update({
      where: { organizationId: org.id },
      data: { plan: "enterprise", status: "ACTIVE", customInvitations: d.customInvitations, customAiBudgetUsd: d.customAiBudgetUsd, pastDueSince: null },
    });
  } else {
    if (!d.trialEndsOn) return { ok: false, error: "invalid" };
    const trialEndsAt = new Date(`${d.trialEndsOn}T23:59:59.000Z`);
    await systemDb.organizationBilling.update({ where: { organizationId: org.id }, data: { plan: "trial", status: "TRIALING", trialEndsAt, pastDueSince: null } });
  }
  forgetPlanBudget(org.id);
  await audit({ organizationId: org.id, actorUserId: viewer.user.id, action: "billing.admin_updated", targetType: "organization", targetId: org.id, metadata: d });
  revalidatePath("/app/admin");
  return { ok: true };
}
