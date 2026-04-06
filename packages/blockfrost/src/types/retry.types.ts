export interface RetryOptions {
  attempts?: number
  timeout?: number
  onRetry?: (error: unknown, attempt: number) => void
}
