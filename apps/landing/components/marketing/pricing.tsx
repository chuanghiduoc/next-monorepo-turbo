import { ArrowRight, Check } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { SectionHeading } from "@/components/marketing/features"
import { appHref } from "@/lib/site-config"

type Tier = {
  name: string
  price: string
  desc: string
  features: string[]
  cta: string
}

export async function Pricing() {
  const t = await getTranslations("landing.pricing")
  const tiers = t.raw("tiers") as Tier[]

  return (
    <section id="pricing" className="scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {tiers.map((tier, i) => {
            const featured = i === 1
            return (
              <div
                key={tier.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-8 transition-all",
                  featured
                    ? "border-brand bg-card shadow-xl shadow-brand/10 lg:-my-3 lg:scale-[1.02]"
                    : "border-border bg-card/60 hover:border-foreground/20"
                )}
              >
                {featured ? (
                  <span className="absolute -top-3 left-8 rounded-full bg-brand px-3 py-1 font-mono text-[11px] font-semibold tracking-wider text-brand-foreground uppercase shadow-sm">
                    {t("mostPopular")}
                  </span>
                ) : null}

                <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-heading text-4xl font-medium tracking-tight">
                    {tier.price}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {tier.desc}
                </p>

                <ul className="mt-6 space-y-3 border-t border-border pt-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <Check
                        className={cn(
                          "size-4 shrink-0",
                          featured ? "text-brand" : "text-foreground"
                        )}
                        strokeWidth={3}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  size="lg"
                  variant={featured ? "default" : "outline"}
                  className="mt-8 w-full"
                >
                  <a href={appHref("/register")}>
                    {tier.cta}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
