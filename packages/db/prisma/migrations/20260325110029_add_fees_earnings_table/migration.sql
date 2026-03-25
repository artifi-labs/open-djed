-- CreateTable
CREATE TABLE "ADAFeesEarnings" (
    "id" SERIAL NOT NULL,
    "timestamp" DATE NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "block" TEXT,
    "slot" BIGINT,

    CONSTRAINT "ADAFeesEarnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ADAFeesEarnings_timestamp_key" ON "ADAFeesEarnings"("timestamp");
