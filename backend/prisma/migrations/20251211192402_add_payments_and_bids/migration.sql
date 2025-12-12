-- CreateTable
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripePaymentMethodId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_userId_key" ON "payment_methods"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_stripeCustomerId_key" ON "payment_methods"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Bids existe déjà (migration précédente). On ajoute la colonne isWinning.
ALTER TABLE "bids" ADD COLUMN IF NOT EXISTS "isWinning" BOOLEAN NOT NULL DEFAULT false;
