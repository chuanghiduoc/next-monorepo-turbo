import type { MetadataRoute } from "next"

import { env } from "@/lib/env"
import { routing } from "@/i18n/routing"

// Public, indexable routes on the marketing surface — one entry per locale.
const PATHS = ["", "/preview"] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_APP_URL

  return routing.locales.flatMap((locale) =>
    PATHS.map((path) => ({
      url: `${base}/${locale}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.6,
    }))
  )
}
