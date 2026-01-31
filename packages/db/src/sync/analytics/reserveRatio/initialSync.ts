import { deletePeriodReserveRatio } from "../../../client/reserveRatio"
import { logger } from "../../../utils/logger"
import {
  registry,
  getEveryResultFromPaginatedEndpoint,
  processReserveRatioTxs,
} from "../../utils"

export const populateDbWithHistoricReserveRatio = async () => {
  const start = Date.now()

  const everyPoolTx = await getEveryResultFromPaginatedEndpoint(
    `/assets/${registry.poolAssetId}/transactions`,
  ) //txs from pool
  const everyOracleTx = await getEveryResultFromPaginatedEndpoint(
    `/assets/${registry.oracleAssetId}/transactions`,
  ) //txs from oracle

  await processReserveRatioTxs(everyPoolTx, everyOracleTx)

  // delete the last day has it still does not have all the necessary txs
  // to calculate the accurate reserve ratio
  await deletePeriodReserveRatio("D")

  const end = Date.now() - start
  logger.info(`Time sec: ${(end / 1000).toFixed(2)}`)
}
