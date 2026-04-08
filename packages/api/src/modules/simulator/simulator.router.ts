import { Hono } from "hono"
import { describeRoute, resolver, validator } from "hono-openapi"
import z from "zod"
import { cacheMiddleware } from "../../shared/middleware"
import { AppError } from "../../shared/errors"
import { getSumFeesEarningsRate, getSumStakingRewardsRate } from "@open-djed/db"
import { DateRangeSchema } from "./simulator.schema"

export const simulatorRouter = new Hono()
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
            "application/json": {
              schema: resolver(z.number()),
              example: 0.00123,
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "application/json": {
              example: { error: "BadRequest", message: "Bad Request" },
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
    validator("query", DateRangeSchema),
    async (c) => {
      const { startDate, endDate } = c.req.valid("query")
      const parsedStartDate = new Date(`${startDate}T00:00:00.000Z`)
      const parsedEndDate = new Date(`${endDate}T00:00:00.000Z`)

      try {
        const sumRates = await getSumStakingRewardsRate(
          parsedStartDate,
          parsedEndDate,
        )
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
    "/historical-fees-earnings",
    cacheMiddleware,
    describeRoute({
      summary: "Get historical fees earnings rate sum",
      description: "Get historical fees earnings rate sum for a date range",
      tags: ["Analytics"],
      responses: {
        200: {
          description: "Successfully got the historical fees earnings rate sum",
          content: {
            "application/json": {
              schema: resolver(z.number()),
              example: 0.00123,
            },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "application/json": {
              example: { error: "BadRequest", message: "Bad Request" },
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
    validator("query", DateRangeSchema),
    async (c) => {
      const { startDate, endDate } = c.req.valid("query")
      const parsedStartDate = new Date(`${startDate}T00:00:00.000Z`)
      const parsedEndDate = new Date(`${endDate}T00:00:00.000Z`)

      try {
        const sumRates = await getSumFeesEarningsRate(
          parsedStartDate,
          parsedEndDate,
        )
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
