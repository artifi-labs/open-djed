import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  client: {
    NETWORK: z.enum(["Mainnet", "Preprod"]),
    BLOCKFROST_URL: z.url(),
    BLOCKFROST_PROJECT_ID: z.string(),
    PORT: z
      .string()
      .transform((port) => Number(port))
      .default(8080),
  },
  clientPrefix: "",
  runtimeEnv: process.env,
})
