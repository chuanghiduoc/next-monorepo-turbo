import { getTranslations } from "next-intl/server"

import { Wordmark } from "@/components/wordmark"

const COLUMNS = [
  {
    key: "product" as const,
    links: ["Features", "Stack", "Pricing", "Changelog"],
  },
  {
    key: "resources" as const,
    links: ["Documentation", "GitHub", "Releases", "Roadmap"],
  },
  {
    key: "legal" as const,
    links: ["License", "Privacy", "Terms", "Security"],
  },
]

export async function SiteFooter() {
  const t = await getTranslations("landing.footer")

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Wordmark />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.key}>
              <h3 className="font-mono text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase">
                {t(col.key)}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 turbo/starter · {t("rights")}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {t("builtWith")}
          </p>
        </div>
      </div>
    </footer>
  )
}
