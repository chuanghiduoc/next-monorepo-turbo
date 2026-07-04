"use client"

import { useTranslations } from "next-intl"
import { useTransition } from "react"
import { Button } from "@workspace/ui/components/button"

import { signOut } from "@/lib/auth-client"
import { useRouter } from "@/i18n/navigation"

export function SignOutButton() {
  const t = useTranslations("common")
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await signOut()
      router.replace("/login")
      router.refresh()
    })
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={pending}>
      {pending ? t("signingOut") : t("signOut")}
    </Button>
  )
}
