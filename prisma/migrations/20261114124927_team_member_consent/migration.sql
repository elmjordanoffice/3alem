-- AlterTable
ALTER TABLE "team_member" ADD COLUMN     "consentedAt" TIMESTAMP(3),
ADD COLUMN     "inviteTokenHash" TEXT,
ADD COLUMN     "reportSeenAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "team_member_inviteTokenHash_key" ON "team_member"("inviteTokenHash");

