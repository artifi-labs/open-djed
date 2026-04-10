import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import { AppError } from "../../shared/errors"
import { getOracleUTxO, getPoolUTxO } from "../../core"
import { protocolDataResponseApiSchema } from "./protocol.schema"

export const protocolRouter = new Hono().get(
  "/protocol-data",
  describeRoute({
    summary: "Get protocol data",
    description: "Get on-chain protocol data",
    tags: ["Protocol"],
    responses: {
      200: {
        description: "Successfully built the cancel order transaction",
        content: {
          "application/json": {
            schema: resolver(protocolDataResponseApiSchema),
          },
        },
      },
      400: {
        description: "Bad Request",
        content: {
          "application/json": {
            example: { error: "BadRequestError", message: "Invalid input" },
          },
        },
      },
      500: {
        description: "Internal Server Error",
        content: {
          "application/json": {
            example: {
              error: "InternalServerError",
              message: "Something went wrong.",
            },
          },
        },
      },
    },
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
