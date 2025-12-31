import { defineConfig } from "i18next-cli"

export default defineConfig({
  locales: ["en", "pt"],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "locales/{{language}}/{{namespace}}.json",

    ignore: ["node_modules/**"],
    mergeNamespaces: false,
    functions: ["t", "*.t", "i18next.t"],
    transComponents: ["Trans", "Translation"],
    transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],

    nsSeparator: ":",
    keySeparator: ".",
    contextSeparator: "_",
    pluralSeparator: "_",

    indentation: 2,
    primaryLanguage: "en",
  },
  lint: {
    // CHECK THIS
    acceptedAttributes: ["title"],
    acceptedTags: ["p"],
    ignoredAttributes: ["data-testid", "aria-label"],
    ignoredTags: ["pre"],
    ignore: ["additional/stuff/**"],
  },
  types: {
    // CHECK THIS
    input: ["locales/en/*.json"],
    output: "src/types/i18next.d.ts",
    resourcesFile: "src/types/resources.d.ts",
    enableSelector: true,
  },
})
