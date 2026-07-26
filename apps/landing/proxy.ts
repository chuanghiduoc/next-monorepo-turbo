import createMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"

import { routing } from "@/i18n/routing"
import { splitLocale } from "@/lib/locale-path"
import { hasSessionCookie, isPreviewAuth } from "@/lib/session-cookie"

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/preview",
]

const intlMiddleware = createMiddleware(routing)

function isPublic(path: string): boolean {
  return PUBLIC_PATHS.includes(path) || path === "/"
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const { locale, path } = splitLocale(pathname)

  if (!isPreviewAuth() && !isPublic(path) && !hasSessionCookie(request)) {
    const url = request.nextUrl.clone()
    // Returning a redirect skips the intl middleware, so the locale prefix has
    // to be carried over here — otherwise an `/en/...` visitor lands on the
    // default locale's sign-in page. Mirroring the incoming prefix keeps this
    // correct for any `localePrefix` mode without importing the navigation
    // helpers (and their React components) into the middleware bundle.
    url.pathname = locale ? `/${locale}/login` : "/login"
    // Drop the original query (it belongs to the requested page, not to /login)
    // and store `next` locale-free: `useRouter` from `@/i18n/navigation`
    // re-applies the prefix, so keeping it would yield `/en/en/settings`.
    url.search = ""
    url.searchParams.set("next", path + search)
    return NextResponse.redirect(url)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}
