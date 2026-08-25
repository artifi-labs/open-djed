import ErrorPage from "@/components/ErroPage"
import PageFade from "@/components/PageFade"
import { env } from "@/lib/envLoader"
import { ERROR_PAGES } from "@/lib/errorPages"
import { buildOpenGraph, buildTitle, buildTwitter } from "@/lib/metadata"
import type { Metadata } from "next"
import { useTranslations } from "next-intl"
import { getTranslations } from "next-intl/server"

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

export default function NotFoundPage() {
  const t = useTranslations()

  const statusCode = 404

  const subtitle = `${t(ERROR_PAGES[statusCode].content.content1Key)}\n${t(ERROR_PAGES[statusCode].content.content2Key)}`

  return (
    <main className="relative flex w-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full">
        <picture>
          <source
            srcSet={ERROR_PAGES[statusCode].illustration.mobile.src}
            media="(max-width: 767px)"
          />
          <img
            src={ERROR_PAGES[statusCode].illustration.desktop.src}
            alt={`${statusCode} ${t("common.illustration")}`}
            className="h-full w-full object-cover"
          />
        </picture>
      </div>

      <PageFade>
        <ErrorPage
          statusCode={statusCode}
          title={t(ERROR_PAGES[statusCode].titleKey)}
          subtitle={subtitle}
          buttonText={t(ERROR_PAGES[statusCode].button.textKey)}
          buttonHref={ERROR_PAGES[statusCode].button.href}
        />
      </PageFade>
    </main>
  )
}
