import posthog from "posthog-js"
import { env } from "@/lib/envLoader"

if (env.POSTHOG_API_KEY) {
  posthog.init(env.POSTHOG_API_KEY, {
    api_host: env.POSTHOG_HOST,
    persistence: "memory",
    autocapture: false,
    capture_pageview: "history_change",
    disable_session_recording: true,
    capture_exceptions: true,
  })
}
