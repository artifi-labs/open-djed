import { logger } from "../../utils/logger"
import { OrderDatum } from "@open-djed/data"
import { Data } from "@lucid-evolution/lucid"
import { prisma } from "../../../lib/prisma"
import {
  type Block,
  type Order,
  type OrderUTxOWithDatumAndBlock,
  type Transaction,
  type TransactionData,
  type UTxO,
} from "../types"
import {
  processBatch,
  registry,
  blockfrost,
  blockfrostFetch,
  processOrdersToInsert,
} from "../utils"

export const populateDbWithHistoricOrders = async () => {
  const start = Date.now()

  logger.info("Fetching all transactions...")
  const everyOrderTx: Transaction[] = []
  let txPage = 1
  while (true) {
    try {
      logger.debug(`Fetching transaction page ${txPage}...`)
      const pageResult = (await blockfrostFetch(
        `/addresses/${registry.orderAddress}/transactions?page=${txPage}&count=100`,
      )) as Transaction[]

      if (!Array.isArray(pageResult) || pageResult.length === 0) break

      everyOrderTx.push(...pageResult)
      txPage++
    } catch (error) {
      logger.error(error, `Error fetching page ${txPage}:`)
      break
    }
  }

  if (everyOrderTx.length === 0) {
    logger.info("No transactions found")
    return
  }
  logger.info(`Found ${everyOrderTx.length} transactions`)

  logger.info("Fetching UTxOs...")
  const everyOrderUTxO: UTxO[] = await processBatch(
    everyOrderTx,
    async (order) => {
      try {
        return (await blockfrostFetch(`/txs/${order.tx_hash}/utxos`)) as UTxO
      } catch (error) {
        logger.error(error, `Error fetching UTxO for tx ${order.tx_hash}:`)
        throw error
      }
    },
    10,
    500,
  )

  const orderUTxOsWithUnit = everyOrderUTxO.flatMap((utxo) =>
    utxo.outputs
      .filter((output) =>
        output.amount.some((amt) => amt.unit === registry.orderAssetId),
      )
      .map((output) => ({
        ...output,
        tx_hash: utxo.hash,
      })),
  )

  if (orderUTxOsWithUnit.length === 0) {
    logger.info("No order UTxOs found")
    return
  }
  logger.info(`Found ${orderUTxOsWithUnit.length} order UTxOs`)

  logger.info("Fetching datums and transaction data...")
  const orderUTxOWithDatumAndBlock = await processBatch(
    orderUTxOsWithUnit,
    async (utxo, idx) => {
      try {
        const [rawDatum, tx] = await Promise.all([
          utxo.data_hash
            ? blockfrost.getDatum(utxo.data_hash).catch((err) => {
                logger.error(err, `Error fetching datum for ${utxo.data_hash}:`)
                throw err
              })
            : Promise.resolve(undefined),
          blockfrostFetch(`/txs/${utxo.tx_hash}`) as Promise<TransactionData>,
        ])

        if (!rawDatum) {
          throw new Error(`Couldn't get order datum for ${utxo.tx_hash}`)
        }

        return {
          ...utxo,
          orderDatum: Data.from(rawDatum, OrderDatum),
          block_hash: tx.block,
          block_slot: tx.slot,
        }
      } catch (error) {
        logger.error(
          error,
          `Error processing UTxO ${idx + 1}/${orderUTxOsWithUnit.length}:`,
        )
        logger.debug("Skipping this UTxO and continuing...")
        return null
      }
    },
    5,
    300,
  ).then((results) =>
    results.filter((utxo): utxo is OrderUTxOWithDatumAndBlock => utxo !== null),
  )

  if (orderUTxOWithDatumAndBlock.length === 0) {
    logger.info("No valid order UTxOs with datum found")
    return
  }
  logger.info(
    `Enriched ${orderUTxOWithDatumAndBlock.length} order UTxOs with datum and block data`,
  )

  logger.info("Processing order data...")

  const ordersToInsert: Order[] = await processOrdersToInsert(
    orderUTxOWithDatumAndBlock,
  )

  logger.info(`Inserting ${ordersToInsert.length} orders into database...`)
  await prisma.order.createMany({
    data: ordersToInsert,
    skipDuplicates: true,
  })
  logger.info(
    `Historic orders sync complete. Inserted ${ordersToInsert.length} orders`,
  )

  // Fetch and store latest block
  const latestBlock = (await blockfrostFetch(`/blocks/latest`)) as Block
  await prisma.block.create({
    data: { latestBlock: latestBlock.hash, latestSlot: latestBlock.slot },
  })
  logger.info(`Latest block: ${latestBlock.hash}`)

  const end = Date.now() - start
  logger.info(`Time sec: ${(end / 1000).toFixed(2)}`)
}
