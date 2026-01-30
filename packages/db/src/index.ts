import { populateDbWithHistoricReserveRatio } from "./sync/analytics/reserveRatio/initialSync"
import { populateDbWithHistoricOrders } from "./sync/orders/initialSync"
import { detectPoolDatumChange } from "./sync/analytics/reserveRatio/detectDatumChange"

// await detectPoolDatumChange()
export * from "./client/orders"
export * from "./sync/types"

await populateDbWithHistoricReserveRatio()
// await populateDbWithHistoricOrders()
