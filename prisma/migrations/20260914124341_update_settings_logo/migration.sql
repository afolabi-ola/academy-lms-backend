/*
  Warnings:

  - You are about to drop the column `logo` on the `Setting` table. All the data in the column will be lost.
  - You are about to drop the column `logoPublicId` on the `Setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Setting" DROP COLUMN "logo",
DROP COLUMN "logoPublicId",
ADD COLUMN     "logoText" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "logoUrlPublicId" TEXT;
