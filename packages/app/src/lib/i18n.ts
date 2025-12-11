import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import resourcesToBackend from 'i18next-resources-to-backend'

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) => import(`../../public/locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    defaultNS: 'translation',
    ns: ['translation'],
  })
  .catch((err) => {
    console.error('i18n initialization failed:', err)
  })

export default i18n
