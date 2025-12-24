import rootConfig from "../../eslint.config.js"
import nextPlugin from "@next/eslint-plugin-next"

const eslintConfig = [
  ...rootConfig,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
    },
  },
]

export default eslintConfig
