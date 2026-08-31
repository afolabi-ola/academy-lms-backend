/*
  Warnings:

  - Added the required column `publicId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `Slider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Slider" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "publicId" TEXT;
