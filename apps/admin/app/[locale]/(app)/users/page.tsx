import { getTranslations } from "next-intl/server"

import { UsersTable } from "@/components/users-table"
import { UserStats } from "@/components/users/user-stats"
import { UsersSide } from "@/components/users/users-side"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "nav" })
  return { title: t("users") }
}

export default function UsersPage() {
  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Users
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage users, roles, and account activity across your organization.
        </p>
      </div>

      <UserStats />

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <UsersTable />
        </div>
        <div className="lg:col-span-1">
          <UsersSide />
        </div>
      </div>
    </>
  )
}
