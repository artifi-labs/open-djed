import ErrorPage from "@/components/ErroPage"
import PageFade from "@/components/PageFade"
import { APP_NAME } from "@/lib/constants"
import { env } from "@/lib/envLoader"
import { type Metadata } from "next"
import { useTranslations } from "next-intl"

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | Page Not Found`,
    template: `%s | ${APP_NAME}`,
  },
  openGraph: {
    title: `${APP_NAME} | Page Not Found`,
    images: [
      {
        url: `${env.BASE_URL}/logos/artifi_banner.png`,
        width: 512,
        height: 512,
        alt: `${APP_NAME} | Page Not Found`,
      },
    ],
  },
  twitter: {
    title: `${APP_NAME} | Page Not Found`,
  },
}

export default function NotFoundPage() {
  const t = useTranslations()

  return (
    <main className="relative flex w-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full">
        <picture>
          <source
            srcSet="/backgrounds/not-found/illustration-mobile.svg"
            media="(max-width: 767px)"
          />
          <img
            src="/backgrounds/not-found/illustration-desktop.svg"
            alt="404 illustration"
            className="h-full w-full object-cover"
          />
        </picture>
      </div>

      <PageFade>
        <ErrorPage
          statusCode={404}
          title={t("notFound.title")}
          subtitle={t("notFound.subtitle")}
          buttonText={t("notFound.buttonText")}
          buttonHref="/"
        />
      </PageFade>
    </main>
  )
}
