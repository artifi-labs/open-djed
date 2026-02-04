-- CreateEnum
CREATE TYPE "TokenMarketCap" AS ENUM ('DJED', 'SHEN');

-- DropIndex
DROP INDEX "idx_reserve_ratio_slot";

-- CreateTable
CREATE TABLE "MarketCap" (
    "id" SERIAL NOT NULL,
    "timestamp" TEXT NOT NULL,
    "token" "TokenMarketCap" NOT NULL,
    "usdValue" BIGINT NOT NULL,
    "adaValue" BIGINT NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "MarketCap_pkey" PRIMARY KEY ("id")
);
