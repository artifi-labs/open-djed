import {
  getEveryResultFromPaginatedEndpoint,
  processDjedMarketCap,
  registry,
} from "../../../utils"

export const populateDbWithHistoricDjedMC = async () => {
  const everyPoolTx = await getEveryResultFromPaginatedEndpoint(
    `/assets/${registry.poolAssetId}/transactions`,
  ) //txs from pool
  const everyOracleTx = await getEveryResultFromPaginatedEndpoint(
    `/assets/${registry.oracleAssetId}/transactions`,
  ) //txs from oracle

  await processDjedMarketCap(everyPoolTx, everyOracleTx)
}
