import { ArrowRight, Star } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@workspace/ui/components/button"

import { appHref } from "@/lib/site-config"

export async function Cta() {
  const t = await getTranslations("landing.cta")

  return (
    <section className="px-5 py-24 sm:px-8 sm:py-28">
      <div className="grain relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-foreground px-6 py-16 text-center text-background sm:px-16 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand/30 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand/20 blur-[100px]"
        />

        <h2 className="relative mx-auto max-w-3xl font-heading text-4xl leading-tight font-medium tracking-tight text-balance sm:text-5xl">
          {t("title")}
        </h2>
        <p className="relative mx-auto mt-5 max-w-xl text-lg text-balance text-background/70">
          {t("subtitle")}
        </p>

        <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-12 bg-brand px-7 text-base text-brand-foreground shadow-lg hover:bg-brand/90"
          >
            <a href={appHref("/register")}>
              {t("button")}
              <ArrowRight className="size-4" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-background/20 bg-transparent px-7 text-base text-background hover:bg-background/10 hover:text-background"
          >
            <a
              href="https://github.com/chuanghiduoc/next-monorepo-turbo"
              target="_blank"
              rel="noreferrer"
            >
              <Star className="size-4" />
              {t("secondary")}
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
