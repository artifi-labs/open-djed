/*
  Warnings:

  - Added the required column `fees` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "fees" BIGINT NOT NULL;
