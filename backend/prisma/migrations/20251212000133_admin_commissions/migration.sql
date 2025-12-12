-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ListingStatus" ADD VALUE 'ENDED';
ALTER TYPE "ListingStatus" ADD VALUE 'CANCELLED';

-- CreateTable
CREATE TABLE "platform_commissions" (
    "id" TEXT NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "category" "ListingCategory",
    "buyerRate" DECIMAL(5,4) NOT NULL,
    "sellerRate" DECIMAL(5,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_commissions_isGlobal_key" ON "platform_commissions"("isGlobal");

-- CreateIndex
CREATE UNIQUE INDEX "platform_commissions_category_key" ON "platform_commissions"("category");
