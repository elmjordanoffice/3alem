-- Opt-in daily practice reminder: the hour (UTC) the person chose, and when we last sent one.
ALTER TABLE "grow_profile" ADD COLUMN     "reminderHour" INTEGER;
ALTER TABLE "grow_profile" ADD COLUMN     "lastRemindedAt" TIMESTAMP(3);
