-- CreateEnum
CREATE TYPE "Actions" AS ENUM ('Mint', 'Burn');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "action" "Actions" NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);
