import ErrorPage from "@/components/new-components/ErroPage"
import PageFade from "@/components/new-components/PageFade"

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
