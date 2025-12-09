import cron from 'node-cron'
import { updateOrders } from './updateOrders'

// Run every 30 seconds
cron.schedule('*/30 * * * * *', async () => {
  console.log(`\n\n[${new Date().toISOString()}] Starting scheduled order update...`)
  try {
    await updateOrders()
  } catch (error) {
    console.error('Cron job failed:', error)
  }
})

console.log('Order update cron job started. Running every 30 seconds')

process.on('SIGINT', () => {
  console.log('Shutting down cron job...')
  process.exit(0)
})
