import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

import "./lib/env"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@workspace/ui", "@workspace/api-client"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@workspace/ui"],
  },
}

export default withNextIntl(nextConfig)
