// Extractor tool configuration file
import { fallbackLng, languages } from "@/i18n/settings"
import { defineConfig } from "i18next-cli"

export default defineConfig({
  locales: languages,
  extract: {
    primaryLanguage: fallbackLng,

    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "locales/{{language}}/{{namespace}}.json",

    ignore: ["node_modules/**"],
    mergeNamespaces: false,
    functions: ["t", "*.t", "i18next.t"],
    transComponents: ["Trans", "Translation"],
    transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],

    defaultValue: "",

    nsSeparator: ":",
    keySeparator: ".",
    contextSeparator: "_",
    pluralSeparator: "_",

    indentation: 2,
  },
})
