import { redirect } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { getServerSession } from "@/lib/auth-server"

export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await getServerSession()
  const validLocale = routing.locales.includes(
    locale as (typeof routing.locales)[number]
  )
    ? (locale as (typeof routing.locales)[number])
    : routing.defaultLocale

  redirect({
    href: session ? "/dashboard" : "/login",
    locale: validLocale,
  })
}
