import { logger } from "../../db/src/utils/logger"
import type { RequestRetryOptions } from "./types/types"

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))


export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  retries: number,
  delayMs: number
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)

      if (!response.ok) {
        if (response.status === 429) {
          const delay = delayMs * 2 ** i
          logger.warn(`Rate limited, waiting ${delay}ms...`)
          await sleep(delay)
          continue
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      if (!text || text.trim().length === 0) throw new Error("Empty response")

      return JSON.parse(text) as T
    } catch (error) {
      lastError = error as Error
      if (i === retries - 1) break
      const delay = delayMs * 2 ** i
      logger.error(error, `Attempt ${i + 1} failed, retrying in ${delay}ms...`)
      await sleep(delay)
    }
  }

  throw new Error(`All retry attempts failed. Last error: ${lastError?.message}`)
}

export async function fetchJSON<T>(
  url: string,
  options: RequestInit,
  retry?: Pick<RequestRetryOptions, "retry" | "retryDelayMs">
): Promise<T> {
  const retries = retry?.retry ?? 0
  const delayMs = retry?.retryDelayMs ?? 10_000

  if (retries > 0) return fetchWithRetry<T>(url, options, retries, delayMs)

  const res = await fetch(url, options)
  if (!res.ok) {
    logger.error(`Request failed: ${url}. Status: ${res.status}`)
    throw new Error(`Request failed: ${url}. Status: ${res.status}`)
  }

  return res.json() as Promise<T>
}
