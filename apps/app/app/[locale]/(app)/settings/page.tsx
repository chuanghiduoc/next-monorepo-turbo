import { getTranslations } from "next-intl/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { SettingsProfileForm } from "@/components/settings-profile-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { getServerSession } from "@/lib/auth-server"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  return { title: t("settings") }
}

export default async function SettingsPage() {
  const session = await getServerSession()
  const t = await getTranslations("settings")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>{t("profileTitle")}</CardTitle>
            <CardDescription>{t("profileHint")}</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsProfileForm
              initialName={session?.user.name ?? ""}
              email={session?.user.email ?? ""}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("appearanceTitle")}</CardTitle>
            <CardDescription>{t("appearanceHint")}</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <div className="flex items-center justify-between pb-4">
              <div>
                <p className="text-sm font-medium">{t("themeLabel")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("themeHint")}
                </p>
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm font-medium">{t("languageLabel")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("languageHint")}
                </p>
              </div>
              <LocaleSwitcher />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
