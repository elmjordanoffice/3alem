-- AlterTable
ALTER TABLE "assessment_session" ADD COLUMN     "humanReviewNote" TEXT,
ADD COLUMN     "humanReviewRequested" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "humanReviewedAt" TIMESTAMP(3),
ADD COLUMN     "humanReviewedById" TEXT;

-- CreateTable
CREATE TABLE "report_adjustment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "skillKey" TEXT NOT NULL,
    "level" DOUBLE PRECISION NOT NULL,
    "note" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_adjustment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "report_adjustment_sessionId_skillKey_key" ON "report_adjustment"("sessionId", "skillKey");

-- AddForeignKey
ALTER TABLE "report_adjustment" ADD CONSTRAINT "report_adjustment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_adjustment" ADD CONSTRAINT "report_adjustment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Reviewer adjustments are org-scoped: only the organisation that ran the assessment sees them.
ALTER TABLE "report_adjustment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "report_adjustment" FOR ALL USING ("organizationId" = app_org()) WITH CHECK ("organizationId" = app_org());
