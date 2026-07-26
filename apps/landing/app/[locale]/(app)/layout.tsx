import { getLocale } from "next-intl/server"
import type { ReactNode } from "react"

import { redirect } from "@/i18n/navigation"
import { getServerSession } from "@/lib/auth-server"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession()
  // Locale-aware redirect: `next/navigation`'s would drop the `/en` prefix and
  // bounce an English visitor onto the default-locale sign-in page. Returned so
  // TypeScript narrows `session` — the destructured `redirect` returns `never`
  // but is not a declaration, so it does not drive control-flow analysis.
  if (!session) return redirect({ href: "/login", locale: await getLocale() })

  return <div className="min-h-screen">{children}</div>
}
