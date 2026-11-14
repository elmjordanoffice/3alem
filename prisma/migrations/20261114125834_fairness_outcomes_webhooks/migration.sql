-- CreateTable
CREATE TABLE "fairness_response" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "sessionRef" TEXT NOT NULL,
    "gender" TEXT,
    "ageBand" TEXT,
    "disability" TEXT,
    "firstLanguage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fairness_response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outcome_rating" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "ratedById" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outcome_rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secretEncrypted" TEXT NOT NULL,
    "events" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_delivery" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "responseCode" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_delivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fairness_response_sessionRef_key" ON "fairness_response"("sessionRef");

-- CreateIndex
CREATE INDEX "fairness_response_organizationId_idx" ON "fairness_response"("organizationId");

-- CreateIndex
CREATE INDEX "outcome_rating_organizationId_idx" ON "outcome_rating"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "outcome_rating_sessionId_period_key" ON "outcome_rating"("sessionId", "period");

-- CreateIndex
CREATE INDEX "webhook_organizationId_idx" ON "webhook"("organizationId");

-- CreateIndex
CREATE INDEX "webhook_delivery_webhookId_createdAt_idx" ON "webhook_delivery"("webhookId", "createdAt");

-- AddForeignKey
ALTER TABLE "webhook_delivery" ADD CONSTRAINT "webhook_delivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "webhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Fairness data: RLS on with no policies, so the runtime role can't read it.
ALTER TABLE "fairness_response" ENABLE ROW LEVEL SECURITY;
-- Org-scoped tables.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['outcome_rating','webhook','webhook_delivery'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY tenant_isolation ON %I FOR ALL USING ("organizationId" = app_org()) WITH CHECK ("organizationId" = app_org())', t);
  END LOOP;
END $$;
