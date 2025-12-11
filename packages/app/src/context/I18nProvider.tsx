'use client'

import { I18nextProvider } from 'react-i18next'
import i18n from '../../i18n'
import { useEffect, useState } from 'react'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsInitialized(true)
    } else {
      i18n.on('initialized', () => {
        setIsInitialized(true)
      })
    }

    return () => {
      i18n.off('initialized')
    }
  }, [])

  if (!isInitialized) {
    return null
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
