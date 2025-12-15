import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  client: {
    ADDRESS: z.string().optional(),
    SEED: z.string().optional(),
    NETWORK: z.enum(["Mainnet", "Preprod"]),
    BLOCKFROST_URL: z.string().url(),
    BLOCKFROST_PROJECT_ID: z.string(),
  },
  clientPrefix: "",
  runtimeEnv: process.env,
})
