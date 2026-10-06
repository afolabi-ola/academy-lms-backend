-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "backgroundColor" TEXT,
ALTER COLUMN "id" SET DEFAULT 1,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Setting_id_seq";
