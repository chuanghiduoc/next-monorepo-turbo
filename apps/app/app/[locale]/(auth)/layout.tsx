import { Check } from "lucide-react"
import { getTranslations } from "next-intl/server"
import type { ReactNode } from "react"

import { BrandMark } from "@/components/brand-mark"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { ThemeToggle } from "@/components/theme-toggle"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  return { title: t("login") }
}

export default async function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  const t = await getTranslations("auth")
  const points = t.raw("brandPoints") as string[]

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="grain relative hidden overflow-hidden bg-foreground p-12 text-background lg:flex lg:flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 -right-20 h-72 w-72 rounded-full bg-brand/30 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-brand/15 blur-[100px]"
        />

        <BrandMark
          label="turbo/app"
          className="relative text-background [&_span:last-child]:text-background"
        />

        <div className="relative mt-auto">
          <h2 className="font-heading text-4xl leading-tight font-medium tracking-tight text-balance">
            {t("brandTitle")}
          </h2>
          <p className="mt-4 max-w-md text-background/70">
            {t("brandSubtitle")}
          </p>
          <ul className="mt-8 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-3">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-brand-foreground">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                <span className="text-sm text-background/85">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative mt-12 font-mono text-xs text-background/40">
          © 2026 turbo/starter — MIT
        </p>
      </aside>

      {/* Form panel */}
      <div className="relative flex flex-col px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <BrandMark className="lg:hidden" />
          <div className="ml-auto flex items-center gap-1.5">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}
