import { z } from "zod"

/**
 * Schema for validating the CONFIG environment variable.
 */
const ConfigSchema = z.object({
  Mainnet: z.url(),
  Preprod: z.url(),
})

/**
 * Schema for validating environment variables.
 *
 */
const schema = z.object({
  API_URL: z.url(),
  NETWORK: z.enum(["Preprod", "Mainnet"]),
  CONFIG: z.string().transform((val) => ConfigSchema.parse(JSON.parse(val))),
  POSTHOG_API_KEY: z.string().optional(),
})

/**
 * Parse and validate environment variables.
 */
const parsed = schema.parse({
  API_URL: process.env.NEXT_PUBLIC_API_URL,
  NETWORK: process.env.NEXT_PUBLIC_NETWORK,
  CONFIG: process.env.NEXT_PUBLIC_CONFIG,
  POSTHOG_API_KEY: process.env.NEXT_PUBLIC_POSTHOG_API_KEY,
})

/**
 * Environment variables loaded and validated.
 * BASE_URL is derived from CONFIG and NETWORK.
 */
export const env = {
  ...parsed,
  BASE_URL: parsed.CONFIG[parsed.NETWORK],
}
