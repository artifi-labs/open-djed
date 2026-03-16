import { env } from "@/lib/envLoader"
import { ERROR_PAGES } from "@/lib/errorPages"
import { buildTitle } from "@/lib/metadata"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  const statusCode = 404
  const pageTitle = t(ERROR_PAGES[statusCode].pageTitleKey)
  const title = buildTitle(pageTitle)

  return {
    title,
    openGraph: {
      title,
      images: [
        {
          url: `${env.BASE_URL}/logos/artifi_banner.png`,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    twitter: {
      title,
    },
  }
}

// This page is a catch-all for any routes that don't match existing pages or locales.
export default function CatchAllPage() {
  notFound()
}
