import { defineConfig } from "vitest/config"
import path from "path"
import dotenv from "dotenv"
import tsconfigPaths from "vite-tsconfig-paths"

dotenv.config({ path: path.resolve(__dirname, ".env.test") })

export default defineConfig({
  plugins: [tsconfigPaths()],
})
