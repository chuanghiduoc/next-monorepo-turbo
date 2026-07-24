// Header plumbing for the same-origin BFF proxy (`app/api/[...path]/route.ts`).
// Kept framework-free and side-effect-free so it is unit-testable in isolation.

// Connection-scoped headers must never be forwarded across a proxy hop (RFC 9110 §7.6.1).
// `content-length` and `host` are recomputed by the fetch/runtime for the new hop, so relaying
// the inbound values would describe the wrong message.
export const HOP_BY_HOP_HEADERS = new Set([
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

/**
 * Build the header set sent from the proxy to the backend.
 *
 * The client's `accept-encoding` is deliberately replaced with `identity` instead of being
 * forwarded. Reason: this proxy relies on `fetch` transparently decompressing the upstream body,
 * but `fetch` (undici) only does so when IT chose the `accept-encoding`. Forwarding the browser's
 * `gzip, deflate, br, zstd` makes decompression caller-controlled and version-dependent — on some
 * undici builds the body then arrives still compressed while the `content-encoding` header is
 * stripped downstream, so the dev/standalone server re-compresses already-compressed bytes and the
 * browser fails with a decoding error. Asking the backend for an uncompressed (`identity`) body
 * removes that hidden decode step entirely; the Next server still compresses the proxy→browser hop.
 */
export function filterRequestHeaders(headers: Headers): Headers {
  const out = new Headers()
  headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) out.set(key, value)
  })
  out.set("accept-encoding", "identity")
  return out
}

/**
 * Build the header set relayed from the backend back to the client.
 *
 * `content-encoding` is dropped because `fetch` has already decoded the body: leaving the header
 * would make the browser decode a second time and fail with ERR_CONTENT_DECODING_FAILED. This holds
 * even with `identity` requested — a proxy/CDN in front of the backend may still compress.
 */
export function filterResponseHeaders(headers: Headers): Headers {
  const out = new Headers()
  headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    // Same-origin BFF: never relay the backend's CORS headers to the client.
    if (HOP_BY_HOP_HEADERS.has(lower) || lower.startsWith("access-control-")) {
      return
    }
    if (lower === "content-encoding") {
      return
    }
    out.append(key, value)
  })
  return out
}
