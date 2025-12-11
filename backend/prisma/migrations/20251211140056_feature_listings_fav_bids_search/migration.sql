/*
  Warnings:

  - The values [PEINTURE,SCULPTURE,MONTRE,BIJOU,OBJET_ART,PHOTOGRAPHIE,VETEMENT,ACCESSOIRE,DESIGN] on the enum `ListingCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ListingCategory_new" AS ENUM ('BIJOUX_MONTRES', 'MEUBLES_ANCIENS', 'OBJETS_ART_TABLEAUX', 'OBJETS_COLLECTION', 'VINS_SPIRITUEUX', 'INSTRUMENTS_MUSIQUE', 'LIVRES_MANUSCRITS', 'MODE_ACCESSOIRES_LUXE', 'HORLOGERIE_PENDULES', 'PHOTOGRAPHIES', 'VAISSELLE_ARGENTERIE_CRISTALLERIE', 'SCULPTURES_DECORATION', 'VEHICULES_COLLECTION', 'AUTRE');
ALTER TABLE "listings" ALTER COLUMN "category" TYPE "ListingCategory_new" USING ("category"::text::"ListingCategory_new");
ALTER TYPE "ListingCategory" RENAME TO "ListingCategory_old";
ALTER TYPE "ListingCategory_new" RENAME TO "ListingCategory";
DROP TYPE "public"."ListingCategory_old";
COMMIT;

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorites_listingId_idx" ON "favorites"("listingId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_listingId_key" ON "favorites"("userId", "listingId");

-- CreateIndex
CREATE INDEX "bids_listingId_idx" ON "bids"("listingId");

-- CreateIndex
CREATE INDEX "bids_bidderId_idx" ON "bids"("bidderId");

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
