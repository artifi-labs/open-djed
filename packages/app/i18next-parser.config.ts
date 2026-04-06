import { languages } from "@/i18n/settings"

export default {
  locales: languages,
  output: "messages/$LOCALE/translations.json",
  input: ["src/**/*.{ts,tsx}"],

  namespaceSeparator: false,
  keySeparator: ".",
  keepRemoved: false,

  defaultValue: "",

  lexers: {
    tsx: [
      {
        lexer: "JsxLexer",
        functions: ["t", "t.rich"],
      },
    ],
    ts: [
      {
        lexer: "JavascriptLexer",
        functions: ["t", "t.rich"],
      },
    ],
  },
}
