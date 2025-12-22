import { defineConfig, globalIgnores } from "eslint/config"
import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import prettierConfig from "eslint-config-prettier"

export default defineConfig([
  globalIgnores([
    "**/.next/**",
    "**/dist/**",
    "**/build/**",
    "**/out/**",
    "**/*.d.ts",
    "**/*.config.js",
    "**/*.js",
    "**/node_modules/**",
    "**/.wrangler/**",
    "**/.open-next/**",
  ]),
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  prettierConfig,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports", prefer: "type-imports" },
      ],
      "@typescript-eslint/await-thenable": "error",
      "require-await": "off",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/no-floating-promises": [
        "error",
        { ignoreVoid: false },
      ],
      "@typescript-eslint/no-misused-promises": ["error"],
      "no-constant-condition": "off",
      "prefer-const": "error",
    },
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
  },
])
