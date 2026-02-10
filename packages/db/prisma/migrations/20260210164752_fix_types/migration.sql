/*
  Warnings:

  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "MarketCap" ALTER COLUMN "usdValue" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "adaValue" SET DATA TYPE DECIMAL(65,30);

-- DropTable
DROP TABLE "Price";

-- CreateTable
CREATE TABLE "TokenPrice" (
    "id" SERIAL NOT NULL,
    "timestamp" DATE NOT NULL,
    "token" "AllTokens" NOT NULL,
    "usdValue" DECIMAL(65,30) NOT NULL,
    "adaValue" DECIMAL(65,30) NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "TokenPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenPrice_token_timestamp_key" ON "TokenPrice"("token", "timestamp");
