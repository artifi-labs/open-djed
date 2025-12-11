'use client'

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ptTranslation from './locales/pt/translation.json'
import enTranslation from './locales/en/translation.json'

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      debug: process.env.NODE_ENV === 'development',

      ns: ['translation'],
      defaultNS: 'translation',

      supportedLngs: ['en', 'pt'],
      fallbackLng: 'en',
      returnEmptyString: false,
      returnNull: false,

      keySeparator: false,
      nsSeparator: false,

      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },

      resources: {
        en: {
          translation: enTranslation,
        },
        pt: {
          translation: ptTranslation,
        },
      },

      interpolation: {
        escapeValue: false,
      },

      react: {
        useSuspense: false,
      },

      parseMissingKeyHandler: (key) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation key: ${key}`)
        }
        return key
      },
    })
    .catch((error) => {
      console.error('Error initializing i18n:', error)
    })
}

export default i18n
