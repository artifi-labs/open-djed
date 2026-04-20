import { languages } from "@/i18n/settings"
import { env } from "@/lib/envLoader"
import { type MetadataRoute } from "next"

const routes = [
  { path: "", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/orders", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/simulator", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/analytics", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/privacy", priority: 0.2, changeFrequency: "monthly" as const },
  { path: "/terms", priority: 0.2, changeFrequency: "monthly" as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const { BASE_URL } = env

  return languages.flatMap((lang) => {
    const prefix = lang === "en" ? "" : `/${lang}`

    return routes.map((route) => ({
      url: `${BASE_URL}${prefix}${route.path}`,
      priority: route.priority,
      changeFrequency: route.changeFrequency,
    }))
  })
}
