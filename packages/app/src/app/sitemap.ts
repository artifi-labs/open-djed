import { env } from "@/lib/envLoader"
import { type MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const { BASE_URL } = env

  return [
    {
      url: BASE_URL,
      lastModified: new Date("2026-03-16"),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/orders`,
      lastModified: new Date("2026-03-16"),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/simulator`,
      lastModified: new Date("2026-03-16"),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/analytics`,
      lastModified: new Date("2026-03-16"),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date("2026-03-16"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date("2026-03-16"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]
}
