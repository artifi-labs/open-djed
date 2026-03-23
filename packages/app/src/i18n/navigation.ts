import { createNavigation } from "next-intl/navigation"
import { fallbackLng, languages } from "./settings"

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales: languages,
  defaultLocale: fallbackLng,
})
