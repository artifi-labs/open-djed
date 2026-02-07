-- CreateEnum
CREATE TYPE "AllTokens" AS ENUM ('DJED', 'SHEN', 'ADA');

-- CreateTable
CREATE TABLE "Price" (
    "id" SERIAL NOT NULL,
    "timestamp" DATE NOT NULL,
    "token" "AllTokens" NOT NULL,
    "usdValue" BIGINT NOT NULL,
    "adaValue" BIGINT NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Price_token_timestamp_key" ON "Price"("token", "timestamp");
