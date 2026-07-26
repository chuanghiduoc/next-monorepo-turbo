import { describe, expect, it } from "vitest"

import { getSafeNext, splitLocale } from "@/lib/locale-path"

describe("splitLocale", () => {
  it("separates a locale prefix from the rest of the path", () => {
    expect(splitLocale("/en/settings")).toEqual({
      locale: "en",
      path: "/settings",
    })
  })

  it("maps a bare locale to the root path", () => {
    expect(splitLocale("/en")).toEqual({ locale: "en", path: "/" })
  })

  it("leaves an unprefixed path untouched", () => {
    expect(splitLocale("/settings")).toEqual({
      locale: null,
      path: "/settings",
    })
  })

  it("does not treat a path that merely starts with the locale letters as a prefix", () => {
    expect(splitLocale("/enterprise")).toEqual({
      locale: null,
      path: "/enterprise",
    })
  })
})

describe("getSafeNext", () => {
  it("keeps a same-origin path", () => {
    expect(getSafeNext("/settings")).toBe("/settings")
  })

  it("preserves the query string of the requested page", () => {
    expect(getSafeNext("/usage?tab=api")).toBe("/usage?tab=api")
  })

  // Regression: `useRouter` from `@/i18n/navigation` re-applies the locale
  // prefix, so returning `/en/settings` verbatim navigated to /en/en/settings.
  it("strips the locale prefix so the i18n router does not double it", () => {
    expect(getSafeNext("/en/settings")).toBe("/settings")
  })

  it.each([
    ["an absolute URL", "https://evil.com"],
    ["a protocol-relative URL", "//evil.com"],
    ["a backslash-escaped path", "/\\evil.com"],
    ["a relative path", "settings"],
  ])("falls back to the default target for %s", (_label, raw) => {
    expect(getSafeNext(raw)).toBe("/dashboard")
  })

  it("falls back to the default target when the param is absent", () => {
    expect(getSafeNext(null)).toBe("/dashboard")
  })
})
