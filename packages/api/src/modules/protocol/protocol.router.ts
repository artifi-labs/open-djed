import { Hono } from "hono"
import { describeRoute } from "hono-openapi"
import { AppError } from "../../shared/errors"
import { getOracleUTxO, getPoolUTxO } from "../../core"

export const protocolRouter = new Hono().get(
  "/protocol-data",
  describeRoute({
    summary: "Get protocol data",
    description: "Get on-chain protocol data",
    tags: ["Protocol"],
  }),
  async (c) => {
    try {
      const [oracleFields, poolDatum] = await Promise.all([
        getOracleUTxO().then((o) => o.oracleDatum.oracleFields),
        getPoolUTxO().then((p) => p.poolDatum),
      ])
      return c.json({
        oracleDatum: {
          oracleFields: {
            adaUSDExchangeRate: {
              numerator: oracleFields.adaUSDExchangeRate.numerator.toString(),
              denominator:
                oracleFields.adaUSDExchangeRate.denominator.toString(),
            },
          },
        },
        poolDatum: {
          djedInCirculation: poolDatum.djedInCirculation.toString(),
          shenInCirculation: poolDatum.shenInCirculation.toString(),
          adaInReserve: poolDatum.adaInReserve.toString(),
          minADA: poolDatum.minADA.toString(),
        },
      })
    } catch (err) {
      if (err instanceof AppError) {
        console.error(`protocol-data: ${err.name}: ${err.message}`)
        return c.json({ error: err.name, message: err.message }, err.status)
      }
      console.error("Unhandled error:", err)
      return c.json(
        { error: "InternalServerError", message: "Something went wrong." },
        500,
      )
    }
  },
)
