import { prisma } from "../../../../lib/prisma"
import { getLatestVolume } from "../../../client/volume"
import { logger } from "../../../utils/logger"
import type { Block } from "../../types"
import { blockfrostFetch } from "../../utils"

/**
 * if a finalized block disappears from the blockchain, a rollback has occurred
 * if that happens, go through the entries in the db until we find a valid block
 * @returns
 */
export async function rollbackVolumes() {
  const latestVolumes = await getLatestVolume(true)
  if (!latestVolumes || !latestVolumes.block || !latestVolumes.slot) return

  const syncIsValid = await blockfrostFetch(`/blocks/${latestVolumes.block}`)
    .then(() => true)
    .catch((e) => {
      if (e.response?.status === 404) return false
      throw e
    })

  if (syncIsValid) {
    logger.info("No rollback detected for Volumes")
    return
  }

  logger.warn(`Checking rollback from: ${latestVolumes.block}`)

  const storedBlocks = await prisma.volume.findMany({
    where: { slot: { lte: latestVolumes.slot } },
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

      await prisma.volume.deleteMany({
        where: { slot: { gt: Number(b.slot) } },
      })

      logger.info("Rollback completed")
      return
    }
  }

  throw new Error("Rollback exceeds DB history — full resync required")
}
