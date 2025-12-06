-- CreateEnum
CREATE TYPE "Actions" AS ENUM ('Mint', 'Burn');

-- CreateEnum
CREATE TYPE "Token" AS ENUM ('DJED', 'SHEN', 'BOTH');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "action" "Actions" NOT NULL,
    "token" "Token" NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid" BIGINT NOT NULL,
    "received" BIGINT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
