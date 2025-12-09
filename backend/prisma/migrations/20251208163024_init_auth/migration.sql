-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARTICULIER', 'PROFESSIONNEL', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'VERIFIED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "particulier_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profilePhoto" TEXT,
    "postalAddress" TEXT NOT NULL,
    "isOver18" BOOLEAN NOT NULL DEFAULT false,
    "newsletter" BOOLEAN NOT NULL DEFAULT false,
    "rgpdAccepted" BOOLEAN NOT NULL DEFAULT false,
    "rgpdAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "particulier_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professionnel_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "officialDocument" TEXT NOT NULL,
    "postalAddress" TEXT NOT NULL,
    "website" TEXT,
    "specialities" TEXT[],
    "mostSearchedItems" TEXT[],
    "socialNetworks" JSONB,
    "cgvAccepted" BOOLEAN NOT NULL DEFAULT false,
    "cgvAcceptedAt" TIMESTAMP(3),
    "mandateAccepted" BOOLEAN NOT NULL DEFAULT false,
    "mandateAcceptedAt" TIMESTAMP(3),
    "newsletter" BOOLEAN NOT NULL DEFAULT false,
    "rgpdAccepted" BOOLEAN NOT NULL DEFAULT false,
    "rgpdAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professionnel_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "particulier_profiles_userId_key" ON "particulier_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "professionnel_profiles_userId_key" ON "professionnel_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "professionnel_profiles_siret_key" ON "professionnel_profiles"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_userId_key" ON "email_verifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "email_verifications_token_key" ON "email_verifications"("token");

-- AddForeignKey
ALTER TABLE "particulier_profiles" ADD CONSTRAINT "particulier_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professionnel_profiles" ADD CONSTRAINT "professionnel_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
