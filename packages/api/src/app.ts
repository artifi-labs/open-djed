import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
export type { Order } from "@open-djed/db"
import { ordersRouter } from "./modules/orders/orders.router"
import { protocolRouter } from "./modules/protocol/protocol.router"
import { simulatorRouter } from "./modules/simulator/simulator.router"
import { tokensRouter } from "./modules/tokens/tokens.router"
import { AnalyticsRouter } from "./modules/analytics/analytics.routers"
import { openAPIRouteHandler } from "hono-openapi"

export const app = new Hono()
  .basePath("/api")
  .use(cors())
  .use(logger())
  .route("/", protocolRouter)
  .route("/", tokensRouter)
  .route("/", ordersRouter)
  .route("/", simulatorRouter)
  .route("/", AnalyticsRouter)

// OpenAPI documentation endpoint
app.get(
  "/openapi.json",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Open DJED API",
        version: "1.0.0",
        description: "API documentation",
      },
    },
  }),
)

// Scalar API endpoint
app.get("/scalar", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Open DJED API Documentation</title>

        <!-- Favicon -->
        <link rel="icon" type="image/png" href="https://djed.artifi.finance/logos/opendjed-icon.svg" />

        <!-- Meta -->
        <meta name="description" content="Open DJED API Documentation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <meta property="og:title" content="Open DJED API" />
        <meta property="og:description" content="API documentation for Open DJED" />
      </head>

      <body>
        <script
          id="api-reference"
          data-url="/api/openapi.json"
          data-theme="default"
        ></script>

        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>
  `)
})
