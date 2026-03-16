import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"

const intlMiddleware = createMiddleware(routing)

export function middleware(request: Parameters<typeof intlMiddleware>[0]) {
  return intlMiddleware(request)
}

export const config = {
  // match all paths except for the ones starting with
  // - /api, /_next/static, /_next/image, and some common static file extensions
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
}
