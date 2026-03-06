-- CreateTable
CREATE TABLE "ADAFeesEarnings" (
    "id" SERIAL NOT NULL,
    "timestamp" DATE NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL,
    "block" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,

    CONSTRAINT "ADAFeesEarnings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ADAFeesEarnings_timestamp_key" ON "ADAFeesEarnings"("timestamp");
