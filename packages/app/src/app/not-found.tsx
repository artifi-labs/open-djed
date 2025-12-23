import ErrorPage from "@/components/ErroPage"
import PageFade from "@/components/PageFade"
import { OPEN_DJED_URL, APP_NAME } from "@/lib/constants"
import { type Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} | Page Not Found`,
    template: `%s | ${APP_NAME}`,
  },
  openGraph: {
    title: `${APP_NAME} | Page Not Found`,
    images: [
      {
        url: `${OPEN_DJED_URL}/logos/artifi_banner.png`,
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

export default function NotFound() {
  return (
    <main className="relative flex w-full flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full">
        <picture>
          <source
            srcSet="/backgrounds/not-found/illustration-mobile.svg"
            media="(max-width: 767px)"
          />
          <img
            src="/backgrounds/not-found/illustration.svg"
            alt="404 illustration"
            className="h-full w-full object-cover"
          />
        </picture>
      </div>

      <PageFade>
        <ErrorPage
          statusCode={404}
          title="Lost in the blockchain void"
          subtitle={`This page has drifted off the network.\nLet's reconnect you to the main chain`}
          buttonText="Return Home"
          buttonHref="/"
        />
      </PageFade>
    </main>
  )
}
