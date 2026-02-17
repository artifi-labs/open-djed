import { DEX_CONFIG } from "../../../../dex.config";
import type { DexConfig } from "../../../../types/dex";
import { logger } from "../../../../utils/logger";
import { blockfrost } from "../../../utils";
import type { AddressTransaction, AddressTransactionsResponse } from "@open-djed/blockfrost/src/types/address/addressTransaction";
import type { TransactionUtxo, TransactionUtxoAmount, TransactionUtxoOutput, TransactionUtxoResponse } from "@open-djed/blockfrost/src/types/transaction/transactionUtxo";
import path from "path"
import JSONbig from "json-bigint"
import fsPromises from "fs/promises"

const DJED_POLICY_ID_AND_NAME = "8db269c3ec630e06ae29f74bc39edd1f87c819f1056206e879a1cd61446a65644d6963726f555344"

type DexUtxoAggregate = {
  block_time: number
  transactions: {
    tx_hash: string
    utxos: TransactionUtxoResponse[]
  }[]
}

export async function getDexsTokenPrices() {
  // TODO: This could be in a promise to run all dexes in parallel.
  return await getDexTokenPrices(DEX_CONFIG.mainnet.minswap)
}


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

export async function readAddressTxFromFile(
  filePath: string,
): Promise<AddressTransactionsResponse> {
  const absolutePath = path.resolve(filePath)

  const raw = await fsPromises.readFile(absolutePath, "utf-8")
  const parsed = JSONbig.parse(raw) as AddressTransactionsResponse
  return parsed
}

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


export async function readUtxoFile(
  filePath: string,
): Promise<TransactionUtxoResponse[]> {
  const absolutePath = path.resolve(filePath)

  const raw = await fsPromises.readFile(absolutePath, "utf-8")
  const parsed = JSONbig.parse(raw) as TransactionUtxoResponse[]
  return parsed
}


export async function getDexTokenPrices(dexConfig: DexConfig) {

  let dexTransactions: AddressTransactionsResponse = []

  const tokenUtxos: TransactionUtxoResponse[] = []

  if (!dexConfig.address || !dexConfig.pollId) {
    throw new Error(`Missing address or pollId for dex ${dexConfig.displayName || dexConfig}`)
  }

  // Get all Transaction for the dex Address, sort by block_time
  /*try { 
    dexTransactions = await blockfrost.getAddressTransactions(
      { address: dexConfig.address },
      { order: "desc" },
      { allPages: true, retry: 5, retryDelayMs: 10_000 }
    )
  
    if (dexTransactions.length === 0) {
      logger.warn(`No transactions found for dex ${dexConfig.displayName || dexConfig} at address ${dexConfig.address}`)
      return []
    }

    logger.info(`Fetched ${dexTransactions.length} transactions for dex ${dexConfig.displayName || dexConfig}`)
    
  } catch (error) {
    logger.error(error, `Error fetching transactions for dex ${dexConfig.displayName || dexConfig}`)
    return []
  }*/

  //await writeAddressTxToFile(dexTransactions, "./dexTransactions.json")

  dexTransactions = await readAddressTxFromFile("./dexTransactions.json")
  if (dexTransactions.length === 0) {
    logger.warn(`No transactions read from file for dex ${dexConfig.displayName || dexConfig}`)
    return []
  }

  logger.info(`Read ${dexTransactions.length} transactions from file for dex ${dexConfig.displayName || dexConfig}`)

  // Get all UTXOS for the dex Address
  /*try {
    const concurrency = 5
    let index = 0
    let stop = false

    const workers = Array.from({ length: concurrency }, async () => {
      while (true) {
        if (stop) break
        const tx = dexTransactions[index++]
        if (!tx) break

        const transactionUtxos: TransactionUtxoResponse = await blockfrost.getTransactionUTxOs(
          { hash: tx.tx_hash },
          { retry: 5, retryDelayMs: 10_000 },
        )

        if (!transactionUtxos) {
          logger.warn(`No UTXOs found for transaction ${tx.tx_hash} of dex ${dexConfig.displayName || dexConfig}`)
          continue
        }

        transactionUtxos.outputs.find((output: TransactionUtxoOutput) => {
          if (output.amount.find((amount: TransactionUtxoAmount) => amount.unit === DJED_POLICY_ID_AND_NAME)) {
            if (tokenUtxos.length < 20) {
              tokenUtxos.push(transactionUtxos)
            }
            if (tokenUtxos.length >= 20) {
              stop = true
            }
            logger.info(`Found UTXO with DJED in transaction ${tx.tx_hash} of dex ${dexConfig.displayName || dexConfig}`)
          }
        })
      }
    })

    await Promise.all(workers)
    
  
    logger.info(`Found ${tokenUtxos.length} Itransactions with DJED UTXOs for dex ${dexConfig.displayName || dexConfig}`)
  } catch (error) {
    logger.error(error, `Error fetching UTXOs for transactions of dex ${dexConfig.displayName || dexConfig}`)
    return []
  }*/

  //await writeUtxoFile(tokenUtxos, "./dexTokenUtxos.json")

  // TODO: THIS WILL BE REMOVED
  tokenUtxos.push(...await readUtxoFile("./dexTokenUtxos.json"))
  if (tokenUtxos.length === 0) {
    logger.warn(`No UTXOs read from file for dex ${dexConfig.displayName || dexConfig}`)
    return []
  }

  const tokenUtxoHashes = new Set(tokenUtxos.map((utxo) => utxo.hash))
  dexTransactions = dexTransactions.filter((tx) => tokenUtxoHashes.has(tx.tx_hash)).sort((a, b) => a.block_time - b.block_time)
  logger.info(
    `Filtered to ${dexTransactions.length} transactions with matching token UTXOs for dex ${dexConfig.displayName || dexConfig}`,
  )

  const utxosByHash = new Map<string, TransactionUtxoResponse[]>()
  for (const utxo of tokenUtxos) {
    const existing = utxosByHash.get(utxo.hash)
    if (existing) existing.push(utxo)
    else utxosByHash.set(utxo.hash, [utxo])
  }

  const aggregateByBlock = new Map<number, Map<string, TransactionUtxoResponse[]>>()
  for (const tx of dexTransactions) {
    const utxos = utxosByHash.get(tx.tx_hash)
    if (!utxos || utxos.length === 0) continue

    const blockMap = aggregateByBlock.get(tx.block_time) ?? new Map()
    blockMap.set(tx.tx_hash, utxos)
    aggregateByBlock.set(tx.block_time, blockMap)
  }

  const aggregated: DexUtxoAggregate[] = Array.from(aggregateByBlock.entries())
    .sort(([a], [b]) => a - b)
    .map(([block_time, txMap]) => ({
      block_time,
      transactions: Array.from(txMap.entries()).map(([tx_hash, utxos]) => ({
        tx_hash,
        utxos,
      })),
    }))

  logger.info(aggregated)
}