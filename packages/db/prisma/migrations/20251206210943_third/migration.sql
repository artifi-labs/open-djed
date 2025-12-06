/*
  Warnings:

  - A unique constraint covering the columns `[tx_hash]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Order_tx_hash_key" ON "Order"("tx_hash");
