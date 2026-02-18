import { DEX_CONFIG, type DexNetworkConfig } from "../../../../dex.config";
import { logger } from "../../../../utils/logger";
import { blockfrost, MS_PER_DAY, normalizeToDay } from "../../../utils";
import type { AddressTransaction, AddressTransactionsResponse } from "@open-djed/blockfrost/src/types/address/addressTransaction";
import path from "path"
import JSONbig from "json-bigint"
import fsPromises from "fs/promises"
import type { TransactionUtxoAmount, TransactionUtxoOutput, TransactionUtxoResponse } from "@open-djed/blockfrost/src/types/transaction/transactionUtxo";
import type { DailyUTxOs } from "../../../types";
import { findOracleByTimestamp } from "../../../../oracle";
import { adaDJEDRate, djedToUsdPrice, Rational } from "@open-djed/math";
import { calculateMedian } from "@open-djed/math/src/number";
import { env } from "../../../../../lib/env";
import type { Network } from "../../../../types/network";

const DJED_POLICY_ID_AND_NAME = "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344"

export function aggegatedDexPricesPerDay(dexsPricesPerDay: DexPricesByDay[][]): DexDailyPrices[] {
  const aggregated: Record<string, DexPriceEntry[]> = {}
  
  dexsPricesPerDay.forEach(dexPrices => {
    dexPrices.forEach(dayEntry => {
      const dayKey = dayEntry.day.toISOString()
      if (!aggregated[dayKey]) {
        aggregated[dayKey] = []
      }
      aggregated[dayKey].push(...dayEntry.prices)
    })
  })

  return Object.entries(aggregated).map(([day, prices]) => ({
    day: new Date(day),
    prices,
  }))
}

export async function getDexsTokenPrices(oracleTxs: DailyUTxOs[]): Promise<DexDailyPrices[]> {
  const allDexPrices: DexPricesByDay[][] = []
  const network = env.NETWORK.toLowerCase() as Network

  for (const dex of Object.values(DEX_CONFIG)) {
    const networkConfig = dex[network]
    const hasAddress = !!networkConfig.address

    logger.info(`Processing dex ${dex.displayName}`)

    if (!hasAddress) {
      logger.warn(`Skipping dex ${dex.displayName} because it has no valid address`)
      continue
    }

    const dexPrices = await getDexTokenPrices(dex.displayName, networkConfig, oracleTxs)
    if (!dexPrices || dexPrices.length === 0) {
      logger.warn(`No prices found for dex ${dex.displayName}`)
      continue
    }

    allDexPrices.push(dexPrices)
  }

  if (allDexPrices.length === 0) {
    return []
  }

  const aggregated = aggegatedDexPricesPerDay(allDexPrices)

  return aggregated
}

// TODO: DELETE THIS
export async function writeAddressTxToFile(
  data: AddressTransactionsResponse,
  filePath: string,
): Promise<void> {
  const absolutePath = path.resolve(filePath)

  const json = JSONbig.stringify(data)

  await fsPromises.writeFile(absolutePath, json, {
    encoding: "utf-8",
  })
}

// TODO: DELETE THIS
export async function readAddressTxFromFile(
  filePath: string,
): Promise<AddressTransactionsResponse> {
  const absolutePath = path.resolve(filePath)

  const raw = await fsPromises.readFile(absolutePath, "utf-8")
  const parsed = JSONbig.parse(raw) as AddressTransactionsResponse
  return parsed
}

// TODO: DELETE THIS
export async function writeUtxoFile(
  data: TransactionUtxoResponse[],
  filePath: string,
): Promise<void> {
  const absolutePath = path.resolve(filePath)

  const json = JSONbig.stringify(data)

  await fsPromises.writeFile(absolutePath, json, {
    encoding: "utf-8",
  })
}

// TODO: DELETE THIS
export async function readUtxoFile(
  filePath: string,
): Promise<TransactionUtxoResponse[]> {
  const absolutePath = path.resolve(filePath)

  const raw = await fsPromises.readFile(absolutePath, "utf-8")
  const parsed = JSONbig.parse(raw) as TransactionUtxoResponse[]
  return parsed
}

export async function writeDexPricesToFile(
  data: DexPricesByDay[],
  filePath: string = "./dexPrices.json",
): Promise<void> {
  const absolutePath = path.resolve(filePath)
  const json = JSONbig.stringify(data)
  await fsPromises.writeFile(absolutePath, json, { encoding: "utf-8" })
}

export async function readDexPricesFromFile(
  filePath: string = "./dexPrices.json",
): Promise<DexPricesByDay[]> {
  const absolutePath = path.resolve(filePath)
  const raw = await fsPromises.readFile(absolutePath, "utf-8")
  const parsed = JSONbig.parse(raw) as DexPricesByDay[]
  return parsed.map(entry => ({
    ...entry,
    day: new Date(entry.day),
  }))
}

type DexPriceEntry = {
  dex: string
  djedUsd: number
  djedAda: number
}

type DexDailyPrice = {
  dex: string
  djedUsd: number
  djedAda: number
}

type DexPricesByDay = {
  day: Date
  prices: DexPriceEntry[]
}

type DexDailyPrices = {
  day: Date
  prices: DexDailyPrice[]
}


export async function getDexTokenPrices(dexName: string, dexConfig: DexNetworkConfig, oracleTxs: DailyUTxOs[]) {

  let dexTransactions: AddressTransactionsResponse = []

  const tokenUtxos: TransactionUtxoResponse[] = []

  let dayEntries: DexPricesByDay[] = [] // todo change this to const

  if (!dexConfig.address) {
    throw new Error(`Missing address or poolId for dex ${dexName}`)
  }

  // Get all Transaction for the dex Address, sort by block_time
  /*try { 
    dexTransactions = await blockfrost.getAddressTransactions(
      {
        address: dexConfig.address,
        order: "desc",
      }
    ).allPages({ maxPages: 10 }).retry() // TODO: REMOVE maxPages
  
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
    let stop = false

    /*const workers = Array.from({ length: concurrency }, async () => {
     // while (index == 0) { // TODO: CHANGE THIS BACK TO true
      while (index < dexTransactions.length) {
        if (stop) break
        const tx = dexTransactions[index++]
        if (!tx) break

        const blockTimeInMs = tx.block_time * 1000

        const transactionUtxos: TransactionUtxoResponse = await blockfrost.getTransactionUTxOs(
          { hash: tx.tx_hash }
        ).retry()

        if (!transactionUtxos) {
          logger.warn(`No UTXOs found for transaction ${tx.tx_hash} of dex ${dexName}`)
          continue
        }

        const poolReserve = selectPoolOutput(transactionUtxos.outputs, dexConfig.address)
        if (!poolReserve) {
          logger.warn(`No pool reserve found in transaction ${tx.tx_hash} of dex ${dexName}`)
          continue
        }

        const oracle = findOracleByTimestamp(new Date(blockTimeInMs), oracleTxs)
        if (!oracle) {
          logger.warn(`No oracle found for transaction ${tx.tx_hash} of dex ${dexName} at block time ${tx.block_time}`)
          continue
        }

        const oraclePrice = adaDJEDRate({oracleFields: oracle.oracleDatum.oracleFields})
        if (!oraclePrice) {
          logger.warn(`No oracle price found for transaction ${tx.tx_hash} of dex ${dexName} at block time ${tx.block_time}`)
          continue
        }

        if (poolReserve.djedLiquidity <= 0n) {
          logger.warn(`Invalid DJED liquidity in transaction ${tx.tx_hash} of dex ${dexName}`)
          return
        }

        const djedPriceInAda = new Rational({
          numerator: poolReserve.adaPoolLiquidity,
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
          djedUsd: djedPriceUsd,
          djedAda: djedPriceInAda.toNumber(),
        })

        await writeDexPricesToFile(dayEntries, `./dexPrices${dexName}.json`)

        logger.info(`Processed transaction ${tx.tx_hash} for dex ${dexName} with DJED price in ADA ${djedPriceInAda.toNumber()} and USD ${djedPriceUsd} at block time ${tx.block_time}`)
      }
    })

    await Promise.all(workers)*/

    // TODO: REMOVE THIS
    dayEntries = await readDexPricesFromFile(`./dexPrices${dexName}.json`)

    dayEntries = dayEntries.map((dayEntry) => {
      const medianPrices = calculateDexPricesEntries(dayEntry.prices, dexName)
      return {
        ...dayEntry,
        prices: [{
          dex: dexName,
          djedUsd: medianPrices.djedUsd,
          djedAda: medianPrices.djedAda,
        }]
      }
    }) 
    
  } catch (error) {
    logger.error(error, `Error fetching UTXOs for transactions of dex ${dexName}`)
    return []
  }

  function calculateDexPricesEntries(
    dexPrices: DexPriceEntry[],
    dexName: string,
  ) {

    const djedUsdMedian = calculateMedian(
      dexPrices.filter(p => p.dex === dexName).map(p => p.djedUsd).filter((v): v is number => v !== undefined)
    )
    const djedAdaMedian = calculateMedian(
      dexPrices.filter(p => p.dex === dexName).map(p => p.djedAda).filter((v): v is number => v !== undefined)
    )
    return { djedUsd: djedUsdMedian, djedAda: djedAdaMedian }
  }
  return dayEntries

  // TODO: THIS WILL BE REMOVED
  //await writeUtxoFile(tokenUtxos, "./dexTokenUtxos.json")
  
  /*tokenUtxos.push(...await readUtxoFile("./dexTokenUtxos.json"))
  if (tokenUtxos.length === 0) {
    logger.warn(`No UTXOs read from file for dex ${dexName}`)
    return []
  }*/

  /*dexTransactions = filterTransactionsByUtxos(dexTransactions, tokenUtxos)
  logger.info(
    `Filtered to ${dexTransactions.length} transactions with matching token UTXOs for dex ${dexName}`,
  )

  const utxosByHash = indexUtxosByHash(tokenUtxos)
  const aggregated = aggregateUtxosByBlockTime(dexTransactions, utxosByHash)*/

}

function selectPoolOutput(
  utxoOutputs: TransactionUtxoOutput[],
  dexAddress: string
): { djedLiquidity: bigint; adaPoolLiquidity: bigint } | null {
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
    adaPoolLiquidity: BigInt(lovelaceAmount),
  }
}