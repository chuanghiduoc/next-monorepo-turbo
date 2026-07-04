import { getTranslations } from "next-intl/server"
import { Button } from "@workspace/ui/components/button"

import { MembersStats } from "@/components/members/members-stats"
import { MembersTable } from "@/components/members/members-table"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "nav" })
  return { title: t("members") }
}

export default async function MembersPage() {
  const t = await getTranslations("nav")

  return (
    <>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("members")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Invite teammates and manage their access.
          </p>
        </div>
        <Button size="sm" className="shrink-0">
          Invite Member
        </Button>
      </div>

      <MembersStats />

      <MembersTable />
    </>
  )
}
