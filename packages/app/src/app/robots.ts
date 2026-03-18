import { env } from "@/lib/envLoader"
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const { BASE_URL } = env

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/_next/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
