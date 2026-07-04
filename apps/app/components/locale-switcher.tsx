"use client"

import { useLocale } from "next-intl"
import { useTransition } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { usePathname, useRouter } from "@/i18n/navigation"
import { routing, type Locale } from "@/i18n/routing"

const LABELS: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
}

export function LocaleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale() as Locale
  const [pending, startTransition] = useTransition()

  function onChange(next: string) {
    startTransition(() => {
      router.replace(pathname, { locale: next as Locale })
    })
  }

  return (
    <Select value={locale} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {routing.locales.map((l) => (
          <SelectItem key={l} value={l}>
            {LABELS[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
