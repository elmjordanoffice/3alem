import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";
import { addMonthsUTC, billingEnabled, bannerFor, countUsage, decide, mapStripeStatus, priceTable, reduceSubscription, trialFrom, usageWindow, type BillingState, type SubscriptionLike } from "@/lib/billing/core";
import { PLANS, TRIAL, planConfig, yearlySavingMonths } from "@/lib/billing/plans";
import { brandedEmail } from "@/lib/mail/templates";

// ───────────── An in-memory database for the server-side billing code ─────────────

type Row = Record<string, unknown> & { id: string; organizationId: string };
const db = {
  billing: [] as Row[],
  events: new Map<string, { id: string; type: string; organizationId?: string | null }>(),
  audits: [] as { organizationId?: string | null; action: string; targetId?: string; metadata?: unknown }[],
  invitations: [] as { organizationId: string; templateId: string; email: string; createdAt: Date }[],
  teamMembers: [] as { organizationId: string; createdAt: Date }[],
  mail: [] as { to: string; subject: string; text: string }[],
};
const uniqueError = () => Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
const findBilling = (where: Record<string, unknown>) => db.billing.find((r) => Object.entries(where).every(([k, v]) => r[k] === v)) ?? null;
const inRange = (d: Date, w?: { gte?: Date; lt?: Date }) => (!w?.gte || d >= w.gte) && (!w?.lt || d < w.lt);

const mockDb = {
  organizationBilling: {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => findBilling(where),
    findUniqueOrThrow: async ({ where }: { where: Record<string, unknown> }) => findBilling(where) ?? Promise.reject(new Error("not found")),
    create: async ({ data }: { data: Record<string, unknown> & { organizationId: string } }) => {
      if (findBilling({ organizationId: data.organizationId })) throw uniqueError();
      const row: Row = { id: `b_${db.billing.length + 1}`, stripeCustomerId: null, stripeSubscriptionId: null, stripePriceId: null, interval: null, currentPeriodStart: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, pastDueSince: null, customInvitations: null, customAiBudgetUsd: null, createdAt: new Date(), updatedAt: new Date(), ...data };
      db.billing.push(row);
      return row;
    },
    update: async ({ where, data }: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
      const row = findBilling(where);
      if (!row) throw new Error("not found");
      Object.assign(row, data, { updatedAt: new Date() });
      return row;
    },
  },
  stripeEvent: {
    create: async ({ data }: { data: { id: string; type: string } }) => {
      if (db.events.has(data.id)) throw uniqueError();
      db.events.set(data.id, data);
      return data;
    },
    update: async ({ where, data }: { where: { id: string }; data: { organizationId: string } }) => Object.assign(db.events.get(where.id)!, data),
    delete: async ({ where }: { where: { id: string } }) => db.events.delete(where.id),
  },
  auditLog: {
    findFirst: async ({ where }: { where: { organizationId: string; action: string; targetId?: string } }) => db.audits.find((a) => a.organizationId === where.organizationId && a.action === where.action && (!where.targetId || a.targetId === where.targetId)) ?? null,
  },
  organization: { findUnique: async () => ({ id: "org1", name: "Northwind", defaultLocale: "en" }) },
  membership: {
    findMany: async () => [
      { user: { email: "admin@northwind.test", name: "Amara Okafor", locale: "en" } },
      { user: { email: "rana@northwind.test", name: "Rana Haddad", locale: "ar" } },
    ],
  },
  invitation: {
    findMany: async ({ where }: { where: { organizationId: string; createdAt: { gte?: Date; lt?: Date }; templateId?: { in: string[] }; email?: { in: string[] } } }) =>
      db.invitations.filter((i) => i.organizationId === where.organizationId && inRange(i.createdAt, where.createdAt) && (!where.templateId || where.templateId.in.includes(i.templateId)) && (!where.email || where.email.in.includes(i.email))),
  },
  teamMember: { findMany: async ({ where }: { where: { organizationId: string; createdAt: { gte: Date; lt: Date } } }) => db.teamMembers.filter((m) => m.organizationId === where.organizationId && inRange(m.createdAt, where.createdAt)) },
};

vi.mock("@/lib/db", () => ({ systemDb: mockDb, withTenant: async (_ctx: unknown, fn: (tx: typeof mockDb) => unknown) => fn(mockDb) }));
vi.mock("@/lib/audit", () => ({ audit: async (e: (typeof db.audits)[number]) => void db.audits.push(e) }));
vi.mock("@/lib/mail", () => ({ sendMail: async (m: (typeof db.mail)[number]) => void db.mail.push(m) }));

const { canInvite, ensureBilling, planAiBudgetUsd, usageIn } = await import("@/lib/billing");
const { handleStripeEvent } = await import("@/lib/billing/webhook");

// ───────────── Fixtures ─────────────

const DAY = 86_400_000;
const T0 = new Date("2026-11-01T09:00:00Z");
const at = (days: number) => new Date(T0.getTime() + days * DAY);

function state(over: Partial<BillingState> = {}): BillingState {
  return { ...trialFrom(T0), interval: null, currentPeriodStart: null, currentPeriodEnd: null, cancelAtPeriodEnd: false, pastDueSince: null, customInvitations: null, customAiBudgetUsd: null, ...over };
}
const paid = (over: Partial<BillingState> = {}) => state({ plan: "starter", status: "ACTIVE", interval: "MONTH", currentPeriodStart: T0, currentPeriodEnd: addMonthsUTC(T0, 1), ...over });

const PRICES = { STRIPE_PRICE_STARTER_MONTHLY: "price_sm", STRIPE_PRICE_STARTER_YEARLY: "price_sy", STRIPE_PRICE_GROWTH_MONTHLY: "price_gm", STRIPE_PRICE_GROWTH_YEARLY: "price_gy" };

function sub(over: Partial<SubscriptionLike> & { price?: string; interval?: "month" | "year"; start?: Date; end?: Date } = {}): SubscriptionLike {
  const { price = "price_sm", interval = "month", start = T0, end = addMonthsUTC(T0, 1), ...rest } = over;
  return {
    id: "sub_1",
    status: "active",
    customer: "cus_1",
    cancel_at_period_end: false,
    cancel_at: null,
    metadata: { organizationId: "org1", plan: "starter" },
    items: { data: [{ price: { id: price, recurring: { interval }, metadata: {} }, current_period_start: Math.floor(start.getTime() / 1000), current_period_end: Math.floor(end.getTime() / 1000) }] },
    ...rest,
  };
}

const event = (id: string, type: string, object: unknown) => ({ id, type, object: "event", data: { object } }) as unknown as Stripe.Event;

const savedEnv = { ...process.env };
function resetEnv() {
  for (const k of Object.keys(process.env)) if (!(k in savedEnv)) delete process.env[k];
  Object.assign(process.env, savedEnv);
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.BILLING_FORCE;
  Object.assign(process.env, PRICES);
}

beforeEach(() => {
  resetEnv();
  db.billing.length = 0;
  db.events.clear();
  db.audits.length = 0;
  db.invitations.length = 0;
  db.teamMembers.length = 0;
  db.mail.length = 0;
  (globalThis as { aalimPlanBudgets?: Map<string, unknown> }).aalimPlanBudgets?.clear();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

// ───────────── Plans ─────────────

describe("plans", () => {
  it("prices, allowances and AI budgets come from one config", () => {
    expect(PLANS.starter).toMatchObject({ invitations: 25, aiBudgetUsd: 40, priceUsd: { month: 149, year: 1490 } });
    expect(PLANS.growth).toMatchObject({ invitations: 100, aiBudgetUsd: 150, priceUsd: { month: 399, year: 3990 } });
    expect(PLANS.enterprise).toMatchObject({ invitations: null, aiBudgetUsd: null });
    expect(TRIAL).toEqual({ days: 14, invitations: 5 });
    expect(yearlySavingMonths("starter")).toBe(2);
    expect(planConfig("retired-plan").key).toBe("trial");
  });

  it("maps Stripe price ids from the environment to plan and interval; yearly is optional", () => {
    const table = priceTable({ STRIPE_PRICE_STARTER_MONTHLY: "a", STRIPE_PRICE_GROWTH_MONTHLY: "b", STRIPE_PRICE_GROWTH_YEARLY: "c" });
    expect(table.get("a")).toEqual({ plan: "starter", interval: "month" });
    expect(table.get("c")).toEqual({ plan: "growth", interval: "year" });
    expect(table.size).toBe(3);
  });
});

// ───────────── Billing on or off ─────────────

describe("billingEnabled", () => {
  it("is off without STRIPE_SECRET_KEY and on with it", () => {
    expect(billingEnabled("org1")).toBe(false);
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    expect(billingEnabled("org1")).toBe(true);
    expect(billingEnabled()).toBe(true);
  });

  it("can be forced on for listed organisations outside production only", () => {
    process.env.BILLING_FORCE = "org-a, org-b";
    expect(billingEnabled("org-a")).toBe(true);
    expect(billingEnabled("org-c")).toBe(false);
    expect(billingEnabled()).toBe(false);
    process.env.BILLING_FORCE = "all";
    expect(billingEnabled("anything")).toBe(true);
    vi.stubEnv("NODE_ENV", "production");
    expect(billingEnabled("org-a")).toBe(false);
  });
});

// ───────────── Periods and usage ─────────────

describe("usage window", () => {
  it("is the trial itself while on the trial", () => {
    expect(usageWindow(state(), at(3))).toEqual({ start: T0, end: at(TRIAL.days) });
  });

  it("is the billing month on a monthly plan, rolling on if a renewal is late", () => {
    expect(usageWindow(paid(), at(10))).toEqual({ start: T0, end: addMonthsUTC(T0, 1) });
    const late = usageWindow(paid(), at(40));
    expect(late.start).toEqual(addMonthsUTC(T0, 1));
    expect(late.end).toEqual(addMonthsUTC(T0, 2));
  });

  it("slices a yearly plan into months, so the allowance is monthly", () => {
    const yearly = paid({ interval: "YEAR", currentPeriodEnd: addMonthsUTC(T0, 12) });
    const w = usageWindow(yearly, new Date("2027-03-15T00:00:00Z"));
    expect(w.start.toISOString()).toBe("2027-03-01T09:00:00.000Z");
    expect(w.end.toISOString()).toBe("2027-04-01T09:00:00.000Z");
  });

  it("falls back to the calendar month (Enterprise without Stripe)", () => {
    const w = usageWindow(state({ plan: "enterprise", status: "ACTIVE" }), new Date("2026-12-09T12:00:00Z"));
    expect(w).toEqual({ start: new Date("2026-12-01T00:00:00Z"), end: new Date("2027-01-01T00:00:00Z") });
  });

  it("keeps the anchor day, clamped to short months", () => {
    expect(addMonthsUTC(new Date("2026-01-31T10:00:00Z"), 1).toISOString()).toBe("2026-02-28T10:00:00.000Z");
    expect(addMonthsUTC(new Date("2026-01-31T10:00:00Z"), 2).toISOString()).toBe("2026-03-31T10:00:00.000Z");
  });
});

describe("usage counting", () => {
  const w = { start: T0, end: addMonthsUTC(T0, 1) };

  it("counts each person once per assessment, and Team-mode members", () => {
    const invitations = [
      { templateId: "t1", email: "a@x.com", createdAt: at(1) },
      { templateId: "t1", email: "A@x.com", createdAt: at(2) }, // re-invited after a revoke: not again
      { templateId: "t2", email: "a@x.com", createdAt: at(2) }, // another assessment: counts
      { templateId: "t1", email: "b@x.com", createdAt: at(40) }, // next period
      { templateId: "t1", email: "c@x.com", createdAt: at(-3) }, // last period
    ];
    expect(countUsage({ invitations, earlier: [], teamMembers: [{ createdAt: at(5) }, { createdAt: at(-1) }] }, w)).toBe(3);
  });

  it("doesn't count a person first invited before the window", () => {
    const invitations = [{ templateId: "t1", email: "a@x.com", createdAt: at(3) }];
    expect(countUsage({ invitations, earlier: [{ templateId: "t1", email: "a@x.com" }], teamMembers: [] }, w)).toBe(0);
  });

  it("reads the rows for the organisation from the database", async () => {
    db.invitations.push(
      { organizationId: "org1", templateId: "t1", email: "old@x.com", createdAt: at(-20) },
      { organizationId: "org1", templateId: "t1", email: "old@x.com", createdAt: at(2) },
      { organizationId: "org1", templateId: "t1", email: "new@x.com", createdAt: at(2) },
      { organizationId: "org2", templateId: "t9", email: "else@x.com", createdAt: at(2) },
    );
    db.teamMembers.push({ organizationId: "org1", createdAt: at(4) });
    expect(await usageIn("org1", w)).toBe(2);
  });
});

// ───────────── The invitation gate ─────────────

describe("decide", () => {
  it("allows the trial until its days run out", () => {
    expect(decide(state(), 0, 2, at(13))).toMatchObject({ allowed: true, remaining: 5 });
    expect(decide(state(), 0, 1, at(14))).toMatchObject({ allowed: false, reason: "trial_ended" });
  });

  it("ends the trial after five invitations, and won't overshoot", () => {
    expect(decide(state(), 4, 1, at(1))).toMatchObject({ allowed: true, remaining: 1 });
    expect(decide(state(), 4, 2, at(1))).toMatchObject({ allowed: false, reason: "limit_reached", remaining: 1 });
    expect(decide(state(), 5, 1, at(1))).toMatchObject({ allowed: false, reason: "trial_ended", remaining: 0 });
  });

  it("enforces a paid plan's monthly allowance", () => {
    expect(decide(paid(), 24, 1, at(3))).toMatchObject({ allowed: true, allowance: 25 });
    expect(decide(paid(), 25, 1, at(3))).toMatchObject({ allowed: false, reason: "limit_reached", remaining: 0 });
    expect(decide(paid({ plan: "growth" }), 99, 1, at(3))).toMatchObject({ allowed: true, allowance: 100 });
  });

  it("gives a failed payment seven days' grace", () => {
    const due = paid({ status: "PAST_DUE", pastDueSince: at(2) });
    expect(decide(due, 0, 1, at(8))).toMatchObject({ allowed: true });
    expect(decide(due, 0, 1, at(9.5))).toMatchObject({ allowed: false, reason: "past_due" });
    // Still within grace but over the allowance: the allowance wins.
    expect(decide(due, 25, 1, at(3))).toMatchObject({ allowed: false, reason: "limit_reached" });
  });

  it("stops new invitations once the plan is cancelled", () => {
    expect(decide(paid({ status: "CANCELED" }), 0, 1, at(3))).toMatchObject({ allowed: false, reason: "canceled" });
    // Cancelling at period end keeps everything until then.
    expect(decide(paid({ cancelAtPeriodEnd: true }), 0, 1, at(3))).toMatchObject({ allowed: true });
  });

  it("uses Enterprise's custom allowance, or none", () => {
    expect(decide(state({ plan: "enterprise", status: "ACTIVE" }), 10_000, 50, at(3))).toMatchObject({ allowed: true, allowance: null, remaining: null });
    expect(decide(state({ plan: "enterprise", status: "ACTIVE", customInvitations: 300 }), 300, 1, at(3))).toMatchObject({ allowed: false, reason: "limit_reached" });
  });

  it("keeps trial rules while a first payment is incomplete, then asks for the payment", () => {
    const pending = state({ plan: "starter", status: "INCOMPLETE" });
    expect(decide(pending, 2, 1, at(3))).toMatchObject({ allowed: true, allowance: 5 });
    expect(decide(pending, 2, 1, at(20))).toMatchObject({ allowed: false, reason: "past_due" });
  });

  it("never limits re-invites of people already counted", () => {
    expect(decide(paid({ status: "CANCELED" }), 25, 0, at(3))).toMatchObject({ allowed: true });
  });
});

describe("canInvite", () => {
  it("is unlimited with billing off, and creates no billing row", async () => {
    expect(await canInvite("org1", 1000)).toEqual({ allowed: true, unlimited: true });
    expect(db.billing).toHaveLength(0);
  });

  it("starts the trial the first time billing is on, then counts against it", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    expect(await canInvite("org1", 5)).toMatchObject({ allowed: true, remaining: 5 });
    expect(db.billing).toHaveLength(1);
    expect(db.billing[0]).toMatchObject({ plan: "trial", status: "TRIALING" });
    expect(db.audits.map((a) => a.action)).toEqual(["billing.trial_started"]);
    const now = new Date();
    for (const email of ["a", "b", "c", "d", "e"]) db.invitations.push({ organizationId: "org1", templateId: "t1", email: `${email}@x.com`, createdAt: now });
    expect(await canInvite("org1", 1)).toMatchObject({ allowed: false, reason: "trial_ended", used: 5 });
  });

  it("refuses an exhausted Starter allowance", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    const start = new Date(Date.now() - 5 * DAY);
    await ensureBilling("org1");
    Object.assign(db.billing[0]!, { plan: "starter", status: "ACTIVE", interval: "MONTH", currentPeriodStart: start, currentPeriodEnd: addMonthsUTC(start, 1) });
    for (let i = 0; i < 25; i++) db.invitations.push({ organizationId: "org1", templateId: "t1", email: `p${i}@x.com`, createdAt: new Date(start.getTime() + DAY) });
    expect(await canInvite("org1", 1)).toMatchObject({ allowed: false, reason: "limit_reached", used: 25, allowance: 25 });
  });
});

describe("banner", () => {
  it("warns in the last three days of the trial, and after it", () => {
    expect(bannerFor(state(), 0, at(10))).toBeNull();
    expect(bannerFor(state(), 0, at(11.5))).toMatchObject({ kind: "trial_ending" });
    expect(bannerFor(state(), 5, at(2))).toMatchObject({ kind: "trial_ended" });
    expect(bannerFor(paid({ status: "PAST_DUE", pastDueSince: at(2) }), 0, at(3))).toMatchObject({ kind: "payment_failed", date: at(9) });
    expect(bannerFor(paid(), 0, at(3))).toBeNull();
  });
});

// ───────────── Stripe → billing row ─────────────

describe("reduceSubscription", () => {
  const prices = priceTable(PRICES);

  it("takes plan and interval from the price, and the period from the item", () => {
    const patch = reduceSubscription({ plan: "trial", pastDueSince: null }, sub({ price: "price_gy", interval: "year", end: addMonthsUTC(T0, 12) }), at(1), prices);
    expect(patch).toMatchObject({ plan: "growth", interval: "YEAR", status: "ACTIVE", stripeSubscriptionId: "sub_1", stripeCustomerId: "cus_1", currentPeriodStart: T0, currentPeriodEnd: addMonthsUTC(T0, 12), cancelAtPeriodEnd: false, pastDueSince: null });
  });

  it("maps Stripe statuses", () => {
    expect(["trialing", "active", "past_due", "unpaid", "canceled", "incomplete", "incomplete_expired"].map(mapStripeStatus)).toEqual(["TRIALING", "ACTIVE", "PAST_DUE", "PAST_DUE", "CANCELED", "INCOMPLETE", "INCOMPLETE"]);
  });

  it("keeps when a payment first failed, and clears it once paid", () => {
    const first = reduceSubscription({ plan: "starter", pastDueSince: null }, sub({ status: "past_due" }), at(3), prices);
    expect(first.pastDueSince).toEqual(at(3));
    expect(reduceSubscription({ plan: "starter", pastDueSince: at(3) }, sub({ status: "past_due" }), at(5), prices).pastDueSince).toEqual(at(3));
    expect(reduceSubscription({ plan: "starter", pastDueSince: at(3) }, sub(), at(6), prices).pastDueSince).toBeNull();
  });

  it("notices a cancellation scheduled either way", () => {
    expect(reduceSubscription(null, sub({ cancel_at_period_end: true }), at(1), prices).cancelAtPeriodEnd).toBe(true);
    expect(reduceSubscription(null, sub({ cancel_at: 1_900_000_000 }), at(1), prices).cancelAtPeriodEnd).toBe(true);
  });

  it("keeps Enterprise on an unknown (custom) price, and drops an abandoned first payment", () => {
    expect(reduceSubscription({ plan: "enterprise", pastDueSince: null }, sub({ price: "price_custom", metadata: {} }), at(1), prices).plan).toBe("enterprise");
    expect(reduceSubscription({ plan: "trial", pastDueSince: null }, sub({ status: "incomplete_expired", metadata: {} }), at(1), prices)).toMatchObject({ status: "INCOMPLETE", stripeSubscriptionId: null });
  });
});

// ───────────── The webhook handler ─────────────

describe("Stripe webhook", () => {
  let latest: SubscriptionLike;
  const deps = { retrieveSubscription: async () => latest, now: () => at(1) };

  beforeEach(async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    await ensureBilling("org1", T0);
    db.audits.length = 0;
    latest = sub();
  });

  it("links Checkout to the organisation and applies the subscription", async () => {
    const session = { id: "cs_1", object: "checkout.session", mode: "subscription", client_reference_id: "org1", metadata: { organizationId: "org1" }, customer: "cus_1", subscription: "sub_1" };
    expect(await handleStripeEvent(event("evt_1", "checkout.session.completed", session), deps)).toEqual({ status: "processed", organizationId: "org1" });
    expect(db.billing[0]).toMatchObject({ plan: "starter", status: "ACTIVE", interval: "MONTH", stripeCustomerId: "cus_1", stripeSubscriptionId: "sub_1" });
    expect(db.audits.map((a) => a.action)).toEqual(["billing.checkout_completed"]);
  });

  it("applies each event once", async () => {
    const e = event("evt_2", "customer.subscription.updated", sub());
    expect((await handleStripeEvent(e, deps)).status).toBe("processed");
    expect((await handleStripeEvent(e, deps)).status).toBe("duplicate");
    expect(db.audits.filter((a) => a.action === "billing.subscription_updated")).toHaveLength(1);
  });

  it("reads the subscription back from Stripe, so an out-of-order event can't roll it back", async () => {
    latest = sub({ status: "active" });
    await handleStripeEvent(event("evt_3", "customer.subscription.created", sub({ status: "incomplete" })), deps);
    expect(db.billing[0]!.status).toBe("ACTIVE");
  });

  it("emails admins once per failed invoice, in their language, and starts the grace period", async () => {
    latest = sub({ status: "past_due" });
    const invoice = { id: "in_1", object: "invoice", customer: "cus_1", amount_due: 14900, amount_paid: 0, currency: "usd", attempt_count: 1, parent: { type: "subscription_details", subscription_details: { subscription: "sub_1", metadata: {} } } };
    await handleStripeEvent(event("evt_4", "invoice.payment_failed", invoice), deps);
    await handleStripeEvent(event("evt_5", "invoice.payment_failed", { ...invoice, attempt_count: 2 }), deps);
    expect(db.billing[0]).toMatchObject({ status: "PAST_DUE", pastDueSince: at(1) });
    expect(db.mail.map((m) => m.to)).toEqual(["admin@northwind.test", "rana@northwind.test"]);
    expect(db.mail[0]!.subject).toBe("Payment for Northwind's Aalim plan didn't go through");
    expect(db.mail[0]!.text).toContain("$149.00");
    expect(db.mail[1]!.subject).toContain("لم تنجح");
    expect(db.audits.filter((a) => a.action === "billing.payment_failed")).toHaveLength(2);

    latest = sub();
    await handleStripeEvent(event("evt_6", "invoice.paid", { ...invoice, amount_paid: 14900 }), deps);
    expect(db.billing[0]).toMatchObject({ status: "ACTIVE", pastDueSince: null });
  });

  it("ends the plan when the subscription is deleted, but an old one ending leaves a newer one alone", async () => {
    await handleStripeEvent(event("evt_7", "customer.subscription.updated", sub()), deps);
    await handleStripeEvent(event("evt_8", "customer.subscription.deleted", sub({ id: "sub_old", status: "canceled" })), deps);
    expect(db.billing[0]).toMatchObject({ status: "ACTIVE", stripeSubscriptionId: "sub_1" });
    await handleStripeEvent(event("evt_9", "customer.subscription.deleted", sub({ status: "canceled" })), deps);
    expect(db.billing[0]).toMatchObject({ status: "CANCELED" });
    expect(db.audits.at(-1)?.action).toBe("billing.subscription_canceled");
  });

  it("ignores events it doesn't handle, and unknown organisations", async () => {
    expect(await handleStripeEvent(event("evt_10", "customer.created", {}), deps)).toEqual({ status: "ignored" });
    expect(db.events.has("evt_10")).toBe(false);
    latest = sub({ metadata: { organizationId: "elsewhere" }, customer: "cus_other", id: "sub_other" });
    expect((await handleStripeEvent(event("evt_11", "customer.subscription.updated", latest), deps)).status).toBe("ignored");
  });

  it("forgets the event if applying it fails, so Stripe's retry runs it", async () => {
    const failing = { ...deps, retrieveSubscription: async () => Promise.reject(new Error("Stripe is down")) };
    await expect(handleStripeEvent(event("evt_12", "customer.subscription.updated", sub()), failing)).rejects.toThrow("Stripe is down");
    expect(db.events.has("evt_12")).toBe(false);
    expect((await handleStripeEvent(event("evt_12", "customer.subscription.updated", sub()), deps)).status).toBe("processed");
  });

  it("verifies the signature over the raw body in the route", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    const { POST } = await import("@/app/api/billing/webhook/route");
    // Signature verification needs no network; the subscription read-back is the only Stripe call, so keep it out.
    const body = JSON.stringify({ id: "evt_13", object: "event", type: "customer.created", data: { object: {} } }, null, 2);
    const header = new Stripe("sk_test_x").webhooks.generateTestHeaderString({ payload: body, secret: "whsec_test_secret" });
    const ok = await POST(new Request("http://x/api/billing/webhook", { method: "POST", body, headers: { "stripe-signature": header } }));
    expect(ok.status).toBe(200);
    expect(await ok.json()).toMatchObject({ received: true, status: "ignored" });
    const tampered = await POST(new Request("http://x/api/billing/webhook", { method: "POST", body: body.replace("evt_13", "evt_14"), headers: { "stripe-signature": header } }));
    expect(tampered.status).toBe(400);
    const unsigned = await POST(new Request("http://x/api/billing/webhook", { method: "POST", body }));
    expect(unsigned.status).toBe(400);
  });

  it("is switched off without Stripe", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";
    const { POST } = await import("@/app/api/billing/webhook/route");
    expect((await POST(new Request("http://x/api/billing/webhook", { method: "POST", body: "{}" }))).status).toBe(404);
  });
});

// ───────────── AI budget and email ─────────────

describe("plan AI budget", () => {
  it("is the plan's when billing is on, and the default otherwise", async () => {
    expect(await planAiBudgetUsd("org1")).toBeNull();
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    await ensureBilling("org1");
    (globalThis as { aalimPlanBudgets?: Map<string, unknown> }).aalimPlanBudgets?.clear();
    expect(await planAiBudgetUsd("org1")).toBe(40);
    Object.assign(db.billing[0]!, { plan: "enterprise", customAiBudgetUsd: 900 });
    (globalThis as { aalimPlanBudgets?: Map<string, unknown> }).aalimPlanBudgets?.clear();
    expect(await planAiBudgetUsd("org1")).toBe(900);
  });
});

describe("payment failed email", () => {
  it("renders in English and Arabic with every placeholder filled", () => {
    for (const lang of ["en", "ar"] as const) {
      const mail = brandedEmail("paymentFailed", lang, { name: "Hana", org: "Qamar Logistics", amount: "$149.00", days: 7 }, { url: "https://aalim.test/app/org/billing", org: "Qamar Logistics" });
      expect(mail.subject).toContain("Qamar Logistics");
      expect(mail.html).not.toMatch(/\{\w+\}/);
      expect(mail.text).toContain("https://aalim.test/app/org/billing");
    }
    expect(brandedEmail("paymentFailed", "ar", { name: "هناء", org: "قمر", amount: "149 US$", days: 7 }, { url: "https://aalim.test" }).html).toContain('dir="rtl"');
  });
});
