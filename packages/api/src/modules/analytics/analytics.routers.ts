import { Hono, type Context, type Env, type Input } from "hono"
import { cacheMiddleware } from "../../shared/middleware"
import { describeRoute } from "hono-openapi"
import { resolver, validator } from "hono-openapi/zod"
import { ReserveRatioResponseApiSchema } from "./reserveRatio.schema"
import z from "zod"
import { periodSchema, tokenSchema, type PeriodType } from "../../shared"
import { MarketCapResponseApiSchema } from "./marketCap.schema"
import { ShenAdaPriceResponseApiSchema } from "./shenAdaPrice.schema"
import { DjedDexPricesResponseApiSchema } from "./djedDexPrices.schema"
import { VolumesResponseApiSchema } from "./volumes.schema"
import {
  AppError,
  InternalServerError,
  ValidationError,
} from "../../shared/errors"
import {
  getLast60DaysShenYield,
  getPeriodAdaShenPrices,
  getPeriodMarketCap,
  getPeriodPricesForAllTokens,
  getPeriodReserveRatio,
  getPeriodShenYield,
  getPeriodVolume,
  getSumStakingRewardsRate,
  type Period,
} from "@open-djed/db"
import { chainDataCache } from "../../core"

const StakingRewardsSchema = z.object({
  // TODO: CHANGE THIS
  startDate: z.string(),
  endDate: z.string(),
})

// TODO: CHANGE THIS
const historicalDataHandler = <T, S extends z.ZodType | undefined = undefined>(
  dataFetcher: (period: Period) => Promise<T>,
  responseSchema?: S,
) => {
  return async (
    c: Context<
      Env,
      string,
      Input & {
        out: {
          query: { period: PeriodType }
        }
      }
    >,
  ) => {
    let param

    try {
      param = c.req.valid("query")

      if (!param?.period) {
        throw new ValidationError("Missing period in request.")
      }
    } catch (e) {
      console.error("Invalid or missing request payload.", e)
      throw new ValidationError("Invalid or missing request payload.")
    }

    try {
      const rawData = await dataFetcher(param.period.toUpperCase() as Period)

      const data = responseSchema ? responseSchema.parse(rawData) : rawData

      return c.json(data)
    } catch (err) {
      if (err instanceof AppError) {
        throw err
      }

      console.error("Unhandled error in historical data endpoint:", err)
      throw new InternalServerError()
    }
  }
}

export const AnalyticsRouter = new Hono()
  .get(
    "/historical-reserve-ratio",
    cacheMiddleware,
    describeRoute({
      summary: "Get historical reserve ratio",
      description: "Get the historical reserve ratio",
      tags: ["Analytics"],
      responses: {
        200: {
          description: "Successfully got the historical reserve ratio",
          content: {
            "application/json": {
              schema: resolver(ReserveRatioResponseApiSchema),
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "text/plain": {
              example: "Bad Request",
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "text/plain": {
              example: "Internal Server Error",
            },
          },
        },
      },
    }),
    validator(
      "query",
      z.object({
        period: periodSchema,
      }),
    ),
    historicalDataHandler(getPeriodReserveRatio, ReserveRatioResponseApiSchema),
  )
  .get(
    "/historical-market-cap",
    cacheMiddleware,
    describeRoute({
      summary: "Get historical market cap",
      description: "Get the historical market cap for DJED or SHEN",
      tags: ["Analytics"],
      responses: {
        200: {
          description: "Successfully got the historical market cap",
          content: {
            "application/json": {
              schema: resolver(MarketCapResponseApiSchema),
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "text/plain": {
              example: "Bad Request",
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "text/plain": {
              example: "Internal Server Error",
            },
          },
        },
      },
    }),
    validator(
      "query",
      z.object({
        period: periodSchema,
        token: tokenSchema,
      }),
    ),
    (c) => {
      const params = c.req.valid("query")
      return historicalDataHandler(
        (period) => getPeriodMarketCap(period, params.token),
        MarketCapResponseApiSchema,
      )(c)
    },
  )
  .get(
    "/historical-shen-ada-price",
    cacheMiddleware,
    describeRoute({
      summary: "Get historical SHEN/ADA price",
      description: "Get the historical SHEN/ADA price",
      tags: ["Analytics"],
      responses: {
        200: {
          description: "Successfully got the historical SHEN/ADA price",
          content: {
            "application/json": {
              schema: resolver(ShenAdaPriceResponseApiSchema),
            },
          },
        },
      },
    }),
    validator(
      "query",
      z.object({
        period: periodSchema,
      }),
    ),
    historicalDataHandler(
      (period) => getPeriodAdaShenPrices({ period, grouped: true }),
      ShenAdaPriceResponseApiSchema,
    ),
  )
  .get(
    "/historical-djed-dex-price",
    cacheMiddleware,
    describeRoute({
      summary: "Get historical DJED DEX Prices",
      description:
        "Retrieve historical DJED price data aggregated across multiple decentralized exchanges (DEXs) over a specified period.",
      tags: ["Analytics"],
      responses: {
        200: {
          description: "Successfully got the historical DJED DEX prices",
          content: {
            "application/json": {
              schema: resolver(DjedDexPricesResponseApiSchema),
            },
          },
        },
      },
    }),
    validator(
      "query",
      z.object({
        period: periodSchema,
      }),
    ),
    historicalDataHandler(
      (period) => getPeriodPricesForAllTokens(period, "DJED"),
      DjedDexPricesResponseApiSchema,
    ),
  )
  .get(
    "/historical-volumes",
    cacheMiddleware,
    describeRoute({
      summary: "Get historical trading volumes",
      description: "Get the historical trading volumes for DJED and SHEN",
      tags: ["Analytics"],
      responses: {
        200: {
          description: "Successfully got the historical trading volumes",
          content: {
            "application/json": {
              schema: resolver(VolumesResponseApiSchema),
            },
          },
        },
      },
    }),
    validator(
      "query",
      z.object({
        period: periodSchema,
      }),
    ),
    historicalDataHandler(getPeriodVolume, VolumesResponseApiSchema),
  )
  .get(
    "/historical-staking-rewards",
    cacheMiddleware,
    describeRoute({
      summary: "Get historical staking rewards rate sum",
      description: "Get historical staking rewards rate sum for a date range",
      tags: ["Analytics"],
      responses: {
        200: {
          description:
            "Successfully got the historical staking rewards rate sum",
          content: {
            "text/plain": {
              example: "Historical staking rewards rate sum",
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "text/plain": {
              example: "Bad Request",
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "text/plain": {
              example: "Internal Server Error",
            },
          },
        },
      },
    }),
    validator("query", StakingRewardsSchema),
    async (c) => {
      const { startDate, endDate } = c.req.valid("query")
      const parsedStartDate = new Date(`${startDate}T00:00:00.000Z`)
      const parsedEndDate = new Date(`${endDate}T00:00:00.000Z`)

      const cacheKey = `historicalStakingRewards:${startDate}:${endDate}`
      const cached = chainDataCache.get<number>(cacheKey)
      if (cached !== undefined) return c.json(cached)

      try {
        const sumRates = await getSumStakingRewardsRate(
          parsedStartDate,
          parsedEndDate,
        )
        chainDataCache.set(cacheKey, sumRates)
        return c.json(sumRates)
      } catch (err) {
        if (err instanceof AppError) {
          console.error(`${err.name}: ${err.message}`)
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
  .get(
    "/historical-shen-yield",
    cacheMiddleware,
    describeRoute({
      summary: "Get historical SHEN yield",
      description: "Get the historical SHEN yield",
      tags: ["Analytics"],
      responses: {
        200: {
          description: "Successfully got the historical SHEN yield",
          content: {
            "text/plain": {
              example: "SHEN yield data",
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "text/plain": {
              example: "Bad Request",
            },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "text/plain": {
              example: "Internal Server Error",
            },
          },
        },
      },
    }),
    validator(
      "query",
      z.object({
        period: periodSchema,
        projected: z
          .preprocess((val) => val === "true", z.boolean())
          .optional(),
      }),
    ),
    async (c) => {
      const params = c.req.valid("query")

      if (params.projected === true) {
        const data = await getLast60DaysShenYield()
        return c.json(data)
      }

      return historicalDataHandler((p) => getPeriodShenYield(p))(c)
    },
  )
