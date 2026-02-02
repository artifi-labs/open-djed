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

  const end = Date.now() - start
  logger.info(`Time sec: ${(end / 1000).toFixed(2)}`)
}
