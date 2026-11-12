-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "body" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;
