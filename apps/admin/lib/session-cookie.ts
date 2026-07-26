import type { NextRequest } from "next/server"

const SESSION_COOKIE_PREFIX = "better-auth"

// Better Auth prepends `__Secure-` (and `__Host-` for host-locked cookies) once
// the app runs over HTTPS, so the raw cookie name in production is
// `__Secure-better-auth.session_token`. Matching the bare prefix alone would
// reject every authenticated request as soon as the app is served over TLS.
const COOKIE_NAME_PREFIXES = ["__Secure-", "__Host-"]

function stripCookiePrefix(name: string): string {
  for (const prefix of COOKIE_NAME_PREFIXES) {
    if (name.startsWith(prefix)) return name.slice(prefix.length)
  }
  return name
}

// Presence check only, not validity — a cheap edge gate with no backend
// round-trip. The backend is the authoritative auth layer (optimistic-at-edge,
// strict-in-data-layer, per Next.js guidance). A forged cookie name passes here
// but is rejected upstream.
export function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => {
    const name = stripCookiePrefix(cookie.name)
    return name.startsWith(SESSION_COOKIE_PREFIX) && name.includes("session")
  })
}

// Dev-only auth bypass; hard-guarded so a stray PREVIEW_AUTH=1 in production
// never disables the gate.
export function isPreviewAuth(): boolean {
  return (
    process.env.PREVIEW_AUTH === "1" && process.env.NODE_ENV !== "production"
  )
}
