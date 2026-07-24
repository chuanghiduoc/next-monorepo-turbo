import { describe, expect, it } from "vitest"

import {
  filterRequestHeaders,
  filterResponseHeaders,
  HOP_BY_HOP_HEADERS,
} from "@/lib/proxy-headers"

describe("filterRequestHeaders", () => {
  it("forces accept-encoding to identity so the backend returns an uncompressed body", () => {
    const input = new Headers({ "accept-encoding": "gzip, deflate, br, zstd" })

    expect(filterRequestHeaders(input).get("accept-encoding")).toBe("identity")
  })

  it("sets identity even when the client sends no accept-encoding", () => {
    expect(filterRequestHeaders(new Headers()).get("accept-encoding")).toBe(
      "identity"
    )
  })

  it("strips hop-by-hop and length/host headers", () => {
    const input = new Headers({
      connection: "keep-alive",
      "transfer-encoding": "chunked",
      "content-length": "42",
      host: "example.com",
      te: "trailers",
      upgrade: "websocket",
    })

    const out = filterRequestHeaders(input)

    for (const header of [
      "connection",
      "transfer-encoding",
      "content-length",
      "host",
      "te",
      "upgrade",
    ]) {
      expect(out.has(header)).toBe(false)
    }
  })

  it("preserves ordinary forwarded headers", () => {
    const input = new Headers({
      cookie: "session=abc",
      "content-type": "application/json",
      authorization: "Bearer token",
    })

    const out = filterRequestHeaders(input)

    expect(out.get("cookie")).toBe("session=abc")
    expect(out.get("content-type")).toBe("application/json")
    expect(out.get("authorization")).toBe("Bearer token")
  })

  it("does not mutate the input headers", () => {
    const input = new Headers({ "accept-encoding": "gzip" })

    filterRequestHeaders(input)

    expect(input.get("accept-encoding")).toBe("gzip")
  })
})

describe("filterResponseHeaders", () => {
  it("drops content-encoding so the browser does not double-decode", () => {
    const input = new Headers({
      "content-encoding": "gzip",
      "content-type": "application/json",
    })

    const out = filterResponseHeaders(input)

    expect(out.has("content-encoding")).toBe(false)
    expect(out.get("content-type")).toBe("application/json")
  })

  it("drops content-encoding regardless of header casing", () => {
    const input = new Headers()
    input.append("Content-Encoding", "br")

    expect(filterResponseHeaders(input).has("content-encoding")).toBe(false)
  })

  it("drops CORS headers on the same-origin BFF", () => {
    const input = new Headers({
      "access-control-allow-origin": "*",
      "access-control-allow-credentials": "true",
    })

    const out = filterResponseHeaders(input)

    expect(out.has("access-control-allow-origin")).toBe(false)
    expect(out.has("access-control-allow-credentials")).toBe(false)
  })

  it("drops hop-by-hop headers", () => {
    const input = new Headers({
      "transfer-encoding": "chunked",
      connection: "keep-alive",
      "content-length": "42",
    })

    const out = filterResponseHeaders(input)

    expect(out.has("transfer-encoding")).toBe(false)
    expect(out.has("connection")).toBe(false)
    expect(out.has("content-length")).toBe(false)
  })

  it("relays a Set-Cookie header from the backend", () => {
    const input = new Headers({
      "set-cookie": "session=xyz; HttpOnly; Path=/",
    })

    expect(filterResponseHeaders(input).get("set-cookie")).toContain(
      "session=xyz"
    )
  })
})

describe("HOP_BY_HOP_HEADERS", () => {
  it("covers the connection-scoped and length/host headers", () => {
    for (const header of [
      "connection",
      "keep-alive",
      "transfer-encoding",
      "upgrade",
      "content-length",
      "host",
    ]) {
      expect(HOP_BY_HOP_HEADERS.has(header)).toBe(true)
    }
  })
})
