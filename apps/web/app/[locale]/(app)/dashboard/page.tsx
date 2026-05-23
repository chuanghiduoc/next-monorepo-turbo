import { getTranslations } from "next-intl/server"

import { SignOutButton } from "@/components/sign-out-button"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { getServerSession } from "@/lib/auth-server"

export default async function DashboardPage() {
  const session = await getServerSession()
  const t = await getTranslations("dashboard")

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("signedInAs", { email: session?.user.email ?? "" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <SignOutButton />
        </div>
      </header>

      <section className="rounded-lg border bg-card p-6">
        <h2 className="mb-2 text-lg font-medium">{t("session")}</h2>
        <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs">
          {JSON.stringify(session, null, 2)}
        </pre>
      </section>
    </main>
  )
}
