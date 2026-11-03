-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "sourceChannel" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utmSource" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utmMedium" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utmCampaign" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utmContent" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "utmTerm" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "referrer" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "landingPage" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "journey" JSONB;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orders_sourceChannel_idx" ON "orders"("sourceChannel");

-- CreateTable
CREATE TABLE IF NOT EXISTS "order_events" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "order_events_orderId_createdAt_idx" ON "order_events"("orderId", "createdAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "order_events" ADD CONSTRAINT "order_events_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
