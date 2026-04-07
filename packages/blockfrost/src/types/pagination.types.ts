export interface PaginationOptions<T> {
  count?: number
  maxPages?: number
  filter?: (item: T) => boolean
  stopWhen?: (item: T) => boolean
  stopAfter?: (item: T) => boolean
}
