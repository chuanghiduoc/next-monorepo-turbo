"use client"

import {
  BookOpen,
  Boxes,
  CreditCard,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  Settings,
  Sparkles,
  Users,
} from "lucide-react"
import { useTranslations } from "next-intl"
import type { ComponentProps, ComponentType } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

import { Link, usePathname } from "@/i18n/navigation"

type Item = {
  key: string
  href: string
  icon: ComponentType<{ className?: string }>
}

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "groupMain",
    items: [
      { key: "overview", href: "/dashboard", icon: LayoutDashboard },
      { key: "apps", href: "/apps", icon: Boxes },
      { key: "members", href: "/members", icon: Users },
      { key: "billing", href: "/billing", icon: CreditCard },
      { key: "usage", href: "/usage", icon: LineChart },
      { key: "settings", href: "/settings", icon: Settings },
    ],
  },
  {
    label: "groupResources",
    items: [
      { key: "documentation", href: "/documentation", icon: BookOpen },
      { key: "support", href: "/support", icon: LifeBuoy },
    ],
  },
]

export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  const t = useTranslations()
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-brand font-mono text-sm font-bold text-brand-foreground">
                  {"{}"}
                </div>
                <span className="text-base font-semibold tracking-tight">
                  turbo/app
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="font-mono text-[10px] tracking-[0.12em] uppercase">
              {t(`nav.${group.label}`)}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map(({ key, href, icon: Icon }) => (
                <SidebarMenuItem key={key}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === href}
                    tooltip={t(`nav.${key}`)}
                  >
                    <Link href={href}>
                      <Icon />
                      <span>{t(`nav.${key}`)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-xl border border-border bg-card p-4 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-brand/10 text-brand">
              <Sparkles className="size-4" />
            </span>
            <p className="text-sm font-semibold">{t("shell.trialTitle")}</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("shell.upgradeHint")}
          </p>
          <Button size="sm" variant="outline" className="mt-3 w-full">
            {t("shell.upgrade")}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
