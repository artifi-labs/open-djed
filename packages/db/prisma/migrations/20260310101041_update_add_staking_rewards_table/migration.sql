/*
  Warnings:

  - You are about to drop the column `endTimestamp` on the `ADAStakingRewards` table. All the data in the column will be lost.
  - You are about to drop the column `startTimestamp` on the `ADAStakingRewards` table. All the data in the column will be lost.
  - Added the required column `timestamp` to the `ADAStakingRewards` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ADAStakingRewards" DROP COLUMN "endTimestamp",
DROP COLUMN "startTimestamp",
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL;
