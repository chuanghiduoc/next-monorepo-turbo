"use client"

import {
  Bell,
  Building2,
  CreditCard,
  KeyRound,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@workspace/ui/lib/utils"

const NAV_ITEMS = [
  { key: "general", label: "General", icon: SettingsIcon },
  { key: "workspace", label: "Workspace", icon: Building2 },
  { key: "members", label: "Members", icon: Users },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "api", label: "API", icon: KeyRound },
] as const

/**
 * Visual settings sub-nav. Only the "General" section ships content today,
 * so this only highlights the clicked row locally — it never routes.
 */
export function SettingsNav() {
  const [active, setActive] =
    useState<(typeof NAV_ITEMS)[number]["key"]>("general")

  return (
    <nav
      aria-label="Settings sections"
      className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-2 shadow-xs shadow-black/[0.03] lg:w-[200px] lg:shrink-0 lg:flex-col lg:overflow-visible"
    >
      {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
        const isActive = key === active
        return (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors lg:w-full",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        )
      })}
    </nav>
  )
}
