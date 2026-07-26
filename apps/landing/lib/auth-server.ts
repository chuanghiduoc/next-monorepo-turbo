import "server-only"

import { headers } from "next/headers"
import { cache } from "react"

import { env } from "@/lib/env"
import { logger } from "@/lib/logger"
import { isPreviewAuth } from "@/lib/session-cookie"

interface Session {
  user: {
    id: string
    email: string
    name?: string
    image?: string | null
  }
  session: {
    id: string
    expiresAt: string
  }
}

/**
 * Design-preview session used only when PREVIEW_AUTH=1. Lets you browse the
 * authenticated app/admin surfaces without a running backend. Off by default.
 */
const PREVIEW_SESSION: Session = {
  user: {
    id: "preview-user",
    email: "preview@turbo.local",
    name: "Preview User",
  },
  session: {
    id: "preview-session",
    expiresAt: "2099-01-01T00:00:00.000Z",
  },
}

const UNAUTHORIZED = 401

/**
 * Server-side session lookup. Skips the public proxy and talks to the backend
 * directly — we're already on the server, so no extra hop needed.
 *
 * Wrapped in React.cache() so multiple RSCs in the same request share a single
 * backend round-trip instead of each re-fetching the session.
 *
 * Returns null on any failure so the caller redirects to sign-in, but a failure
 * that is not a plain 401 is logged — a broken auth backend must not look
 * identical to a signed-out visitor in the logs.
 */
export const getServerSession = cache(async (): Promise<Session | null> => {
  if (isPreviewAuth()) return PREVIEW_SESSION

  const cookie = (await headers()).get("cookie") ?? ""

  try {
    const res = await fetch(`${env.BACKEND_URL}/api/auth/get-session`, {
      method: "GET",
      headers: {
        cookie,
        accept: "application/json",
      },
      cache: "no-store",
    })

    if (!res.ok) {
      if (res.status !== UNAUTHORIZED) {
        logger.warn({ status: res.status }, "session lookup rejected")
      }
      return null
    }

    const data = (await res.json()) as Session | null
    return data?.user ? data : null
  } catch (error) {
    logger.error({ err: error }, "session lookup failed")
    return null
  }
})
