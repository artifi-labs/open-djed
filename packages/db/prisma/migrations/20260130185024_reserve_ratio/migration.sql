-- CreateTable
CREATE TABLE "ReserveRatio" (
    "id" SERIAL NOT NULL,
    "timestamp" DATE NOT NULL,
    "reserveRatio" DECIMAL(65,30) NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "ReserveRatio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_reserve_ratio_slot" ON "ReserveRatio"("slot");
