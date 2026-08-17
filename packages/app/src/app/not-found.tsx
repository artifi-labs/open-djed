import ErrorPage from "@/components/ErroPage"
import PageFade from "@/components/PageFade"
import { APP_NAME } from "@/lib/constants"
import { env } from "@/lib/envLoader"
import { buildOpenGraph, buildTwitter } from "@/lib/metadata"
import { type Metadata } from "next"

const title = `${APP_NAME} | Page Not Found`
const description = `The page you're looking for doesn't exist.`

export const metadata: Metadata = {
  title: {
    default: title,
    template: `%s | ${APP_NAME}`,
  },
  description,
  robots: { index: false, follow: true },
  openGraph: buildOpenGraph({ title, description, url: env.BASE_URL }),
  twitter: buildTwitter({ title, description }),
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
            src="/backgrounds/not-found/illustration-desktop.svg"
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
