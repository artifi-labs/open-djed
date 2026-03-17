import type { RetryOptions } from "../types/retry.types"
import { BlockfrostError } from "../errors/blockfrost.error"

export class RequestBuilder<T> {
  private retryOptions: RetryOptions = {}

  constructor(
    private readonly execute: (signal: AbortSignal) => Promise<T>,
    private readonly globalRetry: RetryOptions = {},
  ) {}

  retry(options: RetryOptions): this {
    this.retryOptions = options
    return this
  }

  async fetch(): Promise<T> {
    const { attempts = 1, timeout = 10_000, onRetry } = { ...this.globalRetry, ...this.retryOptions }

    let lastError: unknown

    for (let attempt = 1; attempt <= attempts; attempt++) {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeout)

      try {
        return await this.execute(controller.signal)
      } catch (error) {
        lastError = error

        if (error instanceof BlockfrostError && error.status === 500) throw error

        if (attempt < attempts) {
          onRetry?.(error, attempt)
        }
      } finally {
        clearTimeout(timer)
      }
    }

    throw lastError
  }

  then<R>(resolve: (data: T) => R, reject?: (err: unknown) => R) {
    return this.fetch().then(resolve, reject)
  }
}