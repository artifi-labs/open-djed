import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const network = process.env.NEXT_PUBLIC_NETWORK
  const config = process.env.NEXT_PUBLIC_CONFIG
    ? JSON.parse(process.env.NEXT_PUBLIC_CONFIG)
    : {}

  const baseUrl = (network && config[network]) || "http://localhost:3000"
  const lastModified = new Date()

  return [
    // Homepage
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },

    // Orders Page
    {
      url: `${baseUrl}/orders`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },

    // Terms of Service
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.3,
    },

    // Privacy Policy
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.3,
    },
  ]
}
