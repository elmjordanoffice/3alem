-- CreateTable
CREATE TABLE "bank_item_review" (
    "itemKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "note" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_item_review_pkey" PRIMARY KEY ("itemKey")
);


-- Platform-only table: the runtime role has no policy, so it reads nothing.
ALTER TABLE "bank_item_review" ENABLE ROW LEVEL SECURITY;
