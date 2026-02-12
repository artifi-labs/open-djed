import { prisma } from "../../../../lib/prisma"
import {
  getLatestMarketCapTimestamp,
  getMarketCapByTimestamp,
} from "../../../client/marketCap"
import { logger } from "../../../utils/logger"
import type { Block } from "typescript"
import { blockfrostFetch } from "../../utils"

export async function rollbackMarketCap() {
  const latestTimestamp = await getLatestMarketCapTimestamp()
  if (!latestTimestamp || !latestTimestamp._max.timestamp) return
  const latestMarketCap = await getMarketCapByTimestamp(
    "DJED",
    latestTimestamp._max.timestamp,
  )
  if (!latestMarketCap) return

  const syncIsValid = await blockfrostFetch(`/blocks/${latestMarketCap.block}`)
    .then(() => true)
    .catch((e) => {
      if (e.response?.status === 404) return false
      throw e
    })

  if (syncIsValid) {
    logger.info("No rollback detected")
    return
  }

  logger.warn(`Checking rollback from: ${latestMarketCap.block}`)

  const storedBlocks = await prisma.marketCap.findMany({
    where: { slot: { lte: latestMarketCap.slot } },
    select: { block: true, slot: true },
    orderBy: { slot: "desc" },
    distinct: ["block"],
  })

  for (const b of storedBlocks) {
    const exists = await (
      (await blockfrostFetch(`/blocks/${b.block}`)) as Promise<Block>
    )
      .then(() => true)
      .catch(() => false)

    if (exists) {
      logger.warn(`Rollback anchor found at block ${b.block} slot ${b.slot}`)

      await prisma.marketCap.deleteMany({
        where: { slot: { gt: b.slot } },
      })

      logger.info("Rollback completed")
      return
    }
  }
}
