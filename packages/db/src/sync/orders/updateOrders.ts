import { logger } from '../../utils/logger'
import { prisma } from '../../../lib/prisma'
import { updatePendingOrders } from './pendingOrders'
import { rollback } from './rollback'
import { syncNewOrders } from './newOrders'

export async function updateOrders() {
  const start = Date.now()
  logger.info('=== Starting Order Update Process ===')

  try {
    await rollback()
    await updatePendingOrders()
    await syncNewOrders()

    logger.info('=== Order Update Complete ===')
    const end = Date.now() - start
    logger.info(`Time sec: ${(end / 1000).toFixed(2)}`)
  } catch (error) {
    logger.error(error, 'Error during order update:')
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
