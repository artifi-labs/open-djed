import { DEX_CONFIG, type DexNetworkConfig } from "../../../../dex.config";
import { logger } from "../../../../utils/logger";
import { blockfrost, normalizeToDay } from "../../../utils";
import type { AddressTransactionsResponse } from "@open-djed/blockfrost/src/types/address/addressTransaction";
import type { TransactionUtxoAmount, TransactionUtxoOutput, TransactionUtxoResponse } from "@open-djed/blockfrost/src/types/transaction/transactionUtxo";
import {  adaDJEDRate, djedToUsdPrice, Rational } from "@open-djed/math";
import { calculateMedian } from "@open-djed/math/src/number";
import { env } from "../../../../../lib/env";
import type { Network } from "../../../../types/network";
import type { DexDailyPrices, DexName, DexPriceEntry, PoolLiquidity } from "../../../../types/dex";
import { aggegatedDexPricesPerDay, normalizeDexKey, readAddressTxFromFile, readDexPricesFromFile, writeAddressTxToFile, writeDexPricesToFile } from "./utils";
import { DJED_POLICY_ID_AND_NAME } from "./constants";
import type { DailyUTxOs } from "../../../types";
import { findOracleByTimestamp } from "../../../../oracle";

export async function getDexsTokenPrices(oracleUtxos: DailyUTxOs[], latestPriceTimestamp?: Date): Promise<DexDailyPrices[]> {
  const network = env.NETWORK.toLowerCase() as Network

  const dexPromises = Object.values(DEX_CONFIG).map(async (dex) => {
    const networkConfig = dex[network]
    const dexName = normalizeDexKey(dex.displayName)
  
    if (!networkConfig || !dexName) {
      logger.warn(`Skipping dex ${dex.displayName} because it has no valid network config or name`)
      return null
    }

    const hasAddress = !!networkConfig.address
    if (!hasAddress) {
      logger.warn(`Skipping dex ${dex.displayName} because it has no valid address`)
      return null
    }

    logger.info(`Processing dex ${dexName}`)

    const dexPrices = await getDexTokenPrices(dexName, networkConfig, oracleUtxos, latestPriceTimestamp)
    if (!dexPrices || dexPrices.length === 0) {
      logger.warn(`No prices found for dex ${dexName}`)
      return null
    }

    return dexPrices
  })

  const allDexPrices = (await Promise.all(dexPromises))
    .filter((p): p is DexDailyPrices[] => p !== null)

  if (allDexPrices.length === 0) {
    return []
  }

  const aggregated = aggegatedDexPricesPerDay(allDexPrices)

  return aggregated
}

export async function getDexTokenPrices(dexName: DexName, dexConfig: DexNetworkConfig, oracleUtxos: DailyUTxOs[], latestPriceTimestamp?: Date): Promise<DexDailyPrices[]> {

  let dexTransactions: AddressTransactionsResponse = [] // todo change this to const
  let dayEntries: DexDailyPrices[] = [] // todo change this to const

  if (!dexConfig.address) {
    throw new Error(`Missing address or poolId for dex ${dexName}`)
  }

  // Get all Transaction for the dex Address, sort by block_time
  /*try {
    let request = blockfrost.getAddressTransactions({ address: dexConfig.address, order: "desc"})

    // TODO: DELETE AFTER TEST
    const startOfDay = Math.floor(new Date("2026-02-01T00:00:00Z").getTime() / 1000)
    const endOfDay = Math.floor(new Date("2026-02-18T23:59:59Z").getTime() / 1000)

    //if (latestPriceTimestamp) {
    request = request.filter(tx => {
      const blockTime = tx.block_time
      //return blockTime >= latestPriceTimestamp.getTime()
      return blockTime >= startOfDay && blockTime <= endOfDay
    })
   // }
    dexTransactions = await request.allPages({ maxPages: 100 }).retry()
  
    if (dexTransactions.length === 0) {
      logger.warn(`No transactions found for dex ${dexName} at address ${dexConfig.address}`)
      return []
    }

    logger.info(`Fetched ${dexTransactions.length} transactions for dex ${dexName}`)
    
  } catch (error) {
    logger.error(error, `Error fetching transactions for dex ${dexName}`)
    return []
  }*/

  // TODO: REMOVE THIS
  //await writeAddressTxToFile(dexTransactions, `./dexTransactions${dexName}.json`)

  dexTransactions = await readAddressTxFromFile(`./dexTransactions${dexName}.json`)
  if (dexTransactions.length === 0) {
    logger.warn(`No transactions read from file for dex ${dexName}`)
    return []
  }
  logger.info(`Read ${dexTransactions.length} transactions from file for dex ${dexName}`)
  

  // Get all UTXOS for the dex Address
  try {
    const concurrency = 5
    let index = 0

    /*const workers = Array.from({ length: concurrency }, async () => {
      while (index < dexTransactions.length) {
        const tx = dexTransactions[index++]
        if (!tx) break

        const blockTimeInMs = tx.block_time * 1000

        const transactionUtxos: TransactionUtxoResponse = await blockfrost.getTransactionUTxOs(
          { hash: tx.tx_hash }
        ).retry()

        if (!transactionUtxos) {
          // Use the previous liquidity and calculate the new price
          if (dayEntries.length === 0) {
            continue
          }

          const lastDayEntry = dayEntries[dayEntries.length - 1]
          if (!lastDayEntry || lastDayEntry.prices.length === 0) {
            logger.warn(`No previous day entry found for transaction ${tx.tx_hash} of dex ${dexName} at block time ${tx.block_time}`)
            continue
          }
          
          const lastDayEntryPrice = lastDayEntry.prices[lastDayEntry.prices.length - 1]
          if (!lastDayEntryPrice) {
            logger.warn(`No previous day entry price found for transaction ${tx.tx_hash} of dex ${dexName} at block time ${tx.block_time}`)
            continue
          }

          const oracle = findOracleByTimestamp(new Date(blockTimeInMs), oracleUtxos)
          if (!oracle) {
            logger.warn(`No oracle found for transaction ${tx.tx_hash} of dex ${dexName} at block time ${tx.block_time}`)
            continue
          }

          const oraclePrice = adaDJEDRate({oracleFields: oracle.oracleDatum.oracleFields})
          if (!oraclePrice) {
            logger.warn(`No oracle price found for transaction ${tx.tx_hash} of dex ${dexName} at block time ${tx.block_time}`)
            continue
          }

          if (!lastDayEntryPrice.poolLiquidity) {
            logger.error(`No pool liquidity found for transaction ${tx.tx_hash} of dex ${dexName}`)
            continue
          }

          const djedPriceInAda = new Rational({
            numerator: lastDayEntryPrice.poolLiquidity.adaLiquidity,
            denominator: lastDayEntryPrice.poolLiquidity.djedLiquidity,
          })

          const djedPriceUsd = djedToUsdPrice(djedPriceInAda, {oracleFields: oracle.oracleDatum.oracleFields})

          const day = normalizeToDay(new Date(blockTimeInMs))

          let dayEntry = dayEntries.find(d => d.day.getTime() === day.getTime())

          if (!dayEntry) {
            dayEntry = {
              day,
              prices: [],
            }
            dayEntries.push(dayEntry)
          }

          dayEntry.prices.push({
            dex: dexName,
            djedAda: djedPriceInAda.toNumber(),
            djedUsd: djedPriceUsd,
            poolLiquidity: lastDayEntryPrice.poolLiquidity,
          })

          continue
        }

        const poolReserve = selectPoolOutput(transactionUtxos.outputs, dexConfig.address)
        if (!poolReserve) {
          continue
        }
      
        if (poolReserve.djedLiquidity <= 0n) {
          logger.warn(`Invalid DJED liquidity in transaction ${tx.tx_hash} of dex ${dexName}`)
          return
        }

        const oracle = findOracleByTimestamp(new Date(blockTimeInMs), oracleUtxos)
        if (!oracle) {
          logger.warn(`No oracle found for transaction ${tx.tx_hash} of dex ${dexName} at block time ${tx.block_time}`)
          continue
        }

        const oraclePrice = adaDJEDRate({oracleFields: oracle.oracleDatum.oracleFields})
        if (!oraclePrice) {
          logger.warn(`No oracle price found for transaction ${tx.tx_hash} of dex ${dexName} at block time ${tx.block_time}`)
          continue
        }

        const djedPriceInAda = new Rational({
          numerator: poolReserve.adaLiquidity,
          denominator: poolReserve.djedLiquidity,
        })

        const djedPriceUsd = djedToUsdPrice(djedPriceInAda, {oracleFields: oracle.oracleDatum.oracleFields})
        
        const day = normalizeToDay(new Date(blockTimeInMs))

        let dayEntry = dayEntries.find(d => d.day.getTime() === day.getTime())

        if (!dayEntry) {
          dayEntry = {
            day,
            prices: [],
          }
          dayEntries.push(dayEntry)
        }

        dayEntry.prices.push({
          dex: dexName,
          djedAda: djedPriceInAda.toNumber(),
          djedUsd: djedPriceUsd,
          poolLiquidity: poolReserve,
        })

        //await writeDexPricesToFile(dayEntries, `./dexPrices${dexName}.json`)
      }
    })

    await Promise.all(workers)*/

    // TODO: REMOVE THIS
    dayEntries = await readDexPricesFromFile(`./dexPrices${dexName}.json`)

    // Calculate the median price for each day
    dayEntries = dayEntries.map((dayEntry) => {
      const medianPrices = calculateDexPricesEntries(dayEntry.prices, dexName)

      return {
        ...dayEntry,
        prices: [{
          dex: dexName,
          djedAda: medianPrices.djedAda,
          djedUsd: medianPrices.djedUsd
        }]
      }
    }) 
    
  } catch (error) {
    logger.error(error, `Error fetching UTXOs for transactions of dex ${dexName}`)
    return []
  }

  return dayEntries
}

function calculateDexPricesEntries(
  dexPrices: DexPriceEntry[],
  dexName: string,
) {
  const djedAdaValues = dexPrices
    .filter(p => p.dex === dexName)
    .map(p => Number(p.djedAda))
  
  const djedUsdValues = dexPrices
    .filter(p => p.dex === dexName)
    .map(p => Number(p.djedUsd))

  const djedAdaMedian = calculateMedian(
    djedAdaValues
  )

  const djedUsdMedian = calculateMedian(
    djedUsdValues
  )

  return { djedAda: djedAdaMedian, djedUsd: djedUsdMedian }
}

function selectPoolOutput(
  utxoOutputs: TransactionUtxoOutput[],
  dexAddress: string
): PoolLiquidity | null {
  const outputs = utxoOutputs.filter(
    output =>
      output.address === dexAddress &&
      output.amount.some(amt => amt.unit === DJED_POLICY_ID_AND_NAME)
  )
  if (outputs.length === 0) return null

  const djedPoolOutput = outputs.find(output =>
    output.inline_datum !== null
  )
  if (!djedPoolOutput) return null

  const djedAmount = djedPoolOutput.amount.find(
    (amt: TransactionUtxoAmount) =>
      amt.unit === DJED_POLICY_ID_AND_NAME
  )
  if (!djedAmount) return null

  const best = outputs.reduce((prev, curr) => {
    const prevLovelace = BigInt(prev.amount.find(amt => amt.unit === "lovelace")?.quantity ?? 0)
    const currLovelace = BigInt(curr.amount.find(amt => amt.unit === "lovelace")?.quantity ?? 0)
    return currLovelace > prevLovelace ? curr : prev
  })

  const lovelaceAmount = best.amount.find(amt => amt.unit === "lovelace")?.quantity
  const djedPoolLiquidity = djedAmount.quantity

  if (!lovelaceAmount || !djedPoolLiquidity) return null

  return {
    djedLiquidity: BigInt(djedPoolLiquidity),
    adaLiquidity: BigInt(lovelaceAmount),
  }
}