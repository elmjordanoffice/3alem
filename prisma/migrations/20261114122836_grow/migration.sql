-- CreateTable
CREATE TABLE "grow_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentRole" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "goal" TEXT NOT NULL,
    "targetFamily" TEXT NOT NULL,
    "hoursPerWeek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grow_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_message" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grow_profile_userId_key" ON "grow_profile"("userId");

-- CreateIndex
CREATE INDEX "coach_message_userId_createdAt_idx" ON "coach_message"("userId", "createdAt");

-- Grow data is private to the individual.
ALTER TABLE "grow_profile" ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_only ON "grow_profile" FOR ALL USING ("userId" = app_user()) WITH CHECK ("userId" = app_user());
ALTER TABLE "coach_message" ENABLE ROW LEVEL SECURITY;
CREATE POLICY owner_only ON "coach_message" FOR ALL USING ("userId" = app_user()) WITH CHECK ("userId" = app_user());
