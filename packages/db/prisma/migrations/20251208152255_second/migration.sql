-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "latest_block" TEXT NOT NULL,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Block_latest_block_key" ON "Block"("latest_block");
