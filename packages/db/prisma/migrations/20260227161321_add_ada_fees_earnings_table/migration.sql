-- CreateTable
CREATE TABLE "ADAFeesEarnings" (
    "id" SERIAL NOT NULL,
    "timestamp" DATE NOT NULL,
    "fee" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "ADAFeesEarnings_pkey" PRIMARY KEY ("id")
);
