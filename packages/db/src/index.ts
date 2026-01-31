import { populateDbWithHistoricReserveRatio } from "./sync/analytics/reserveRatio/initialSync"
import { populateDbWithHistoricOrders } from "./sync/orders/initialSync"
import { detectPoolDatumChange } from "./sync/analytics/reserveRatio/detectDatumChange"
import {
  deleteAllReserveRatios,
  getLatestReserveRatio,
  getPeriodReserveRatio,
} from "./client/reserveRatio"

// await detectPoolDatumChange()
export * from "./client/orders"
export * from "./client/reserveRatio"
export * from "./sync/types"

// await populateDbWithHistoricReserveRatio()
// await populateDbWithHistoricOrders()

const rows = await getPeriodReserveRatio("D")
// await deleteAllReserveRatios()
console.log(rows)
