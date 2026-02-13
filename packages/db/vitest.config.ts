import { defineConfig } from "vitest/config"
import path from "path"
import dotenv from "dotenv"

dotenv.config({ path: path.resolve(__dirname, ".env.test") })

export default defineConfig({})
