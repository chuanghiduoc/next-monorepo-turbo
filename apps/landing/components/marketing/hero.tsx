import { ArrowRight, Blocks, DatabaseZap, Layers3 } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"

import { appHref } from "@/lib/site-config"

const STACK = [
  "Turborepo",
  "Next.js 16",
  "React 19",
  "Tailwind v4",
  "shadcn/ui",
  "Better Auth",
  "TanStack Query",
  "next-intl",
  "Playwright",
  "Vitest",
]

/** One icon per entry in `landing.hero.card.items`, in the same order. */
const CAPABILITY_ICONS = [Blocks, DatabaseZap, Layers3] as const

type CapabilityItem = { title: string; desc: string }

export async function Hero() {
  const t = await getTranslations("landing.hero")
  const tt = await getTranslations("landing")

  const items = t.raw("card.items") as CapabilityItem[]
  const capabilities = CAPABILITY_ICONS.flatMap((Icon, index) => {
    const item = items[index]
    return item ? [{ Icon, item }] : []
  })

  return (
    <section id="top">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-2xl">
            <Badge variant="outline">{t("badge")}</Badge>
            <h1 className="mt-5 text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
              {t("titleLead")}{" "}
              <span className="text-primary">{t("titleAccent")}</span>{" "}
              {t("titleTail")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              {t("subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <a href={appHref("/register")}>
                  {t("ctaPrimary")}
                  <ArrowRight aria-hidden="true" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="#features">{t("ctaSecondary")}</a>
              </Button>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">{t("note")}</p>
          </div>

          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle>{t("card.title")}</CardTitle>
              <CardDescription>{t("card.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {capabilities.map(({ Icon, item }, index) => (
                  <div key={item.title}>
                    <div className="flex gap-4">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-muted">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="text-sm font-medium">{item.title}</h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    {index < capabilities.length - 1 ? (
                      <Separator className="mt-5" />
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trust marquee */}
      <div className="border-y border-border">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <p className="mb-4 text-center text-xs tracking-[0.2em] text-muted-foreground uppercase">
            {tt("trust")}
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="animate-marquee flex w-max gap-10">
              {[...STACK, ...STACK].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="text-sm font-medium whitespace-nowrap text-muted-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
