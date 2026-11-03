-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "location" TEXT,
ADD COLUMN     "repliedAt" TIMESTAMP(3),
ADD COLUMN     "reply" TEXT,
ADD COLUMN     "size" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
