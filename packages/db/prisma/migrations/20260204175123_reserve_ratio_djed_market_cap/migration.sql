-- CreateEnum
CREATE TYPE "TokenMarketCap" AS ENUM ('DJED', 'SHEN');

-- CreateTable
CREATE TABLE "ReserveRatio" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "reserveRatio" DECIMAL(65,30) NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "ReserveRatio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketCap" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "token" "TokenMarketCap" NOT NULL,
    "usdValue" BIGINT NOT NULL,
    "adaValue" BIGINT NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "MarketCap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_reserve_ratio_timestamp" ON "ReserveRatio"("timestamp");

-- CreateIndex
CREATE INDEX "idx_market_cap_timestamp" ON "MarketCap"("timestamp");
