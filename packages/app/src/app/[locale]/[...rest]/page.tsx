import { ERROR_PAGES } from "@/lib/errorPages"
import { buildOpenGraph, buildTitle, buildTwitter } from "@/lib/metadata"
import { env } from "@/lib/envLoader"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  const statusCode = 404
  const pageTitle = t(ERROR_PAGES[statusCode].pageTitleKey)
  const title = buildTitle(pageTitle)
  const description = t("notFound.metadata.pageDescription")

  return {
    title,
    description,
    robots: { index: false, follow: true },
    openGraph: buildOpenGraph({ title, description, url: env.BASE_URL }),
    twitter: buildTwitter({ title, description }),
  }
}

// This page is a catch-all for any routes that don't match existing pages or locales.
export default function CatchAllPage() {
  notFound()
}
