import { ArrowLeft, CircleCheck } from "lucide-react"
import { getTranslations } from "next-intl/server"
import type { ReactNode } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Wordmark } from "@/components/wordmark"
import { Link } from "@/i18n/navigation"

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  const t = await getTranslations("auth")
  const points = t.raw("brandPoints") as string[]

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl px-4 py-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <aside className="hidden border-r pr-10 lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="w-fit">
            <Wordmark />
          </Link>

          <div className="max-w-md space-y-6">
            <Badge variant="secondary">{t("badge")}</Badge>
            <div className="space-y-3">
              <p className="text-2xl font-semibold tracking-tight text-balance">
                {t("brandTitle")}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {t("brandSubtitle")}
              </p>
            </div>
            <div className="space-y-3">
              {points.map((point) => (
                <div
                  key={point}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <CircleCheck
                    className="mt-0.5 size-4 shrink-0 text-foreground"
                    aria-hidden="true"
                  />
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            © 2026 turbo/starter — MIT
          </p>
        </aside>

        <div className="flex flex-col lg:pl-10">
          <div className="flex items-center justify-between gap-2">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft aria-hidden="true" />
                {t("backHome")}
              </Link>
            </Button>
            <div className="flex items-center gap-1.5">
              <LocaleSwitcher />
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </section>
    </main>
  )
}
