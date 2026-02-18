export type RequestOrderOptions = {
  order?: "asc" | "desc"
}

export type RequestRetryOptions = {
  retry?: number
  retryDelayMs?: number
}

export type RequestPaginationOptions = RequestRetryOptions & {
  count?: number
  page?: number
  maxPages?: number
  allPages?: boolean
}