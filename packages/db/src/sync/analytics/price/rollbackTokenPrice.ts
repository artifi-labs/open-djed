import type { Block } from "typescript"
import { prisma } from "../../../../lib/prisma"
import {
  getLatestPriceTimestamp,
  getPricesByTimestamp,
} from "../../../client/price"
import { logger } from "../../../utils/logger"
import { blockfrostFetch } from "../../utils"

export async function rollbackTokenPrices() {
  const latestTokenPrice = await getLatestPriceTimestamp()
  if (!latestTokenPrice || !latestTokenPrice._max.timestamp) return
  const latestToken = await getPricesByTimestamp(
    "DJED",
    latestTokenPrice._max.timestamp,
  )

  const syncIsValid = await blockfrostFetch(`/blocks/${latestToken.block}`)
    .then(() => true)
    .catch((e) => {
      if (e.response?.status === 404) return false
      throw e
    })

  if (syncIsValid) {
    logger.info("No rollback detected for Token Prices")
    return
  }

  logger.warn(`Checking rollback from: ${latestToken.block}`)

  const storedBlocks = await prisma.price.findMany({
    where: { slot: { lte: latestToken.slot } },
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

      await prisma.price.deleteMany({
        where: { slot: { gt: b.slot } },
      })

      logger.info("Rollback completed")
      return
    }
  }
}
