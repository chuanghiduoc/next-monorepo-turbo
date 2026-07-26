import type { NextRequest } from "next/server"
import { afterEach, describe, expect, it, vi } from "vitest"

import { hasSessionCookie, isPreviewAuth } from "@/lib/session-cookie"

/**
 * Minimal stand-in for the slice of NextRequest the gate reads. Building a real
 * NextRequest would drag in the whole edge runtime for two field accesses.
 */
function requestWithCookies(names: string[]): NextRequest {
  return {
    cookies: {
      getAll: () => names.map((name) => ({ name, value: "x" })),
    },
  } as unknown as NextRequest
}

describe("hasSessionCookie", () => {
  it("accepts the plain development cookie name", () => {
    expect(
      hasSessionCookie(requestWithCookies(["better-auth.session_token"]))
    ).toBe(true)
  })

  // Regression: Better Auth prefixes cookies with `__Secure-` over HTTPS, so
  // matching the bare name rejected every authenticated production request.
  it("accepts the __Secure- prefixed cookie used over HTTPS", () => {
    expect(
      hasSessionCookie(
        requestWithCookies(["__Secure-better-auth.session_token"])
      )
    ).toBe(true)
  })

  it("accepts the __Host- prefixed cookie", () => {
    expect(
      hasSessionCookie(requestWithCookies(["__Host-better-auth.session_token"]))
    ).toBe(true)
  })

  it("accepts a chunked session cookie", () => {
    expect(
      hasSessionCookie(
        requestWithCookies(["__Secure-better-auth.session_token-0"])
      )
    ).toBe(true)
  })

  it("ignores unrelated cookies", () => {
    expect(
      hasSessionCookie(requestWithCookies(["sidebar_state", "NEXT_LOCALE"]))
    ).toBe(false)
  })

  it("ignores a better-auth cookie that is not session-scoped", () => {
    expect(
      hasSessionCookie(requestWithCookies(["better-auth.dont_remember"]))
    ).toBe(false)
  })

  it("returns false when no cookies are present", () => {
    expect(hasSessionCookie(requestWithCookies([]))).toBe(false)
  })
})

describe("isPreviewAuth", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("is enabled outside production when PREVIEW_AUTH=1", () => {
    vi.stubEnv("PREVIEW_AUTH", "1")
    vi.stubEnv("NODE_ENV", "development")
    expect(isPreviewAuth()).toBe(true)
  })

  it("stays disabled in production even with PREVIEW_AUTH=1", () => {
    vi.stubEnv("PREVIEW_AUTH", "1")
    vi.stubEnv("NODE_ENV", "production")
    expect(isPreviewAuth()).toBe(false)
  })

  it("is disabled when the flag is unset", () => {
    vi.stubEnv("PREVIEW_AUTH", undefined)
    vi.stubEnv("NODE_ENV", "development")
    expect(isPreviewAuth()).toBe(false)
  })
})
