-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('ORG_ADMIN', 'RECRUITER', 'HIRING_MANAGER', 'TEAM_MANAGER');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SkillImportance" AS ENUM ('MUST_HAVE', 'NICE_TO_HAVE', 'BASELINE');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'OPENED', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AssessmentMode" AS ENUM ('HIRE', 'GROW', 'TEAM');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('INVITED', 'STARTED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'SCORED', 'REPORTED');

-- CreateEnum
CREATE TYPE "EnginePhase" AS ENUM ('CALIBRATE', 'EXPLORE', 'VALIDATE', 'STRESS_TEST', 'DONE');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('TRADE_OFF_DILEMMA', 'RANKING_ALLOCATION', 'INBOX', 'ROLE_PLAY', 'CASE_ANALYSIS', 'DESIGN_CHALLENGE', 'WRITTEN_WORK_SAMPLE', 'TECHNICAL_TASK', 'CONSEQUENCE_CHAIN', 'REFLECTION', 'FORCED_CHOICE_WORK_STYLE');

-- CreateEnum
CREATE TYPE "GuessabilityStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'PASSED', 'FAILED');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PREGENERATED', 'PRESENTED', 'ANSWERED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "ResponseStage" AS ENUM ('MAIN', 'PROBE', 'TWIST', 'ROLE_PLAY_TURN');

-- CreateEnum
CREATE TYPE "HypothesisDirection" AS ENUM ('STRENGTH', 'WEAKNESS');

-- CreateEnum
CREATE TYPE "HypothesisStatus" AS ENUM ('OPEN', 'CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportKind" AS ENUM ('HIRE', 'GROW', 'TEAM_MEMBER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "RoleFit" AS ENUM ('STRONG', 'GOOD', 'PARTIAL', 'WEAK');

-- CreateEnum
CREATE TYPE "IntegrityEventType" AS ENUM ('PASTE', 'TAB_HIDDEN', 'FOCUS_LOST', 'STYLE_SHIFT', 'TIMING_ANOMALY', 'WEBCAM');

-- CreateEnum
CREATE TYPE "TeamMemberStatus" AS ENUM ('INVITED', 'CONSENTED', 'DECLINED', 'ASSESSED', 'REMOVED');

-- CreateEnum
CREATE TYPE "ConsentKind" AS ENUM ('ASSESSMENT_DATA_USE', 'TEAM_SHARING', 'PROFILE_SHARE', 'RAW_ANSWER_SHARING', 'DEMOGRAPHICS', 'PROCTORING', 'OUTCOME_TRACKING');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "numerals" TEXT NOT NULL DEFAULT 'latn',
    "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    "activeOrganizationId" TEXT,

    CONSTRAINT "auth_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "brandColor" TEXT,
    "defaultLocale" TEXT NOT NULL DEFAULT 'en',
    "dataRetentionMonths" INTEGER NOT NULL DEFAULT 12,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" "OrgRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_domain" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "key" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "highLevel" JSONB NOT NULL,
    "generatedFromJobDescription" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competency_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "domainId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "anchors" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_template" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "analysis" JSONB,
    "technicalSkillMap" JSONB,
    "language" TEXT NOT NULL DEFAULT 'en',
    "durationMinutes" INTEGER NOT NULL DEFAULT 50,
    "accommodations" JSONB NOT NULL DEFAULT '{}',
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_skill_weight" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "skillKey" TEXT NOT NULL,
    "importance" "SkillImportance" NOT NULL DEFAULT 'BASELINE',
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "template_skill_weight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "tokenHash" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "accommodations" JSONB NOT NULL DEFAULT '{}',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedById" TEXT NOT NULL,
    "candidateUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessment_session" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "subjectUserId" TEXT,
    "mode" "AssessmentMode" NOT NULL,
    "templateId" TEXT,
    "invitationId" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'INVITED',
    "phase" "EnginePhase" NOT NULL DEFAULT 'CALIBRATE',
    "timeBudgetMinutes" INTEGER NOT NULL DEFAULT 50,
    "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
    "currentChapter" INTEGER NOT NULL DEFAULT 1,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "accommodations" JSONB NOT NULL DEFAULT '{}',
    "engineVersion" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessment_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_world" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "organizationId" TEXT,
    "subjectUserId" TEXT,
    "companyName" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "cast" JSONB NOT NULL,
    "hooks" JSONB NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scenario_world_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "organizationId" TEXT,
    "subjectUserId" TEXT,
    "chapter" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" "ItemType" NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "targetCompetencyKeys" TEXT[],
    "content" JSONB NOT NULL,
    "rubric" JSONB NOT NULL,
    "embeddedDetail" JSONB,
    "guessabilityStatus" "GuessabilityStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "guessabilityResult" JSONB,
    "status" "ItemStatus" NOT NULL DEFAULT 'PREGENERATED',
    "promptVersion" TEXT NOT NULL,
    "presentedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "response" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "organizationId" TEXT,
    "subjectUserId" TEXT,
    "stage" "ResponseStage" NOT NULL DEFAULT 'MAIN',
    "content" JSONB NOT NULL,
    "events" JSONB NOT NULL DEFAULT '[]',
    "startedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER,

    CONSTRAINT "response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_score" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "organizationId" TEXT,
    "subjectUserId" TEXT,
    "competencyKey" TEXT NOT NULL,
    "level" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidenceQuote" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "embeddedDetailNoticed" BOOLEAN,
    "pass" INTEGER NOT NULL DEFAULT 1,
    "isFinal" BOOLEAN NOT NULL DEFAULT true,
    "scorerVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_model_snapshot" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "organizationId" TEXT,
    "subjectUserId" TEXT,
    "sequence" INTEGER NOT NULL,
    "model" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_model_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hypothesis" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "organizationId" TEXT,
    "subjectUserId" TEXT,
    "competencyKey" TEXT NOT NULL,
    "direction" "HypothesisDirection" NOT NULL,
    "status" "HypothesisStatus" NOT NULL DEFAULT 'OPEN',
    "confidence" DOUBLE PRECISION NOT NULL,
    "evidence" JSONB NOT NULL,
    "conditions" JSONB,
    "ceilingLevel" DOUBLE PRECISION,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "hypothesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "organizationId" TEXT,
    "subjectUserId" TEXT,
    "kind" "ReportKind" NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "roleFit" "RoleFit",
    "content" JSONB,
    "writerVersion" TEXT,
    "sharedWithCandidate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_share_link" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "organizationId" TEXT,
    "subjectUserId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_share_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrity_event" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "organizationId" TEXT,
    "subjectUserId" TEXT,
    "itemId" TEXT,
    "type" "IntegrityEventType" NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integrity_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "development_plan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "focusAreas" JSONB NOT NULL,
    "actions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "development_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "key" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "sessions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "track_enrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "assignedByTeamId" TEXT,
    "completedSessions" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "track_enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "competencyKeys" TEXT[],
    "difficulty" INTEGER NOT NULL,
    "item" JSONB NOT NULL,
    "response" JSONB,
    "feedback" JSONB,
    "reflectionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "practice_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "managerUserId" TEXT NOT NULL,
    "goals" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_member" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "status" "TeamMemberStatus" NOT NULL DEFAULT 'INVITED',
    "sessionId" TEXT,
    "shareRawAnswers" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT,
    "organizationId" TEXT,
    "kind" "ConsentKind" NOT NULL,
    "subject" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "textVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_call_log" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "sessionId" TEXT,
    "agent" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "latencyMs" INTEGER NOT NULL,
    "ok" BOOLEAN NOT NULL,
    "error" TEXT,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_call_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_session_token_key" ON "auth_session"("token");

-- CreateIndex
CREATE INDEX "auth_session_userId_idx" ON "auth_session"("userId");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE INDEX "membership_userId_idx" ON "membership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "membership_organizationId_userId_key" ON "membership"("organizationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "competency_domain_organizationId_key_key" ON "competency_domain"("organizationId", "key");

-- CreateIndex
CREATE INDEX "competency_domainId_idx" ON "competency"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "competency_organizationId_key_key" ON "competency"("organizationId", "key");

-- CreateIndex
CREATE INDEX "assessment_template_organizationId_status_idx" ON "assessment_template"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "template_skill_weight_templateId_skillKey_key" ON "template_skill_weight"("templateId", "skillKey");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tokenHash_key" ON "invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "invitation_organizationId_templateId_idx" ON "invitation"("organizationId", "templateId");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "invitation"("email");

-- CreateIndex
CREATE UNIQUE INDEX "assessment_session_invitationId_key" ON "assessment_session"("invitationId");

-- CreateIndex
CREATE INDEX "assessment_session_organizationId_status_idx" ON "assessment_session"("organizationId", "status");

-- CreateIndex
CREATE INDEX "assessment_session_subjectUserId_idx" ON "assessment_session"("subjectUserId");

-- CreateIndex
CREATE UNIQUE INDEX "scenario_world_sessionId_key" ON "scenario_world"("sessionId");

-- CreateIndex
CREATE INDEX "item_sessionId_sequence_idx" ON "item"("sessionId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "response_clientId_key" ON "response"("clientId");

-- CreateIndex
CREATE INDEX "response_sessionId_idx" ON "response"("sessionId");

-- CreateIndex
CREATE INDEX "item_score_sessionId_competencyKey_idx" ON "item_score"("sessionId", "competencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_model_snapshot_sessionId_sequence_key" ON "candidate_model_snapshot"("sessionId", "sequence");

-- CreateIndex
CREATE INDEX "hypothesis_sessionId_idx" ON "hypothesis"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "report_sessionId_key" ON "report"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "report_share_link_tokenHash_key" ON "report_share_link"("tokenHash");

-- CreateIndex
CREATE INDEX "integrity_event_sessionId_idx" ON "integrity_event"("sessionId");

-- CreateIndex
CREATE INDEX "development_plan_userId_idx" ON "development_plan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "track_organizationId_key_key" ON "track"("organizationId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "track_enrollment_userId_trackId_key" ON "track_enrollment"("userId", "trackId");

-- CreateIndex
CREATE INDEX "practice_session_userId_createdAt_idx" ON "practice_session"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "team_organizationId_idx" ON "team"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "team_member_teamId_email_key" ON "team_member"("teamId", "email");

-- CreateIndex
CREATE INDEX "consent_userId_idx" ON "consent"("userId");

-- CreateIndex
CREATE INDEX "audit_log_organizationId_createdAt_idx" ON "audit_log"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_call_log_agent_createdAt_idx" ON "ai_call_log"("agent", "createdAt");

-- CreateIndex
CREATE INDEX "ai_call_log_sessionId_idx" ON "ai_call_log"("sessionId");

-- AddForeignKey
ALTER TABLE "auth_session" ADD CONSTRAINT "auth_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_domain" ADD CONSTRAINT "competency_domain_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency" ADD CONSTRAINT "competency_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency" ADD CONSTRAINT "competency_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "competency_domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_template" ADD CONSTRAINT "assessment_template_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_skill_weight" ADD CONSTRAINT "template_skill_weight_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "assessment_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "assessment_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_session" ADD CONSTRAINT "assessment_session_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_session" ADD CONSTRAINT "assessment_session_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_session" ADD CONSTRAINT "assessment_session_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "assessment_template"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment_session" ADD CONSTRAINT "assessment_session_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_world" ADD CONSTRAINT "scenario_world_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item" ADD CONSTRAINT "item_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "response" ADD CONSTRAINT "response_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_score" ADD CONSTRAINT "item_score_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "response"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_score" ADD CONSTRAINT "item_score_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_score" ADD CONSTRAINT "item_score_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_model_snapshot" ADD CONSTRAINT "candidate_model_snapshot_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hypothesis" ADD CONSTRAINT "hypothesis_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_share_link" ADD CONSTRAINT "report_share_link_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrity_event" ADD CONSTRAINT "integrity_event_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "assessment_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "development_plan" ADD CONSTRAINT "development_plan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track" ADD CONSTRAINT "track_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_enrollment" ADD CONSTRAINT "track_enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "track_enrollment" ADD CONSTRAINT "track_enrollment_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "track"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_session" ADD CONSTRAINT "practice_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_member" ADD CONSTRAINT "team_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent" ADD CONSTRAINT "consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
