import {
  APP_NAME,
  TEAM_NAME,
  WEBSITE_URL,
  TWITTER_URL,
  GITHUB_URL,
} from "@/lib/constants"
import { env } from "@/lib/envLoader"

export default function StructuredData() {
  const { BASE_URL } = env

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: TEAM_NAME,
    url: WEBSITE_URL,
    logo: `${BASE_URL}/logos/artifilabs-logo.svg`,
    sameAs: [TWITTER_URL, GITHUB_URL],
  }

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_NAME,
    url: BASE_URL,
    description:
      "Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.",
    publisher: {
      "@type": "Organization",
      name: TEAM_NAME,
    },
  }

  const softwareApplicationData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    operatingSystem: "Web",
    applicationCategory: "FinanceApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Mint and burn DJED, Cardano's overcollateralized stablecoin, with our open-source platform. Transparent alternative to DJED.xyz - accessible 24/7 anywhere.",
    url: BASE_URL,
    author: {
      "@type": "Organization",
      name: TEAM_NAME,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationData),
        }}
      />
    </>
  )
}
