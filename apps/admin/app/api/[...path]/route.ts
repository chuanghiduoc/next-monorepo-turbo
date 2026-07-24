import { NextResponse, type NextRequest } from "next/server"

import { env } from "@/lib/env"
import { logger } from "@/lib/logger"
import {
  filterRequestHeaders,
  filterResponseHeaders,
} from "@/lib/proxy-headers"
import { hasSessionCookie, isPreviewAuth } from "@/lib/session-cookie"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Reachable without a session — auth endpoints, or nobody could ever log in.
const PUBLIC_API_PREFIXES = new Set(["auth"])

function isPublicPath(segments: string[]): boolean {
  return segments.length > 0 && PUBLIC_API_PREFIXES.has(segments[0]!)
}

function buildTargetUrl(request: NextRequest, segments: string[]): string {
  const path = segments.join("/")
  const search = request.nextUrl.search
  return `${env.BACKEND_URL}/api/${path}${search}`
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params

  // Same-origin requests need no cross-origin preflight; answer OPTIONS locally.
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204 })
  }

  // Optimistic edge gate (no backend round-trip): reject requests with no session
  // cookie so the proxy is not an open relay. The backend does the authoritative
  // check. Public auth endpoints are exempt (audit C-01).
  if (!isPublicPath(path) && !isPreviewAuth() && !hasSessionCookie(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const target = buildTargetUrl(request, path)
  // Sanitized path only — never log the backend host or query string (PII).
  const logPath = `/api/${path.join("/")}`

  const method = request.method
  const init: RequestInit = {
    method,
    headers: filterRequestHeaders(request.headers),
    redirect: "manual",
  }

  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.arrayBuffer()
    if ((init.body as ArrayBuffer).byteLength === 0) init.body = undefined
  }

  const startedAt = Date.now()
  let upstream: Response
  try {
    upstream = await fetch(target, init)
  } catch (error) {
    logger.error({ path: logPath, method, err: error }, "proxy upstream failed")
    return NextResponse.json({ message: "Bad gateway" }, { status: 502 })
  }

  logger.debug(
    {
      path: logPath,
      method,
      status: upstream.status,
      durationMs: Date.now() - startedAt,
    },
    "proxy"
  )

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: filterResponseHeaders(upstream.headers),
  })
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as OPTIONS,
  proxy as HEAD,
}
