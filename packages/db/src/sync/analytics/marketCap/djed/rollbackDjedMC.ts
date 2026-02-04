import { prisma } from "../../../../../lib/prisma"
import { getLatestDjedMC } from "../../../../client/djedMarketCap"
import { logger } from "../../../../utils/logger"
import type { Block } from "../../../types"
import { blockfrostFetch } from "../../../utils"

// TODO: when SHEN market is implemented, we should make a general rollback for this table
export async function rollbackDjedMC() {
  const latestMarketCap = await getLatestDjedMC()
  if (!latestMarketCap) return

  const syncIsValid = await blockfrostFetch(`/blocks/${latestMarketCap.block}`)
    .then(() => true)
    .catch((e) => {
      if (e.response?.status === 404) return false
      throw e
    })

  if (syncIsValid) {
    logger.info("No rollback detected for DJED Market Cap")
    return
  }

  logger.warn(`Checking rollback from: ${latestMarketCap.block}`)

  const storedBlocks = await prisma.marketCap.findMany({
    where: { slot: { lte: latestMarketCap.slot }, token: "DJED" },
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
        where: { slot: { gt: b.slot }, token: "DJED" },
      })

      logger.info("Rollback completed")
      return
    }
  }
}
