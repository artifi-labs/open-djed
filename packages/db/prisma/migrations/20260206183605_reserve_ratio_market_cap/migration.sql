-- CreateEnum
CREATE TYPE "TokenMarketCap" AS ENUM ('DJED', 'SHEN');

-- CreateTable
CREATE TABLE "ReserveRatio" (
    "id" SERIAL NOT NULL,
    "timestamp" DATE NOT NULL,
    "reserveRatio" DECIMAL(65,30) NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "ReserveRatio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketCap" (
    "id" SERIAL NOT NULL,
    "timestamp" DATE NOT NULL,
    "token" "TokenMarketCap" NOT NULL,
    "usdValue" BIGINT NOT NULL,
    "adaValue" BIGINT NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "MarketCap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReserveRatio_timestamp_key" ON "ReserveRatio"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "MarketCap_token_timestamp_key" ON "MarketCap"("token", "timestamp");
