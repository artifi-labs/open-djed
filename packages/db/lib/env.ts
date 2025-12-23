import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  client: {
    NETWORK: z.enum(["Mainnet", "Preprod"]),
    BLOCKFROST_URL: z.string().url(),
    BLOCKFROST_PROJECT_ID: z.string(),
    DATABASE_URL: z.string(),
  },
  clientPrefix: "",
  runtimeEnv: process.env,
})

const schema = z.object({
  CRON_SCHEDULE: z.string().default("0 */2 * * * *"), // every 2 minutes
  SAFETY_MARGIN: z.coerce.number().default(10),
  BATCH_SIZE_SMALL: z.coerce.number().default(5),
  BATCH_SIZE_MEDIUM: z.coerce.number().default(10),
  BATCH_DELAY_SMALL: z.coerce.number().default(300),
  BATCH_DELAY_MEDIUM: z.coerce.number().default(150),
  BATCH_DELAY_LARGE: z.coerce.number().default(100),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error(
    "❌ Invalid environment variables:",
    JSON.stringify(parsed.error.format(), null, 4),
  )
  process.exit(1)
}

export const config = parsed.data
