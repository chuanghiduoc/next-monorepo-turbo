import {
  Boxes,
  KeyRound,
  Languages,
  Network,
  TestTube2,
  Workflow,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

type FeatureItem = { tag: string; title: string; desc: string }

const ICONS = [Boxes, Network, KeyRound, Workflow, Languages, TestTube2]

export async function Features() {
  const t = await getTranslations("landing.features")
  const items = t.raw("items") as FeatureItem[]

  return (
    <section id="features" className="scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          subtitle={t("subtitle")}
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length]!
            return (
              <article
                key={item.tag}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg hover:shadow-black/5"
              >
                <span
                  aria-hidden
                  className="absolute top-5 right-5 font-mono text-xs font-medium text-muted-foreground/50"
                >
                  {item.tag}
                </span>
                <div className="mb-5 grid size-11 place-items-center rounded-xl border border-border bg-background text-foreground transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string
  title: string
  subtitle?: string
  align?: "center" | "left"
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"
      }
    >
      <span className="inline-flex items-center gap-2 font-mono text-xs font-medium tracking-[0.18em] text-brand uppercase">
        <span className="h-px w-6 bg-brand" />
        {eyebrow}
      </span>
      <h2 className="mt-4 font-heading text-3xl font-medium tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-lg text-balance text-muted-foreground">
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}
