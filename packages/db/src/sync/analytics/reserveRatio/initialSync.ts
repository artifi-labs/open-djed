import { logger } from "../../../utils/logger"
import { OracleDatum, PoolDatum } from "@open-djed/data"
import { Data } from "@lucid-evolution/lucid"
import {
  type UTxO,
  type PoolUTxoWithDatumAndTimestamp,
  type OracleUTxoWithDatumAndTimestamp,
  type TransactionData,
  type ReserveEntries,
  type ReserveRatio,
  type Block,
} from "../../types"
import {
  processBatch,
  registry,
  blockfrost,
  blockfrostFetch,
  getEveryResultFromPaginatedEndpoint,
  breakIntoDays,
  assignTimeWeightsToDailyUTxOs,
  getTimeWeightedDailyReserveRatio,
  logDayChunkDetails,
  logWeightedDayChunkDetails,
  logAllWeightedDayChunks,
  processReserveRatiosToInsert,
} from "../../utils"
import { prisma } from "../../../../lib/prisma"

const withBlockTime = (
  txs: { tx_hash: string; block_time: number }[],
  utxos: UTxO[],
  assetId: string,
) => {
  const txTimeByHash = new Map(
    txs.map((tx) => [tx.tx_hash, tx.block_time] as const),
  )

  return utxos.flatMap((utxo) => {
    const blockTime = txTimeByHash.get(utxo.hash)
    if (blockTime === undefined) return []

    return utxo.outputs
      .filter((output) => output.data_hash !== null)
      .filter((output) => output.amount.some((amt) => amt.unit === assetId))
      .map((output) => ({
        ...output,
        tx_hash: utxo.hash,
        blockTime,
      }))
  })
}

export const populateDbWithHistoricReserveRatio = async () => {
  const start = Date.now()

  const everyPoolTx = await getEveryResultFromPaginatedEndpoint(
    `/assets/${registry.poolAssetId}/transactions`,
  ) //txs from pool
  const everyOracleTx = await getEveryResultFromPaginatedEndpoint(
    `/assets/${registry.oracleAssetId}/transactions`,
  ) //txs from oracle

  if (everyPoolTx.length === 0) {
    logger.info("No transactions found")
    return
  }
  logger.info(`Found ${everyPoolTx.length} transactions`)

  logger.info("Fetching UTxOs...")
  const everyPoolUTxO: UTxO[] = await processBatch(
    everyPoolTx,
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

  if (everyOracleTx.length === 0) {
    logger.info("No transactions found")
    return
  }
  logger.info(`Found ${everyOracleTx.length} transactions`)

  logger.info("Fetching UTxOs...")
  const everyOracleUTxO: UTxO[] = await processBatch(
    everyOracleTx,
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

  // console.log("everyPoolTx", everyPoolTx[0])
  // console.log("everyPoolUTxO", everyPoolUTxO[0])

  const poolUTxOsWithTimestamp = withBlockTime(
    everyPoolTx,
    everyPoolUTxO,
    registry.poolAssetId,
  )
  const OracleUTXOsWithTimestamp = withBlockTime(
    everyOracleTx,
    everyOracleUTxO,
    registry.oracleAssetId,
  )

  // console.log("poolUTxOsWithTimestamp", poolUTxOsWithTimestamp[0])
  // console.log("OracleUTXOsWithTimestamp", OracleUTXOsWithTimestamp[0])

  logger.info("Fetching pool UTxO datums and transaction data...")
  const poolUTxOsWithDatumAndTimestamp = await processBatch(
    poolUTxOsWithTimestamp,
    async (utxo, idx) => {
      let rawDatum: string | undefined
      try {
        const [datum, tx] = await Promise.all([
          utxo.data_hash
            ? blockfrost.getDatum(utxo.data_hash).catch((err) => {
                logger.error(err, `Error fetching datum for ${utxo.data_hash}:`)
                throw err
              })
            : Promise.resolve(undefined),
          blockfrostFetch(`/txs/${utxo.tx_hash}`) as Promise<TransactionData>,
        ])
        rawDatum = datum

        if (!rawDatum) {
          throw new Error(`Couldn't get pool datum for ${utxo.tx_hash}`)
        }

        return {
          poolDatum: Data.from(rawDatum, PoolDatum),
          timestamp: new Date(utxo.blockTime * 1000).toISOString(),
          block_hash: tx.block,
          block_slot: tx.slot,
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : JSON.stringify(error)
        logger.info(
          `Skipping pool UTxO ${utxo.tx_hash} (${idx + 1}/${
            poolUTxOsWithTimestamp.length
          }) because its datum could not be decoded: ${message}`,
        )
        return null
      }
    },
    5,
    300,
  ).then((results) =>
    results.filter(
      (utxo): utxo is PoolUTxoWithDatumAndTimestamp => utxo !== null,
    ),
  )

  if (poolUTxOsWithDatumAndTimestamp.length === 0) {
    logger.info("No valid pool UTxOs with datum found")
    return
  }
  logger.info(
    `Enriched ${poolUTxOsWithDatumAndTimestamp.length} pool UTxOs with datum, timestamp and block data`,
  )

  logger.info("Fetching oracle UTxO datums and transaction data...")
  const oracleUTxOsWithDatumAndTimestamp = await processBatch(
    OracleUTXOsWithTimestamp,
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
          throw new Error(`Couldn't get oracle datum for ${utxo.tx_hash}`)
        }

        return {
          oracleDatum: Data.from(rawDatum, OracleDatum),
          timestamp: new Date(utxo.blockTime * 1000).toISOString(),
          block_hash: tx.block,
          block_slot: tx.slot,
        }
      } catch (error) {
        logger.error(
          error,
          `Error processing oracle UTxO ${idx + 1}/${OracleUTXOsWithTimestamp.length}:`,
        )
        logger.debug("Skipping this UTxO and continuing...")
        return null
      }
    },
    5,
    300,
  ).then((results) =>
    results.filter(
      (utxo): utxo is OracleUTxoWithDatumAndTimestamp => utxo !== null,
    ),
  )

  if (oracleUTxOsWithDatumAndTimestamp.length === 0) {
    logger.info("No valid oracle UTxOs with datum found")
    return
  }
  logger.info(
    `Enriched ${oracleUTxOsWithDatumAndTimestamp.length} oracle UTxOs with datum, timestamp, and block data`,
  )

  // console.log(
  //   "poolUTxOsWithDatumAndTimestamp",
  //   poolUTxOsWithDatumAndTimestamp[0],
  // )
  // console.log(
  //   "oracleUTxOsWithDatumAndTimestamp",
  //   oracleUTxOsWithDatumAndTimestamp[0],
  // )

  const ordinateTxOs: ReserveEntries[] = [
    ...poolUTxOsWithDatumAndTimestamp.map((datum) => ({
      key: "pool" as const,
      value: {
        poolDatum: datum.poolDatum,
        timestamp: datum.timestamp,
        block_hash: datum.block_hash,
        block_slot: datum.block_slot,
      },
    })),
    ...oracleUTxOsWithDatumAndTimestamp.map((datum) => ({
      key: "oracle" as const,
      value: {
        oracleDatum: datum.oracleDatum,
        timestamp: datum.timestamp,
        block_hash: datum.block_hash,
        block_slot: datum.block_slot,
      },
    })),
  ].sort((a, b) => (a.value.timestamp < b.value.timestamp ? -1 : 1))

  // console.log("ordinateTxOs", ordinateTxOs)

  const dailyTxOs = breakIntoDays(ordinateTxOs)
  // const firstDayChunk = dailyTxOs[0]
  // if (firstDayChunk) {
  //   logDayChunkDetails(firstDayChunk)
  // }
  const weightedDailyTxOs = assignTimeWeightsToDailyUTxOs(dailyTxOs)
  logAllWeightedDayChunks(weightedDailyTxOs)
  console.log("weightedDailyTxOs", weightedDailyTxOs)

  // const firstWeightedChunk = weightedDailyTxOs[1]
  // if (firstWeightedChunk) {
  //   console.log("first weighted daily chunk", firstWeightedChunk)
  //   logWeightedDayChunkDetails(firstWeightedChunk)
  // }

  // const secondWeightedChunk = weightedDailyTxOs[1]
  // if (secondWeightedChunk) {
  //   logWeightedDayChunkDetails(secondWeightedChunk)
  // }

  // const dailyRatios = getTimeWeightedDailyReserveRatio(weightedDailyTxOs)
  // if (dailyRatios.length === 0) {
  //   logger.warn("No daily reserve ratios computed")
  // } else {
  //   logger.info({ dailyRatios }, "Daily reserve ratios")
  // }

  logger.info("Processing order data...")

  // const dailyReserveRatioToInsert = processReserveRatiosToInsert(dailyRatios)

  // logger.info(
  //   `Inserting ${dailyReserveRatioToInsert.length} reserve ratio into database...`,
  // )
  // await prisma.reserveRatio.createMany({
  //   data: dailyReserveRatioToInsert,
  //   skipDuplicates: true,
  // })
  // logger.info(
  //   `Historic reserve ratio sync complete. Inserted ${dailyRatios.length} reserve ratios`,
  // )

  // // Fetch and store latest block
  // const latestBlock = (await blockfrostFetch(`/blocks/latest`)) as Block
  // await prisma.block.create({
  //   data: { latestBlock: latestBlock.hash, latestSlot: latestBlock.slot },
  // })
  // logger.info(`Latest block: ${latestBlock.hash}`)

  // const end = Date.now() - start
  // logger.info(`Time sec: ${(end / 1000).toFixed(2)}`)
}
