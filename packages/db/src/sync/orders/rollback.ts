import { logger } from "../../utils/logger"
import { prisma } from "../../../lib/prisma"
import type { Block } from "../types"
import { blockfrostFetch } from "../utils"

/**
 * if a finalized block disappears from the blockchain, a rollback has occurred
 * if that happens, go through
 * @returns
 */
export async function rollback() {
  const sync = await prisma.block.findFirst()
  if (!sync) return

  const syncIsValid = await blockfrostFetch(`/blocks/${sync.latestBlock}`)
    .then(() => true)
    .catch((e) => {
      if (e.response?.status === 404) return false
      throw e
    })

  if (syncIsValid) {
    logger.info("No rollback detected")
    return
  }

  logger.warn(`Checking rollback from: ${sync.latestBlock}`)

  const storedBlocks = await prisma.order.findMany({
    where: { slot: { lte: sync.latestSlot } },
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

      await prisma.order.deleteMany({
        where: { slot: { gt: b.slot } },
      })

      await prisma.block.update({
        where: { id: sync.id },
        data: {
          latestBlock: b.block,
          latestSlot: b.slot,
        },
      })

      logger.info("Rollback completed")
      return
    }
  }

  throw new Error("Rollback exceeds DB history — full resync required")
}
