-- The person's CV (as text, private to them) and what was read from it.
ALTER TABLE "grow_profile" ADD COLUMN     "cvText" TEXT;
ALTER TABLE "grow_profile" ADD COLUMN     "career" JSONB NOT NULL DEFAULT '{}';
