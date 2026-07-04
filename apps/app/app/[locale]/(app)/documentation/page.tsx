import { getTranslations } from "next-intl/server"

import { PagePlaceholder } from "@/components/page-placeholder"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "nav" })
  return { title: t("documentation") }
}

export default async function DocumentationPage() {
  const t = await getTranslations("nav")
  return <PagePlaceholder section={t("documentation")} />
}
