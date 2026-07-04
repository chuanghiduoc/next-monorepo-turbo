"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

/**
 * Profile form shell. The boilerplate keeps it local-only (toasts on save);
 * wire it to your backend mutation when you build the settings feature.
 */
export function SettingsProfileForm({
  initialName,
  email,
}: {
  initialName: string
  email: string
}) {
  const t = useTranslations()
  const [name, setName] = useState(initialName)
  const [saving, setSaving] = useState(false)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // No backend wiring yet — reflect the interaction, don't fake persistence.
    setTimeout(() => {
      setSaving(false)
      toast.success(t("settings.saved"))
    }, 500)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-2">
        <Label htmlFor="settings-name">{t("common.name")}</Label>
        <Input
          id="settings-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 max-w-md"
          autoComplete="name"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="settings-email">{t("common.email")}</Label>
        <Input
          id="settings-email"
          value={email}
          disabled
          className="h-11 max-w-md"
        />
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? t("common.creating") : t("settings.save")}
      </Button>
    </form>
  )
}
