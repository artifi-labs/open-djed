-- CreateTable
CREATE TABLE "Volume" (
    "id" SERIAL NOT NULL,
    "timestamp" DATE NOT NULL,
    "block" TEXT,
    "slot" BIGINT,
    "djedMintedUSD" DECIMAL(65,30) NOT NULL,
    "djedBurnedUSD" DECIMAL(65,30) NOT NULL,
    "shenMintedUSD" DECIMAL(65,30) NOT NULL,
    "shenBurnedUSD" DECIMAL(65,30) NOT NULL,
    "djedMintedADA" DECIMAL(65,30) NOT NULL,
    "djedBurnedADA" DECIMAL(65,30) NOT NULL,
    "shenMintedADA" DECIMAL(65,30) NOT NULL,
    "shenBurnedADA" DECIMAL(65,30) NOT NULL,
    "totalDjedVolumeUSD" DECIMAL(65,30) NOT NULL,
    "totalShenVolumeUSD" DECIMAL(65,30) NOT NULL,
    "totalDjedVolumeADA" DECIMAL(65,30) NOT NULL,
    "totalShenVolumeADA" DECIMAL(65,30) NOT NULL,
    "totalVolumeUSD" DECIMAL(65,30) NOT NULL,
    "totalVolumeADA" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Volume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Volume_timestamp_key" ON "Volume"("timestamp");
