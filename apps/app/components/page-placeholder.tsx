import { ArrowLeft, Construction } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@workspace/ui/components/button"

import { Link } from "@/i18n/navigation"

/**
 * Empty-state shown for nav routes the boilerplate leaves unimplemented.
 * `section` is the already-translated section name.
 */
export async function PagePlaceholder({ section }: { section: string }) {
  const t = await getTranslations("stub")

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
      <div className="grid size-16 place-items-center rounded-2xl border border-border bg-card text-brand shadow-sm">
        <Construction className="size-7" />
      </div>
      <span className="mt-6 inline-flex items-center rounded-full border border-border bg-secondary px-3 py-1 font-mono text-xs text-muted-foreground">
        {t("badge")}
      </span>
      <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight">
        {t("title", { section })}
      </h1>
      <p className="mt-2 text-sm text-balance text-muted-foreground">
        {t("subtitle")}
      </p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/dashboard">
          <ArrowLeft className="size-4" />
          {t("back")}
        </Link>
      </Button>
    </div>
  )
}
