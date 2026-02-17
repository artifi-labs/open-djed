-- CreateTable
CREATE TABLE "ADAStakingRewards" (
    "id" SERIAL NOT NULL,
    "epoch" INTEGER NOT NULL,
    "startTimestamp" DATE NOT NULL,
    "endTimestamp" DATE NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "ADAStakingRewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ADAStakingRewards_epoch_key" ON "ADAStakingRewards"("epoch");

-- CreateIndex
CREATE UNIQUE INDEX "ADAStakingRewards_startTimestamp_key" ON "ADAStakingRewards"("startTimestamp");

-- CreateIndex
CREATE UNIQUE INDEX "ADAStakingRewards_endTimestamp_key" ON "ADAStakingRewards"("endTimestamp");
