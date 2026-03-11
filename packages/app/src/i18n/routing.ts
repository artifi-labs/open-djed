import { defineRouting } from 'next-intl/routing'
import { fallbackLng, languages, LOOKUP_I8N_LOCAL_STORAGE } from '@/i18n/settings'

export const routing = defineRouting({
  locales: languages,
  defaultLocale: fallbackLng,
  localePrefix: 'as-needed',
  localeCookie: {
    name: LOOKUP_I8N_LOCAL_STORAGE,
  }
})