import type { MetadataRoute } from "next"

// Authenticated product surface — keep the whole app out of search indexes.
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } }
}
