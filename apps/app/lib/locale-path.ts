import { routing, type Locale } from "@/i18n/routing"

// Framework-free path helpers shared by the middleware (`proxy.ts`) and the
// sign-in form. Kept side-effect-free so both the edge runtime and the browser
// bundle can import them, and so they are unit-testable in isolation.

const DEFAULT_POST_LOGIN_TARGET = "/dashboard"

/** Split `/en/settings` into its locale prefix and the locale-free path. */
export function splitLocale(pathname: string): {
  locale: Locale | null
  path: string
} {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return { locale, path: "/" }
    if (pathname.startsWith(`/${locale}/`))
      return { locale, path: pathname.slice(`/${locale}`.length) }
  }
  return { locale: null, path: pathname }
}

/**
 * Sanitise the `?next=` post-login target. Two independent concerns:
 *
 * 1. Only same-origin, non-protocol-relative paths are accepted — otherwise
 *    `?next=https://evil.com` or `?next=//evil.com` is an open redirect.
 * 2. Any locale prefix is stripped, because `useRouter` from
 *    `@/i18n/navigation` re-applies it; passing `/en/settings` straight through
 *    would navigate to `/en/en/settings`.
 */
export function getSafeNext(raw: string | null): string {
  if (
    !raw ||
    !raw.startsWith("/") ||
    raw.startsWith("//") ||
    raw.startsWith("/\\")
  ) {
    return DEFAULT_POST_LOGIN_TARGET
  }
  return splitLocale(raw).path
}
