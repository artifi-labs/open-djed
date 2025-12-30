import { env } from "@/lib/envLoader"
import { type MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = env.BASE_URL

  return [
    {
      url: baseUrl,
      lastModified: new Date("2024-12-24"),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/orders`,
      lastModified: new Date("2024-12-24"),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date("2024-12-24"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2024-12-24"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]
}
