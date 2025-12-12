import type { NextConfig } from 'next'

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
      type: 'webassembly/async',
    })

    return config
  },
}

export default nextConfig

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
// eslint-disable-next-line @typescript-eslint/no-floating-promises
initOpenNextCloudflareForDev()
