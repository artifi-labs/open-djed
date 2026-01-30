import { APP_NAME } from "./constants"
import { env } from "./envLoader"

/**
 * Builds a consistent document title based on the current network and app name.
 *
 * Format:
 * - Mainnet: "{page} | {APP_NAME}"
 * - Other networks: "{page} | {NETWORK} {APP_NAME}"
 *
 * If no page is provided, returns only the suffix.
 *
 * @param page - Optional page name to prepend to the title
 * @returns A formatted document title string
 */
export function buildTitle(page?: string) {
  const { NETWORK } = env

  const suffix = NETWORK === "Mainnet" ? APP_NAME : `${NETWORK} ${APP_NAME}`

  return page ? `${page} | ${suffix}` : suffix
}
