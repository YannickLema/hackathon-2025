-- CreateTable
CREATE TABLE "listing_form_configs" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT,
    "saleMode" "SaleMode",
    "fields" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_form_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listing_form_configs_categoryId_saleMode_key" ON "listing_form_configs"("categoryId", "saleMode");

-- AddForeignKey
ALTER TABLE "listing_form_configs" ADD CONSTRAINT "listing_form_configs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
