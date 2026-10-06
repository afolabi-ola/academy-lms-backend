-- CreateEnum
CREATE TYPE "ThemeMode" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('NGN', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'SEK', 'NZD');

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "appName" TEXT NOT NULL,
    "appDescription" TEXT,
    "contactEmail" TEXT,
    "logo" TEXT,
    "logoPublicId" TEXT,
    "favicon" TEXT,
    "faviconPublicId" TEXT,
    "defaultStudentPhoto" TEXT,
    "defaultStudentPhotoPublicId" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "accentColor" TEXT,
    "themeMode" "ThemeMode" NOT NULL DEFAULT 'LIGHT',
    "timezone" TEXT,
    "currency" "Currency" NOT NULL DEFAULT 'NGN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
