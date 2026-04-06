/*
  Warnings:

  - Made the column `block` on table `Volume` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slot` on table `Volume` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Volume" ALTER COLUMN "block" SET NOT NULL,
ALTER COLUMN "slot" SET NOT NULL;
