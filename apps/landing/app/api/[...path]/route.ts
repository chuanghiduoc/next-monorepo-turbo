import { NextResponse, type NextRequest } from "next/server"

import { env } from "@/lib/env"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "content-length",
  "host",
])

function buildTargetUrl(request: NextRequest, segments: string[]): string {
  const path = segments.join("/")
  const search = request.nextUrl.search
  return `${env.BACKEND_URL}/api/${path}${search}`
}

function filterRequestHeaders(headers: Headers): Headers {
  const out = new Headers()
  headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) out.set(key, value)
  })
  return out
}

function filterResponseHeaders(headers: Headers): Headers {
  const out = new Headers()
  headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) out.append(key, value)
  })
  return out
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params
  const target = buildTargetUrl(request, path)
  // Log only the sanitized upstream path — never the backend host or query
  // string, which may carry internal topology and PII.
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
