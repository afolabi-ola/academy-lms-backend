/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `heading` on the `Slider` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Slider` table. All the data in the column will be lost.
  - Added the required column `fee` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Slider` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Slider` table without a default value. This is not possible if the table is not empty.
  - Made the column `otherName` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "imageUrl",
ADD COLUMN     "fee" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "image" TEXT NOT NULL,
ALTER COLUMN "isActive" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Slider" DROP COLUMN "heading",
DROP COLUMN "imageUrl",
ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN DEFAULT true,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "otherName" SET NOT NULL;
