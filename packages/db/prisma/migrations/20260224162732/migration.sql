/*
  Warnings:

  - Changed the type of `dexName` on the `LastDexPoolState` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "LastDexPoolState" DROP COLUMN "dexName",
ADD COLUMN     "dexName" "Dex" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "LastDexPoolState_dexName_key" ON "LastDexPoolState"("dexName");
