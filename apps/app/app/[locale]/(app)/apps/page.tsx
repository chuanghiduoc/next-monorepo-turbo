import { Search } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

import { AppsGrid } from "@/components/apps/apps-grid"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "nav" })
  return { title: t("apps") }
}

export default async function AppsPage() {
  const t = await getTranslations("nav")

  return (
    <>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("apps")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and monitor all your deployed applications.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm">
            Filters
          </Button>
          <Button size="sm">New App</Button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search apps…"
          className="max-w-sm pl-8"
          aria-label="Search apps"
        />
      </div>

      <AppsGrid />
    </>
  )
}
