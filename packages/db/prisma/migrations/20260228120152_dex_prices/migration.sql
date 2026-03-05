-- AlterTable
ALTER TABLE "TokenPrice" ADD COLUMN     "minswapAdaValue" DECIMAL(65,30),
ADD COLUMN     "minswapUsdValue" DECIMAL(65,30),
ADD COLUMN     "wingridersAdaValue" DECIMAL(65,30),
ADD COLUMN     "wingridersUsdValue" DECIMAL(65,30);
