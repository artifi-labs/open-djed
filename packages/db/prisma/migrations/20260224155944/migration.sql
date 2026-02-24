-- CreateEnum
CREATE TYPE "Dex" AS ENUM ('Minswap', 'WingRiders');

-- CreateTable
CREATE TABLE "LastDexPoolState" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "dexName" TEXT NOT NULL,
    "tokenA" "AllTokens" NOT NULL,
    "tokenB" "AllTokens" NOT NULL,
    "reserveA" BIGINT NOT NULL,
    "reserveB" BIGINT NOT NULL,
    "txHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LastDexPoolState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LastDexPoolState_dexName_key" ON "LastDexPoolState"("dexName");
