-- Migration: Update Order Table Status Field to Enum

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Created', 'Completed', 'Rejected', 'Canceled');

-- AlterTable
ALTER TABLE "Order"
ADD COLUMN status_new "OrderStatus";

-- Update existing records to set the new status based on the old status values
UPDATE "Order"
SET status_new = CASE LOWER(status)
  WHEN 'created' THEN 'Created'::"OrderStatus"
  WHEN 'completed' THEN 'Completed'::"OrderStatus"
  WHEN 'rejected' THEN 'Rejected'::"OrderStatus"
  WHEN 'Canceled' THEN 'Canceled'::"OrderStatus"
END;

-- Drop old column and rename new column
ALTER TABLE "Order" DROP COLUMN status;
ALTER TABLE "Order" RENAME COLUMN status_new TO status;
-- Enforce constraint
ALTER TABLE "Order" ALTER COLUMN status SET NOT NULL;
