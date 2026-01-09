import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import {
  fallbackLng,
  languages,
  defaultNS,
  lookupLocalStorage,
} from "./settings"
import resourcesToBackend from "i18next-resources-to-backend"

const runsOnServerSide = typeof window === "undefined"

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`../../locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    debug: process.env.NODE_ENV === "development",
    lng: undefined,
    supportedLngs: languages,
    fallbackLng: fallbackLng,

    defaultNS: defaultNS,
    ns: ["translation"],
    preload: runsOnServerSide ? languages : [],

    returnEmptyString: false,
    returnNull: false,
    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: lookupLocalStorage,
    },
    react: {
      useSuspense: false,
    },
  })
  .catch((err) => {
    console.error("i18n initialization failed:", err)
  })
export default i18n
