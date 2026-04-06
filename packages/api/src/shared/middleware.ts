import TTLCache from "@isaacs/ttlcache"
import { createMiddleware } from "hono/factory"

//NOTE: We only need this cache for transactions, not for other requests. Using this for `protocol-data` sligltly increases the response time.
const requestCache = new TTLCache<string, { value: Response; expiry: number }>({
  ttl: 10_000,
})

export const cacheMiddleware = createMiddleware(async (c, next) => {
  const cacheKey = `${c.req.url}:${JSON.stringify(await c.req.json().catch(() => null))}`
  const cachedResponse = requestCache.get(cacheKey)

  if (cachedResponse && cachedResponse.expiry > Date.now()) {
    const { value } = cachedResponse
    const clonedBody = await value.clone().text()
    c.res = new Response(clonedBody, {
      headers: value.headers,
      status: value.status,
      statusText: value.statusText,
    })
    return
  }

  await next()

  const clonedResponse = c.res.clone()
  const clonedBody = await clonedResponse.text()
  requestCache.set(cacheKey, {
    value: new Response(clonedBody, {
      headers: clonedResponse.headers,
      status: clonedResponse.status,
      statusText: clonedResponse.statusText,
    }),
    expiry: Date.now() + 10_000,
  })
})
