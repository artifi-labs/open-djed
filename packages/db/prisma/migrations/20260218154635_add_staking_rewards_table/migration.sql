-- CreateTable
CREATE TABLE "ADAStakingRewards" (
    "id" SERIAL NOT NULL,
    "epoch" INTEGER NOT NULL,
    "startTimestamp" TIMESTAMP(3) NOT NULL,
    "endTimestamp" TIMESTAMP(3) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ADAStakingRewards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ADAStakingRewards_epoch_key" ON "ADAStakingRewards"("epoch");
