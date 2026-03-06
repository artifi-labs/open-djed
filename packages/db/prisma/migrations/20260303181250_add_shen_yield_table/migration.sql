-- CreateTable
CREATE TABLE "ShenYield" (
    "id" SERIAL NOT NULL,
    "timestamp" DATE NOT NULL,
    "yield" DECIMAL(65,30) NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "ShenYield_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShenYield_timestamp_key" ON "ShenYield"("timestamp");
