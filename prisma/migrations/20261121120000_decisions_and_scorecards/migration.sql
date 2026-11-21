-- CreateEnum
CREATE TYPE "HiringOutcome" AS ENUM ('ADVANCE', 'HIRE', 'HOLD', 'DECLINE');

-- CreateEnum
CREATE TYPE "ScorecardRecommendation" AS ENUM ('STRONG_YES', 'YES', 'NO', 'STRONG_NO');

-- CreateTable
CREATE TABLE "hiring_decision" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "outcome" "HiringOutcome" NOT NULL,
    "reason" TEXT NOT NULL,
    "decidedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hiring_decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_scorecard" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "interviewerId" TEXT NOT NULL,
    "ratings" JSONB NOT NULL,
    "recommendation" "ScorecardRecommendation" NOT NULL,
    "summary" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_scorecard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hiring_decision_sessionId_key" ON "hiring_decision"("sessionId");

-- CreateIndex
CREATE INDEX "hiring_decision_organizationId_outcome_idx" ON "hiring_decision"("organizationId", "outcome");

-- CreateIndex
CREATE UNIQUE INDEX "interview_scorecard_sessionId_interviewerId_key" ON "interview_scorecard"("sessionId", "interviewerId");

-- AddForeignKey
ALTER TABLE "hiring_decision" ADD CONSTRAINT "hiring_decision_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hiring_decision" ADD CONSTRAINT "hiring_decision_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_scorecard" ADD CONSTRAINT "interview_scorecard_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_scorecard" ADD CONSTRAINT "interview_scorecard_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Decisions and interview scorecards are org-scoped: only the organisation that ran the assessment sees them.
ALTER TABLE "hiring_decision" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "hiring_decision" FOR ALL USING ("organizationId" = app_org()) WITH CHECK ("organizationId" = app_org());
ALTER TABLE "interview_scorecard" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "interview_scorecard" FOR ALL USING ("organizationId" = app_org()) WITH CHECK ("organizationId" = app_org());
