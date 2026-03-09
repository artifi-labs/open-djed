import { fallbackLng, lookupLocalStorage } from "./settings"
import { cookies } from "next/headers"
import type translation from "../../locales/en/translation.json"

export type Dictionary = typeof translation

export async function getServerLocale() {
  const cookieStore = await cookies()
  return cookieStore.get(lookupLocalStorage)?.value ?? fallbackLng
}

export async function getDictionary(): Promise<Dictionary> {
  const lang = await getServerLocale()
  return import(`../../locales/${lang}/translation.json`).then(m => m.default)
}