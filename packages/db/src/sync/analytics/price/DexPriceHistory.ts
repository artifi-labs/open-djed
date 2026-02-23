import { prisma } from "../../../../lib/prisma";
import { logger } from "../../../utils/logger";
import { type PopulateContext, type UpdateContext } from "../context/context";
import { filterOracleTxOsByTimestamp } from "../../utils";
import { HistoryScript } from "../HistoryScript";
import { rollbackTokenPrices } from "./rollbackTokenPrice";

import { processTokenPrices } from "./updateTokenPrices";

export class TokenPriceHistory extends HistoryScript {

  protected prismaModel = prisma.tokenPrice

  async rollback(): Promise<void> {
    return await rollbackTokenPrices()
  }

  protected async populate(ctx: PopulateContext): Promise<void> {
    const orderedTxOs = ctx.preloaded.orderedTxOs
    if (!orderedTxOs) {
      logger.warn("No orderedTxOs found in token history context, skipping TokenPriceHistory population")
      return
    }

    return await processTokenPrices(orderedTxOs) 
  }

  protected async update(ctx: UpdateContext): Promise<void> {
    logger.info(`=== Updating Token Prices ===`)
    const orderedTxOs = ctx.preloaded.orderedTxOs
    if (!orderedTxOs)
      throw new Error("No orderedTxOs found in update context for TokenPriceHistory. Cannot proceed with update.")
    
    const start = Date.now()
  
    const latestTimestamp = await this.latestTimestamp()
    if (!latestTimestamp) 
      throw new Error("Failed to retrieve latest token price timestamp for update.")
    
    const filteredTxOs = filterOracleTxOsByTimestamp(orderedTxOs, latestTimestamp)
    if (filteredTxOs.length === 0) {
      throw new Error("No new oracle transactions found since latest token price timestamp. Cannot proceed with update.")
    }

    await processTokenPrices(filteredTxOs)

    const end = Date.now() - start
    logger.info(
      `=== Updating Token Prices took sec: ${(end / 1000).toFixed(2)} ===`,
    )
  }
}
