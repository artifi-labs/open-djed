import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Enable WebAssembly
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }

    // Ensure wasm files are handled
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    })

    // SVG loader configuration

    // @ts-expect-error: fileLoaderRule exists
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg"),
    )

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ["@svgr/webpack"],
      },
    )

    fileLoaderRule.exclude = /\.svg$/i

    return config
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              icon: true,
            },
          },
        ],
        as: "*.js",
      },
    },
  },
}

export default nextConfig

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare"
// eslint-disable-next-line @typescript-eslint/no-floating-promises
initOpenNextCloudflareForDev()
