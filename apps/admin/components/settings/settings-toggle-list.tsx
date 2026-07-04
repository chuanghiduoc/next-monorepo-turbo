"use client"

import type { ReactNode } from "react"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"

export type SettingsToggleItem = {
  id: string
  icon: ReactNode
  title: string
  description: string
  defaultChecked: boolean
}

/**
 * Reusable icon + title + description + switch row list. Each switch is
 * uncontrolled (defaultChecked) — no persistence is wired up yet.
 */
export function SettingsToggleList({ items }: { items: SettingsToggleItem[] }) {
  return (
    <div className="mt-4 divide-y divide-border">
      {items.map(({ id, icon, title, description, defaultChecked }) => (
        <div
          key={id}
          className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
              {icon}
            </span>
            <div>
              <Label htmlFor={id} className="text-sm font-medium">
                {title}
              </Label>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <Switch
            id={id}
            defaultChecked={defaultChecked}
            aria-label={title}
            className="shrink-0"
          />
        </div>
      ))}
    </div>
  )
}
