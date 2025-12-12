/*
  Warnings:

  - You are about to drop the column `category` on the `listings` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `platform_commissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryId]` on the table `platform_commissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `listings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "platform_commissions_category_key";

-- AlterTable
ALTER TABLE "listings" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "platform_commissions" DROP COLUMN "category",
ADD COLUMN     "categoryId" TEXT;

-- DropEnum
DROP TYPE "ListingCategory";

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_code_key" ON "categories"("code");

-- CreateIndex
CREATE INDEX "listings_categoryId_idx" ON "listings"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "platform_commissions_categoryId_key" ON "platform_commissions"("categoryId");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_commissions" ADD CONSTRAINT "platform_commissions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
