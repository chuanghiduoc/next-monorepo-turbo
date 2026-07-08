import createMiddleware from "next-intl/middleware"
import { NextResponse, type NextRequest } from "next/server"

import { routing } from "@/i18n/routing"
import { hasSessionCookie, isPreviewAuth } from "@/lib/session-cookie"

const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/preview",
]

const intlMiddleware = createMiddleware(routing)

function stripLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (pathname === `/${locale}`) return "/"
    if (pathname.startsWith(`/${locale}/`))
      return pathname.slice(`/${locale}`.length)
  }
  return pathname
}

function isPublic(pathname: string): boolean {
  const path = stripLocale(pathname)
  return PUBLIC_PATHS.includes(path) || path === "/"
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (!isPreviewAuth() && !isPublic(pathname) && !hasSessionCookie(request)) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname + search)
    return NextResponse.redirect(url)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}
