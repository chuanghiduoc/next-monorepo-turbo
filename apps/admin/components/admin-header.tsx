"use client"

import {
  Bell,
  Calendar,
  ChevronDown,
  LogOut,
  Search,
  Settings,
  User,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useTransition } from "react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Separator } from "@workspace/ui/components/separator"
import { SidebarTrigger } from "@workspace/ui/components/sidebar"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Link, useRouter } from "@/i18n/navigation"
import { signOut } from "@/lib/auth-client"

function initials(name: string, email: string) {
  return (name.trim() || email).slice(0, 2).toUpperCase()
}

export function AdminHeader({ name, email }: { name: string; email: string }) {
  const t = useTranslations()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
      router.replace("/login")
      router.refresh()
    })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-xl sm:px-4">
      <SidebarTrigger className="-ml-0.5" />

      {/* Search */}
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder={t("shell.search")}
          className="h-9 w-full rounded-lg border border-input bg-muted/40 pr-12 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 items-center rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground lg:inline-flex">
          ⌘K
        </kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Date range */}
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 gap-2 font-normal sm:inline-flex"
        >
          <Calendar className="size-4 text-muted-foreground" />
          <span className="tabular-nums">May 12 – Jun 10, 2025</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>

        <LocaleSwitcher />
        <ThemeToggle />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("shell.notifications")}
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-[1.15rem]" />
          <span className="absolute -top-0.5 -right-0.5 flex size-[17px] items-center justify-center rounded-full bg-destructive text-[10px] leading-none font-semibold text-white ring-2 ring-background">
            3
          </span>
        </Button>

        <Separator
          orientation="vertical"
          className="mx-0.5 hidden h-6 sm:block"
        />

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-11 gap-2 px-1.5 sm:pl-2">
              <Avatar className="size-8">
                <AvatarFallback className="bg-brand text-xs font-semibold text-brand-foreground">
                  {initials(name, email)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left leading-tight sm:block">
                <p className="max-w-32 truncate text-sm font-medium">
                  {name || email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t("shell.badge")}
                </p>
              </div>
              <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="truncate text-sm font-medium">
                {name || "—"}
              </span>
              <span className="truncate text-xs font-normal text-muted-foreground">
                {email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User className="size-4" />
                {t("shell.account")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="size-4" />
                {t("nav.settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              disabled={pending}
              variant="destructive"
            >
              <LogOut className="size-4" />
              {pending ? t("common.signingOut") : t("common.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
