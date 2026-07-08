/**
 * The landing is a marketing surface; its CTAs send visitors to the user app.
 * Override per environment via NEXT_PUBLIC_APP_ORIGIN (defaults to app dev port).
 */
const APP_ORIGIN = process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000"

export function appHref(path: string): string {
  return `${APP_ORIGIN}${path}`
}
