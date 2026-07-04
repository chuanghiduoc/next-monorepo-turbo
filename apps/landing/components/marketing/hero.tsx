import { ArrowRight, BookText, Sparkles } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@workspace/ui/components/button"

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

export async function Hero() {
  const t = await getTranslations("landing.hero")
  const tt = await getTranslations("landing")

  return (
    <section id="top" className="relative overflow-hidden">
      {/* Layered backdrop: dotted grid + radial glow + grain */}
      <div className="grain pointer-events-none absolute inset-0 -z-10">
        <div className="bg-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-60" />
        <div className="absolute -top-40 left-1/2 h-[36rem] w-[56rem] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]" />
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 lg:pt-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <div className="max-w-xl">
            <div
              className="fade-up inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
              style={{ animationDelay: "0ms" }}
            >
              <Sparkles className="size-3.5 text-brand" />
              <span className="font-mono">{t("badge")}</span>
            </div>

            <h1
              className="fade-up mt-6 font-heading text-5xl leading-[1.02] font-medium tracking-tight text-balance sm:text-6xl lg:text-7xl"
              style={{ animationDelay: "80ms" }}
            >
              {t("titleLead")}{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 text-brand">
                  {t("titleAccent")}
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1.5 z-0 h-3.5 bg-brand/20"
                />
              </span>{" "}
              {t("titleTail")}
            </h1>

            <p
              className="fade-up mt-6 text-lg leading-relaxed text-balance text-muted-foreground"
              style={{ animationDelay: "160ms" }}
            >
              {t("subtitle")}
            </p>

            <div
              className="fade-up mt-8 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "240ms" }}
            >
              <Button
                asChild
                size="lg"
                className="h-12 px-6 text-base shadow-sm"
              >
                <a href={appHref("/register")}>
                  {t("ctaPrimary")}
                  <ArrowRight className="size-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base"
              >
                <a href="#features">
                  <BookText className="size-4" />
                  {t("ctaSecondary")}
                </a>
              </Button>
            </div>

            <p
              className="fade-up mt-5 font-mono text-xs text-muted-foreground"
              style={{ animationDelay: "320ms" }}
            >
              {t("note")}
            </p>
          </div>

          {/* Terminal visual */}
          <div className="fade-up relative" style={{ animationDelay: "200ms" }}>
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-brand/10 blur-2xl" />
            <TerminalCard />
          </div>
        </div>
      </div>

      {/* Trust marquee */}
      <div className="border-y border-border bg-card/40">
        <div className="mx-auto max-w-6xl px-5 py-5 sm:px-8">
          <p className="mb-4 text-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            {tt("trust")}
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="animate-marquee flex w-max gap-10">
              {[...STACK, ...STACK].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="font-mono text-sm font-medium whitespace-nowrap text-muted-foreground/80"
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

function TerminalCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/10">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
        <span className="size-3 rounded-full bg-destructive/70" />
        <span className="size-3 rounded-full bg-chart-3/70" />
        <span className="size-3 rounded-full bg-brand" />
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          ~/turbo-starter — pnpm dev
        </span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-relaxed">
        <code>
          <span className="text-muted-foreground">$</span> pnpm dev{"\n"}
          {"\n"}
          <span className="text-brand">•</span> Turbo{"  "}
          <span className="text-muted-foreground">running 3 tasks</span>
          {"\n\n"}
          <span className="text-brand">app:dev</span>
          {"     "}ready on{" "}
          <span className="underline decoration-brand decoration-2 underline-offset-2">
            localhost:3000
          </span>
          {"\n"}
          <span className="text-chart-2">landing:dev</span> ready on{" "}
          <span className="underline decoration-brand decoration-2 underline-offset-2">
            localhost:3001
          </span>
          {"\n"}
          <span className="text-chart-4">admin:dev</span>
          {"   "}ready on{" "}
          <span className="underline decoration-brand decoration-2 underline-offset-2">
            localhost:3002
          </span>
          {"\n\n"}
          <span className="text-muted-foreground">
            ✓ shared ui · typed api · auth · i18n
          </span>
        </code>
      </pre>
    </div>
  )
}
