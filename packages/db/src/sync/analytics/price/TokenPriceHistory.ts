import { prisma } from "../../../../lib/prisma";
import { logger } from "../../../utils/logger";
import { type PopulateContext, type UpdateContext } from "../context/context";
import { filterOracleTxOsByTimestamp } from "../../utils";
import { HistoryScript } from "../HistoryScript";
import { rollbackTokenPrices } from "./rollbackTokenPrice";
import { getDexsPoolHistoryAmounts, type DexPoolEntry } from "./dexs/dexTokenPrice";
import type { Dex } from "../../../../generated/prisma/enums";

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

    const {lastPoolRecords, aggregatedPoolAmounts} = await getDexsPoolHistoryAmounts(ctx.preloaded.oracleWeightedDaily)

    for (const poolRecord of lastPoolRecords) {
      if (!poolRecord) {
        logger.warn("No pool record found for one of the DEX'S. Skipping saving last pool state for that DEX.")
        continue
      }

      const result = await this.saveLastDexPoolState(poolRecord)
      logger.info(`Saved last pool state for DEX: ${poolRecord.dexName}, result: ${result}`)
    }
  }

  protected getLastPoolStateByDex(dexName: Dex) {
    return prisma.lastDexPoolState.findUnique({
      where: { dexName },
    })
  }

  protected saveLastDexPoolState(state: DexPoolEntry) {
    return prisma.lastDexPoolState.upsert({
      where: { dexName: state.dexName },
      update: {
        ...state,
        txHash: state.txHash,
        tokenA: "ADA", // TODO: CHANGE THIS
        tokenB: "DJED",
      },
      create: {
        ...state,
        tokenA: "ADA",
        tokenB: "DJED",
      },
    })
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

    const {lastPoolRecords, aggregatedPoolAmounts} = await getDexsPoolHistoryAmounts(ctx.preloaded.oracleWeightedDaily, latestTimestamp)

    for (const poolRecord of lastPoolRecords) {
      if (!poolRecord) {
        logger.warn("No pool record found for one of the DEX'S. Skipping saving last pool state for that DEX.")
        continue
      }
      
      logger.info(`Saving last pool state for DEX: ${poolRecord.dexName}, txHash: ${poolRecord.txHash}, timestamp: ${poolRecord.timestamp.toISOString()}`)
      await this.saveLastDexPoolState(poolRecord)
    }

    //console.log(aggregatedPoolAmounts)

    //await processTokenPrices(filteredTxOs)  
    const end = Date.now() - start
    logger.info(
      `=== Updating Token Prices took sec: ${(end / 1000).toFixed(2)} ===`,
    )
  }
}
