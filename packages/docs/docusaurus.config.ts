import { themes as prismThemes } from "prism-react-renderer"
import type { Config } from "@docusaurus/types"
import type * as Preset from "@docusaurus/preset-classic"

const config: Config = {
  title: "Open DJED",
  tagline: "",
  favicon: "icons/favicon.png",

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
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
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

  themeConfig: {
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: "Open DJED Docs",
      logo: {
        alt: "Artifi Labs Logo",
        src: "icons/favicon.png",
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
  } satisfies Preset.ThemeConfig,
}

export default config
