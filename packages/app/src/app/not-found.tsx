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
    <main className="flex w-full flex-1 flex-col">
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
