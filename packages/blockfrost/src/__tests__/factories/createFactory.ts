export function createFactory<T>(defaults: T) {
  return (overrides: Partial<T> = {}): T => ({ ...defaults, ...overrides })
}
