import posthog from "posthog-js"
import { env } from "@/lib/envLoader"

export const captureEvent = (
  event: string,
  properties?: Record<string, unknown>,
) => {
  if (env.POSTHOG_API_KEY) {
    posthog.capture(event, properties)
  }
}
