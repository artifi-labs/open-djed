import { Data } from "@lucid-evolution/lucid"
import { logger } from "../../../utils/logger"
import type { Transaction, UTxO } from "../../types"
import {
  blockfrost,
  blockfrostFetch,
  getEveryResultFromPaginatedEndpoint,
  processBatch,
  registry,
} from "../../utils"
import { inspect } from "node:util"

type PoolDatumVersion = "withLastOrder" | "noLastOrder" | "unknown"

const classifyPoolDatum = (decoded: unknown): PoolDatumVersion => {
  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("fields" in decoded)
  ) {
    return "unknown"
  }

  const fields = (decoded as { fields?: unknown[] }).fields
  if (!Array.isArray(fields) || fields.length < 4) return "unknown"

  const lastOrder = fields[3] as { index?: number; fields?: unknown[] } | null
  if (!lastOrder || typeof lastOrder.index !== "number") return "unknown"

  return lastOrder.index === 1 ? "noLastOrder" : "withLastOrder"
}

const describeLastOrder = (decoded: unknown | undefined) => {
  if (!decoded || typeof decoded !== "object" || Array.isArray(decoded)) {
    return "lastOrder=unknown"
  }
  const fields = (decoded as { fields?: unknown[] }).fields
  if (!Array.isArray(fields) || fields.length < 4) return "lastOrder=unknown"
  const lastOrder = fields[3] as { index?: number; fields?: unknown[] } | null
  if (!lastOrder || typeof lastOrder.index !== "number")
    return "lastOrder=unknown"
  return lastOrder.index === 1 ? "lastOrder=Nothing" : "lastOrder=Just(...)"
}

const logDatum = (label: string, decoded: unknown | undefined) => {
  console.log(
    label,
    inspect(decoded, { depth: 6, colors: true, maxArrayLength: 50 }),
  )
}

export const detectPoolDatumChange = async () => {
  logger.info("Detecting pool datum changes...")

  const everyPoolTx = (await getEveryResultFromPaginatedEndpoint(
    `/assets/${registry.poolAssetId}/transactions`,
  )) as Transaction[]

  if (everyPoolTx.length === 0) {
    logger.info("No pool transactions found")
    return
  }

  const sortedTxs = [...everyPoolTx].sort((a, b) => a.block_time - b.block_time)

  let lastVersion: PoolDatumVersion | null = null
  let lastSeen: {
    version: PoolDatumVersion
    tx: Transaction
    decoded: unknown
  } | null = null

  await processBatch(
    sortedTxs,
    async (tx) => {
      const utxo = (await blockfrostFetch(`/txs/${tx.tx_hash}/utxos`)) as UTxO

      const outputs = utxo.outputs.filter(
        (output) =>
          output.data_hash !== null &&
          output.amount.some((amt) => amt.unit === registry.poolAssetId),
      )

      for (const output of outputs) {
        const rawDatum = output.data_hash
          ? await blockfrost.getDatum(output.data_hash)
          : undefined
        if (!rawDatum) continue

        const decodedAny = Data.from(rawDatum, Data.Any)
        const version = classifyPoolDatum(decodedAny)

        if (lastVersion === null) {
          lastVersion = version
          lastSeen = { version, tx, decoded: decodedAny }
          logger.info(
            `First pool datum version: ${version} at ${new Date(
              tx.block_time * 1000,
            ).toISOString()} (${tx.tx_hash})`,
          )
          logDatum("First version decodedAny:", decodedAny)
          continue
        }

        if (version !== lastVersion) {
          logger.warn(
            `Pool datum version change ${lastVersion} -> ${version} at ${new Date(
              tx.block_time * 1000,
            ).toISOString()} (${tx.tx_hash}); ${describeLastOrder(
              lastSeen?.decoded,
            )} -> ${describeLastOrder(decodedAny)}`,
          )
          logDatum("old", lastSeen?.decoded)
          logDatum("new", decodedAny)
          lastVersion = version
          lastSeen = { version, tx, decoded: decodedAny }
        }
      }
    },
    5,
    300,
  )
}
