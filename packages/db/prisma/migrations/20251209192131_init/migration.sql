-- CreateEnum
CREATE TYPE "Actions" AS ENUM ('Mint', 'Burn');

-- CreateEnum
CREATE TYPE "Token" AS ENUM ('DJED', 'SHEN', 'BOTH');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "address" JSONB NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "block" TEXT,
    "action" "Actions" NOT NULL,
    "token" "Token" NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid" BIGINT,
    "fees" BIGINT,
    "received" BIGINT,
    "status" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "latest_block" TEXT NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_tx_hash_key" ON "Order"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Block_latest_block_key" ON "Block"("latest_block");
