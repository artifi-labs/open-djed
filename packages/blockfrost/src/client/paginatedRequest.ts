import type { PaginationOptions } from "../types/pagination.types"

export class PaginatedRequest<T> {
  constructor(
    private readonly fetch: (page: number, count: number) => Promise<T[]>,
  ) {}

  then<R>(resolve: (data: T[]) => R, reject?: (err: unknown) => R) {
    return this.fetch(1, 100).then(resolve, reject)
  }

  async allPages(options: PaginationOptions<T> = {}): Promise<T[]> {
    const { count = 100, maxPages = Infinity, filter, stopWhen, stopAfter } = options
    const results: T[] = []
    let page = 1

    while (page <= maxPages) {
      const data = await this.fetch(page, count)
      if (data.length === 0) break

      for (const item of data) {
        if (stopWhen?.(item)) return results
        if (!filter || filter(item)) results.push(item)
        if(stopAfter?.(item)) return results
      }

      if (data.length < count) break
      page++
    }

    return results
  }
}