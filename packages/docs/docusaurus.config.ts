import { themes as prismThemes } from "prism-react-renderer"
import type { Config } from "@docusaurus/types"
import type * as Preset from "@docusaurus/preset-classic"
import "dotenv/config"

const gaTrackingId = process.env.GA_TRACKING_ID
const gtmContainerId = process.env.GTM_CONTAINER_ID
const algoliaAppId = process.env.ALGOLIA_APP_ID
const algoliaSearchApiKey = process.env.ALGOLIA_SEARCH_API_KEY
const algoliaIndexName = process.env.ALGOLIA_INDEX_NAME

const config: Config = {
  title: "Open DJED Docs",
  tagline: "",
  favicon: "icons/opendjed-icon.svg",

  plugins: ["docusaurus-plugin-sass"],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://docs.djed.artifi.finance",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "@docusaurus/preset-classic",

      {
        ...(gaTrackingId
          ? {
              // Google Analytics
              gtag: {
                trackingID: gaTrackingId,
                anonymizeIP: true,
              },
            }
          : {}),
        ...(gtmContainerId
          ? {
              // Google Tag Manager
              googleTagManager: {
                containerId: gtmContainerId,
              },
            }
          : {}),
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
        },
        sitemap: {
          lastmod: "date",
          changefreq: "weekly",
          priority: 0.5,
          ignorePatterns: ["/tags/**"],
          filename: "sitemap.xml",
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params
            const items = await defaultCreateSitemapItems(rest)
            return items.filter((item) => !item.url.includes("/page/"))
          },
        },
      } satisfies Preset.Options,
    ],
  ],

  headTags: [
    {
      tagName: "script",
      attributes: {
        type: "application/ld+json",
      },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "Organization",
        name: "Artifi Labs",
        url: "https://docs.djed.artifi.finance",
        logo: "https://docs.djed.artifi.finance/icons/opendjed-icon.svg",
      }),
    },
  ],

  themeConfig: {
    metadata: [
      {
        name: "keywords",
        content:
          "djed, open djed, documentation, user guide, architecture, catalyst",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: "Open DJED Docs",
      logo: {
        alt: "Artifi Labs Logo",
        src: "icons/opendjed-icon.svg",
        href: "/",
      },
      items: [
        // Separator
        {
          type: "html",
          position: "right",
          value: `
            <div class="navbar__separator" aria-hidden=""></div>
          `,
        },
        // Social Links
        {
          type: "html",
          position: "right",
          value: `
            <div class="navbar__social-icons">
                <a href="https://github.com/artifi-labs" target="_blank" rel="noopener noreferrer"
                  class="navbar__icon-link navbar__icon-link--mask navbar__icon-link--github" aria-label="Github">
                </a>
                <a href="https://discord.gg/MhYP7w8n8p" target="_blank" rel="noopener noreferrer"
                  class="navbar__icon-link navbar__icon-link--mask navbar__icon-link--discord" aria-label="Discord">
                </a>
                <a href="https://x.com/artifi_labs" target="_blank" rel="noopener noreferrer"
                  class="navbar__icon-link navbar__icon-link--mask navbar__icon-link--x" aria-label="X">
                </a>
                <a href="https://www.linkedin.com/company/artifi-finance" target="_blank" rel="noopener noreferrer"
                  class="navbar__icon-link navbar__icon-link--mask navbar__icon-link--linkedin" aria-label="Linkedin">
                </a>
            </div>
          `,
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    ...(algoliaAppId && algoliaSearchApiKey && algoliaIndexName
      ? {
          algolia: {
            appId: algoliaAppId,
            apiKey: algoliaSearchApiKey,
            indexName: algoliaIndexName,
            // Optional: see doc section below
            contextualSearch: true,
          },
        }
      : {}),
  } satisfies Preset.ThemeConfig,
}

export default config
