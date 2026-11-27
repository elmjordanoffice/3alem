-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "organization_billing" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'trial',
    "status" "BillingStatus" NOT NULL DEFAULT 'TRIALING',
    "interval" "BillingInterval",
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "trialStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "trialEndsAt" TIMESTAMP(3) NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "pastDueSince" TIMESTAMP(3),
    "customInvitations" INTEGER,
    "customAiBudgetUsd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_billing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_event" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_billing_organizationId_key" ON "organization_billing"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_billing_stripeCustomerId_key" ON "organization_billing"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_billing_stripeSubscriptionId_key" ON "organization_billing"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "stripe_event_createdAt_idx" ON "stripe_event"("createdAt");

-- AddForeignKey
ALTER TABLE "organization_billing" ADD CONSTRAINT "organization_billing_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Billing (D-066). Members of the organisation can read its billing row through
-- the runtime role; there are no write policies, so only trusted code using the
-- owner connection (the Stripe webhook, actions after a permission check) can
-- change it.
ALTER TABLE "organization_billing" ENABLE ROW LEVEL SECURITY;
CREATE POLICY billing_member_read ON "organization_billing" FOR SELECT
  USING (EXISTS (SELECT 1 FROM "membership" m WHERE m."organizationId" = "organization_billing"."organizationId" AND m."userId" = app_user()));

-- Processed Stripe events: system only. RLS on, no policies → the app role sees nothing.
ALTER TABLE "stripe_event" ENABLE ROW LEVEL SECURITY;
