import { prisma } from "../../../../lib/prisma";
import type { InterfaceHistoryScript } from "../../../types/history";
import { logger } from "../../../utils/logger";
import { type PopulateContext, type UpdateContext } from "../../sharedContext";
import { filterOracleTxOsByTimestamp } from "../../utils";
import { rollbackTokenPrices } from "./rollbackTokenPrice";

import { processTokenPrices } from "./updateTokenPrices";


export class TokenPriceHistory implements InterfaceHistoryScript {

  async rollback(): Promise<void> {
    return await rollbackTokenPrices()
  }

  async needUpdate(): Promise<boolean> {
    return await prisma.tokenPrice.count() > 0
  }

  async latestTimestamp(): Promise<Date | undefined> {
    const latestTokenPrice = await prisma.tokenPrice.findFirst({
      orderBy: {
        timestamp: "desc",
      },
    })
    return latestTokenPrice?.timestamp
  }

  async runner(populateContext: PopulateContext, updateContext?: UpdateContext): Promise<void> {
    
    const needsUpdate = await this.needUpdate()
    if (!needsUpdate) {
      if (!populateContext)
        throw new Error("TokenPriceHistory requires a populate context, but none was provided.")
      return await this.populate(populateContext)
    }

    if (!updateContext)
      throw new Error("TokenPriceHistory requires an update context, but none was provided.")
    return await this.update(updateContext)
  }

  async populate(ctx: PopulateContext): Promise<void> {
    const orderedTxOs = ctx.preloaded.orderedTxOs
    if (!orderedTxOs) {
      logger.warn("No orderedTxOs found in token history context, skipping TokenPriceHistory population")
      return
    }

    return await processTokenPrices(orderedTxOs) 
  }

  async update(ctx: UpdateContext): Promise<void> {
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
