import createMiddleware from "next-intl/middleware"
import { routing } from "@/i18n/routing"

export default createMiddleware(routing)

export const config = {
  // match all paths except for the ones starting with
  // - api, _next/static, _next/image, and some common files like favicon.ico, sitemap.xml, and robots.txt
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)",
  ],
}
