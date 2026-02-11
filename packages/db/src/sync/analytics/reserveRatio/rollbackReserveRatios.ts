import { prisma } from "../../../../lib/prisma"
import { getLatestReserveRatio } from "../../../client/reserveRatio"
import { logger } from "../../../utils/logger"
import type { Block } from "../../types"
import { blockfrostFetch } from "../../utils"

/**
 * if a finalized block disappears from the blockchain, a rollback has occurred
 * if that happens, go through the entries in the db until we find a valid block
 * @returns
 */
export async function rollbackReserveRatios() {
  const latestReserveRatio = await getLatestReserveRatio()
  if (!latestReserveRatio) return

  const syncIsValid = await blockfrostFetch(
    `/blocks/${latestReserveRatio.block}`,
  )
    .then(() => true)
    .catch((e) => {
      if (e.response?.status === 404) return false
      throw e
    })

  if (syncIsValid) {
    logger.info("No rollback detected")
    return
  }

  logger.warn(`Checking rollback from: ${latestReserveRatio.block}`)

  const storedBlocks = await prisma.reserveRatio.findMany({
    where: { slot: { lte: latestReserveRatio.slot } },
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

      await prisma.reserveRatio.deleteMany({
        where: { slot: { gt: b.slot } },
      })

      logger.info("Rollback completed")
      return
    }
  }

  throw new Error("Rollback exceeds DB history — full resync required")
}
