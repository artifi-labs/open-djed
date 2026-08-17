import { getLocale } from "next-intl/server"
import { fallbackLng, languages } from "@/i18n/settings"
import { APP_NAME, TWITTER_HANDLE } from "./constants"
import { env } from "./envLoader"

/**
 * Builds a consistent document title based on the current network and app name.
 *
 * Format:
 * - Mainnet: "{page} | {APP_NAME}"
 * - Other networks: "{page} | {NETWORK} {APP_NAME}"
 *
 * If no page is provided, returns only the suffix.
 *
 * @param page - Optional page name to prepend to the title
 * @returns A formatted document title string
 */
export function buildTitle(page?: string) {
  const { NETWORK } = env

  const suffix = NETWORK === "Mainnet" ? APP_NAME : `${NETWORK} ${APP_NAME}`

  return page ? `${page} | ${suffix}` : suffix
}

export const OG_LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  pt: "pt_PT",
  es: "es_ES",
  fr: "fr_FR",
  de: "de_DE",
  ja: "ja_JP",
  cn: "zh_CN",
}

export const SOCIAL_IMAGE = {
  url: "/logos/opendjed-banner.png",
  width: 1200,
  height: 853,
  alt: `${APP_NAME} Banner`,
}

function localizedUrl(locale: string, path: string) {
  const prefix = locale === fallbackLng ? "" : `/${locale}`
  return `${env.BASE_URL}${prefix}${path}`
}

export async function buildAlternates(path = "") {
  const locale = await getLocale()

  return {
    canonical: localizedUrl(locale, path),
    languages: {
      ...Object.fromEntries(
        languages.map((lng) => [lng, localizedUrl(lng, path)]),
      ),
      "x-default": localizedUrl(fallbackLng, path),
    },
  }
}

export function buildOpenGraph({
  title,
  description,
  url,
  locale = OG_LOCALE_MAP[fallbackLng],
}: {
  title: string
  description: string
  url: string
  locale?: string
}) {
  return {
    type: "website" as const,
    title,
    description,
    url,
    siteName: APP_NAME,
    images: [SOCIAL_IMAGE],
    locale,
  }
}

export function buildTwitter({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return {
    card: "summary_large_image" as const,
    title,
    description,
    images: [SOCIAL_IMAGE.url],
    creator: TWITTER_HANDLE,
    site: TWITTER_HANDLE,
  }
}
