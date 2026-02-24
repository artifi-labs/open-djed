import { logger } from "../../../../utils/logger";
import type { AddressTransactionsResponse } from "@open-djed/blockfrost/src/types/address/addressTransaction";
import type { TransactionUtxo } from "@open-djed/blockfrost/src/types/transaction/transactionUtxo";
import { env } from "../../../../../lib/env";
import type { Network } from "../../../../types/network";
import { aggregateDexPricesPerDay } from "./utils";
import { TOKENS, type TokenClass } from "../../../../tokens";
import { type DexProvider, MinswapProvider, WingridersProvider } from "./dexProvider";
import JSONbig from "json-bigint"
import { writeFile, readFile } from "fs/promises"
import { assignTimeWeights, type WeightedEntry } from "../updateTokenPrices";
import type { OracleUTxoWithDatumAndTimestamp } from "../../../types";
import { Rational } from "@open-djed/math";
import { bigint } from "zod";
import { findOracleByTimestamp } from "../../../../oracle";
import { prisma } from "../../../../../lib/prisma";
import type { Dex } from "../../../../../generated/prisma/enums";
import type { TokenPriceHistory } from "../TokenPriceHistory";


export type DexPoolEntry = {
  dexName: Dex
  timestamp: Date
  txHash: string
} & Pool

export type Pool = {
  tokenA: TokenClass
  tokenB: TokenClass
  reserveA: bigint
  reserveB: bigint
}

export interface DailyWeightedPool {
  day: Date
  dexName: string
  tokenA: TokenClass
  tokenB: TokenClass
  avgReserveA: number
  avgReserveB: number
  totalWeightMs: number
}


export interface DailyDexEntry {
  timestamp: Date
  startTimestamp: Date
  endTimestamp: Date
  dexs: Record<string, Pool[]> // CHANGE THIS to not be string
}

export type DailyWeightedOracle = {
  day: Date
  avgAdaUSDExchangeRate: number
  totalWeightMs: number
}

export function calculateWeightedDailyOracle(
  weightedEntries: WeightedEntry<OracleUTxoWithDatumAndTimestamp>[],
): DailyWeightedOracle[] {
  const map = new Map<string, { sumPrice: number; totalWeight: number }>()

  for (const entry of weightedEntries) {
    const dayKey = entry.day.toISOString().slice(0, 10)

    if (!map.has(dayKey)) {
      map.set(dayKey, { sumPrice: 0, totalWeight: 0 })
    }

    const record = map.get(dayKey)
    if (!record) continue

    const price = Number(entry.oracleDatum.oracleFields.adaUSDExchangeRate.numerator) / Number(entry.oracleDatum.oracleFields.adaUSDExchangeRate.denominator)

    const weightMs = Math.floor(entry.weightMs)
    record.sumPrice += price * weightMs
    record.totalWeight += weightMs
  }

  const result: DailyWeightedOracle[] = []
  for (const [dayKey, record] of map.entries()) {
    const avgPrice = record.totalWeight > 0 ? record.sumPrice / record.totalWeight : 0
    result.push({
      day: new Date(dayKey),
      avgAdaUSDExchangeRate: avgPrice,
      totalWeightMs: record.totalWeight,
    })
  }

  return result.sort((a, b) => a.day.getTime() - b.day.getTime())
}

export function calculateWeightedDailyAverages(
  weightedEntries: WeightedEntry<DexPoolEntry>[],
): DailyWeightedPool[] {
  const map = new Map<string, { dexName: string; sumA: bigint; sumB: bigint; totalWeight: number, tokenA: TokenClass, tokenB: TokenClass }>()

  for (const entry of weightedEntries) {
    const dayKey = entry.day.toISOString().slice(0, 10)

    if (!map.has(dayKey)) {
      map.set(dayKey, { 
        dexName: entry.dexName, 
        tokenA: entry.tokenA,
        tokenB: entry.tokenB,
        sumA: BigInt(0), 
        sumB: BigInt(0), 
        totalWeight: 0 
      })
    }

    const record = map.get(dayKey)
    if (!record) continue

    const weightMs = Math.floor(entry.weightMs)
    const reserveA = typeof entry.reserveA === "bigint" ? entry.reserveA : BigInt(entry.reserveA)
    const reserveB = typeof entry.reserveB === "bigint" ? entry.reserveB : BigInt(entry.reserveB)

    record.sumA += reserveA * BigInt(weightMs)
    record.sumB += reserveB * BigInt(weightMs)
    record.totalWeight += weightMs
  }

  const result: DailyWeightedPool[] = []
  for (const [dayKey, record] of map.entries()) {
    const avgA = Number(record.sumA / BigInt(record.totalWeight))
    const avgB = Number(record.sumB / BigInt(record.totalWeight))
    result.push({
      day: new Date(dayKey),
      dexName: record.dexName,
      tokenA: record.tokenA,
      tokenB: record.tokenB,
      avgReserveA: avgA,
      avgReserveB: avgB,
      totalWeightMs: record.totalWeight,
    })
  }

  return result.sort((a, b) => a.day.getTime() - b.day.getTime())
}

export function calculatePoolWeightedPrices(
  pools: DailyWeightedPool[],
  oracles: DailyWeightedOracle[],
) {
  const oracleMap = new Map<number, DailyWeightedOracle>()

  for (const oracle of oracles) {
    oracleMap.set(oracle.day.getTime(), oracle)
  }

  return pools.map(pool => {
    const oracle = oracleMap.get(pool.day.getTime())

    if (!oracle) {
      throw new Error(
        `No matching oracle found for day ${pool.day.toISOString().slice(0, 10)} while calculating weighted price for dex ${pool.dexName}`
      )
    }

    const price =
      Number(pool.avgReserveA) /
      Number(pool.avgReserveB) *
      oracle.avgAdaUSDExchangeRate

    return {
      ...pool,
      priceUSD: price,
    }
  })
}

function getLastPoolStateByDex(dexName: Dex) {
  return prisma.lastDexPoolState.findUnique({
    where: { dexName },
  })
}

export async function getDexsPoolHistoryAmounts(oracleWeightedDaily: DailyWeightedOracle[],latestPriceTimestamp?: Date) {

  const providers = [new MinswapProvider(), new WingridersProvider()]
  const lastPoolRecords = []

  const [minswapPoolAmounts , wingridersPoolAmounts] = await Promise.all(
    providers.map(provider => getDexPoolHistoryAmounts(provider, latestPriceTimestamp))
  )
  await Promise.all(
    [
      saveToJsonFile("./dex-minswap-entries.json", minswapPoolAmounts),
      saveToJsonFile("./dex-wingriders-entries.json", wingridersPoolAmounts),
    ]
  )

  if (minswapPoolAmounts) lastPoolRecords.push(minswapPoolAmounts[0])
  if (wingridersPoolAmounts) lastPoolRecords.push(wingridersPoolAmounts[0])

  const [firstMinswapPool, firstWingridersPool] = await Promise.all(
    providers.map(provider => getLastPoolStateByDex(provider.getName()))
  )
  
  if (firstMinswapPool && minswapPoolAmounts) {
    minswapPoolAmounts.unshift({
      dexName: firstMinswapPool.dexName,
      timestamp: firstMinswapPool.timestamp,
      txHash: firstMinswapPool.txHash,
      tokenA: TOKENS[env.NETWORK.toLowerCase() as Network].ADA,
      tokenB: TOKENS[env.NETWORK.toLowerCase() as Network].DJED,
      reserveA: firstMinswapPool.reserveA,
      reserveB: firstMinswapPool.reserveB,
    })
  }

  if (firstWingridersPool && wingridersPoolAmounts) {
    wingridersPoolAmounts.unshift({
      dexName: firstWingridersPool.dexName,
      timestamp: firstWingridersPool.timestamp,
      txHash: firstWingridersPool.txHash,
      tokenA: TOKENS[env.NETWORK.toLowerCase() as Network].ADA,
      tokenB: TOKENS[env.NETWORK.toLowerCase() as Network].DJED,
      reserveA: firstWingridersPool.reserveA,
      reserveB: firstWingridersPool.reserveB,
    })
  }

  /*const [minswapPoolAmounts, wingridersPoolAmounts] = await Promise.all(
    [
      readFromJsonFile<DexPoolEntry[]>("./dex-minswap-entries.json"),
      readFromJsonFile<DexPoolEntry[]>("./dex-wingriders-entries.json"),
    ]
  )*/

  const [minswapWeighted, wingridersWeighted] = await Promise.all([
    Promise.resolve(assignTimeWeights(minswapPoolAmounts ?? []) as WeightedEntry<DexPoolEntry>[]),
    Promise.resolve(assignTimeWeights(wingridersPoolAmounts ?? []) as WeightedEntry<DexPoolEntry>[]),
  ])
  await Promise.all(
    [
      saveToJsonFile("./dex-minswap-weighted.json", minswapWeighted),
      saveToJsonFile("./dex-wingriders-weighted.json", wingridersWeighted),
    ]
  )

  /*const [minswapWeighted, wingridersWeighted] = await Promise.all([
    readFromJsonFile<WeightedEntry<DexPoolEntry>[]>("./dex-minswap-weighted.json"),
    readFromJsonFile<WeightedEntry<DexPoolEntry>[]>("./dex-wingriders-weighted.json"),
  ])*/

  const [minswapDaily, wingridersDaily] = await Promise.all([
    Promise.resolve(calculateWeightedDailyAverages(minswapWeighted)),
    Promise.resolve(calculateWeightedDailyAverages(wingridersWeighted)),
  ])

  const [minswapDailyPrice, wingridersDailyPrice] = await Promise.all([
    Promise.resolve(calculatePoolWeightedPrices(minswapDaily, oracleWeightedDaily)),
    Promise.resolve(calculatePoolWeightedPrices(wingridersDaily, oracleWeightedDaily)),
  ])

  await Promise.all(
    [
      saveToJsonFile("./dex-minswap-daily-prices.json", minswapDailyPrice),
      saveToJsonFile("./dex-wingriders-daily-prices.json", wingridersDailyPrice),
    ]
  )

  //const aggregated = aggregateDexPricesPerDay(minswapWeighted, wingridersWeighted)
  
  return {
    lastPoolRecords,
    minswap: minswapDailyPrice,
    wingriders: wingridersDailyPrice,
  }
}

export async function getDexPoolHistoryAmounts(provider: DexProvider, latestPriceTimestamp?: Date): Promise<DexPoolEntry[]> {

  let dexTransactions: AddressTransactionsResponse = [] // todo change this to const
  const dexPoolEntries: DexPoolEntry[] = [] // todo change this to const

  const dexName = provider.getName()
  const network = env.NETWORK.toLowerCase() as Network
  const djedToken = TOKENS[network].DJED
  const adaToken = TOKENS[network].ADA

  if (!djedToken) {
    logger.error(`DJED token not found for network ${network}. Cannot fetch dex token prices.`)
    return []
  }

  try {
    dexTransactions = await provider.getAddressTransactions() // TODO: CHANGE THIS TO SUPPORT FILTERS
    // TODO: continue... this should have the filters
  } catch (error) {
    logger.error(error, `Error fetching transactions for dex ${dexName}`)
    return []
  }

    /*if (latestPriceTimestamp) {
      request = request.withFilter(() => ({
        filter: (item) => item.block_time >= latestPriceTimestamp.getTime(),
        stop: (item) => item.block_time < latestPriceTimestamp.getTime(),
      }))
    }
    dexTransactions = await request.allPages().retry()*/
  
  if (dexTransactions.length === 0) {
    logger.warn(`No transactions found for dex ${dexName}`)
    return []
  }

  logger.info(`Fetched ${dexTransactions.length} transactions for dex ${dexName}`)
  
  for (const transaction of dexTransactions) {
    let txUtxOs: TransactionUtxo | null = null

    try {
      txUtxOs = await provider.getTransactionUtxOs(transaction)
    } catch (error) {
      logger.error(error, `Error fetching UTXOs for transactions of dex ${dexName}`)
      return []
    }
    const poolAmount = provider.getPoolAmountFromUtxo(txUtxOs, djedToken)

    if (!poolAmount) {
      logger.warn(`No pool amount found in transaction ${transaction.tx_hash} for dex ${dexName}`)
      continue
    }
  
    const dexPoolEntry: DexPoolEntry  = {
      timestamp: new Date(transaction.block_time * 1000),
      dexName: dexName,
      tokenA: adaToken,
      tokenB: poolAmount.token,
      reserveA: BigInt(poolAmount.adaAmount),
      reserveB: BigInt(poolAmount.tokenAmount),
      txHash: transaction.tx_hash,
    }

    dexPoolEntries.push(dexPoolEntry)
  }

  return dexPoolEntries
}

function aggregateByDay(entries: DexPoolEntry[]): DailyDexEntry[] {
  const map = new Map<string, DailyDexEntry>()

  for (const entry of entries) {
    const timestamp = entry.timestamp instanceof Date
      ? entry.timestamp
      : new Date(entry.timestamp)

    if (Number.isNaN(timestamp.getTime())) {
      logger.warn(`Invalid timestamp found while aggregating dex entry for ${entry.dexName}. Skipping entry.`)
      continue
    }

    const dateKey = timestamp.toISOString().slice(0, 10)

    if (!map.has(dateKey)) {
      map.set(dateKey, {
        timestamp: new Date(dateKey),
        startTimestamp: timestamp,
        endTimestamp: timestamp,
        dexs: {}
      })
    }

    const dayEntry = map.get(dateKey)
    if (!dayEntry) continue

    if (timestamp < dayEntry.startTimestamp) dayEntry.startTimestamp = timestamp
    if (timestamp > dayEntry.endTimestamp) dayEntry.endTimestamp = timestamp

    if (!dayEntry.dexs[entry.dexName]) {
      dayEntry.dexs[entry.dexName] = []
    }

    const dexPools = dayEntry.dexs[entry.dexName]
    if (dexPools) {
      dexPools.push({
        tokenA: entry.tokenA,
        tokenB: entry.tokenB,
        reserveA: entry.reserveA,
        reserveB: entry.reserveB,
      })
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  )
}

export async function readFromJsonFile<T = unknown>(path: string): Promise<T> {
  const content = await readFile(path, "utf-8")
  const parsed = JSONbig.parse(content)

  const reviveDates = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(reviveDates)
    if (obj && typeof obj === "object") {
      for (const key in obj) {
        if (typeof obj[key] === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z$/.test(obj[key])) {
          obj[key] = new Date(obj[key])
        } else if (typeof obj[key] === "object") {
          obj[key] = reviveDates(obj[key])
        }
      }
    }
    return obj
  }

  return reviveDates(parsed) as T
}

export async function saveToJsonFile(path: string, data: unknown) {
  const serialized = JSONbig.stringify(data, null, 2)
  await writeFile(path, serialized, "utf-8")
}