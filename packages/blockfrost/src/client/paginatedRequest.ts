import type { RetryOptions } from "../types/retry.types"
import type { PaginationOptions } from "../types/pagination.types"
import type { RequestBuilder } from "./requestBuilder"

export class PaginatedRequest<T> {
  private retryOptions: RetryOptions = {}

  constructor(
    private readonly fetchPage: (page: number, count: number) => RequestBuilder<T[]>,
    private readonly globalRetry: RetryOptions = {},
  ) {}

  retry(options: RetryOptions): this {
    this.retryOptions = options
    return this
  }

  async allPages(options: PaginationOptions<T> = {}): Promise<T[]> {
    const { count = 100, maxPages = Infinity, filter, stopWhen, stopAfter } = options
    const results: T[] = []
    let page = 1

    while (page <= maxPages) {
      const data = await this.fetchPage(page, count)
        .retry(this.retryOptions)
        .fetch()

      if (data.length === 0) break

      for (const item of data) {
        if (stopWhen?.(item)) return results
        if (!filter || filter(item)) results.push(item)
        if (stopAfter?.(item)) return results
      }

      if (data.length < count) break
      page++
    }

    return results
  }

  then<R>(resolve: (data: T[]) => R, reject?: (err: unknown) => R) {
    return this.allPages().then(resolve, reject)
  }
}