-- CreateEnum
CREATE TYPE "Actions" AS ENUM ('Mint', 'Burn');

-- CreateEnum
CREATE TYPE "Token" AS ENUM ('DJED', 'SHEN', 'BOTH');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "address" JSONB NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,
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
    "id" INTEGER NOT NULL DEFAULT 1,
    "latestBlock" TEXT NOT NULL,
    "latestSlot" BIGINT NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_tx_hash_key" ON "Order"("tx_hash");

-- CreateIndex
CREATE INDEX "idx_order_slot" ON "Order"("slot");

-- CreateIndex
CREATE UNIQUE INDEX "Block_latestBlock_key" ON "Block"("latestBlock");
