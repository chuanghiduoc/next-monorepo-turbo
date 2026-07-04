import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "turbo/starter — Next.js monorepo boilerplate",
    short_name: "turbo/starter",
    description: "Production-grade Next.js 16 + Turborepo monorepo starter.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  }
}
