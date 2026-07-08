import type { NextRequest } from "next/server"

const SESSION_COOKIE_PREFIX = "better-auth"

// Presence check only, not validity — a cheap edge gate with no backend
// round-trip. The backend is the authoritative auth layer (optimistic-at-edge,
// strict-in-data-layer, per Next.js guidance). A forged cookie name passes here
// but is rejected upstream.
export function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.startsWith(SESSION_COOKIE_PREFIX) && c.name.includes("session")
    )
}

// Dev-only auth bypass; hard-guarded so a stray PREVIEW_AUTH=1 in production
// never disables the gate.
export function isPreviewAuth(): boolean {
  return (
    process.env.PREVIEW_AUTH === "1" && process.env.NODE_ENV !== "production"
  )
}
