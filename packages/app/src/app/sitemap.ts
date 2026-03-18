import { env } from "@/lib/envLoader"
import { type MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const { BASE_URL } = env

  const routes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/orders", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/simulator", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/analytics", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/terms", priority: 0.4, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "monthly" as const },
  ]

  const lastModified = new Date("2026-03-16")

  return routes.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: {
      languages: {
        en: `${BASE_URL}${route.path}`,
        pt: `${BASE_URL}/pt${route.path}`,
      },
    },
  }))
}
