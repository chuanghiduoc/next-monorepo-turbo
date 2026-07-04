"use client"

import { ArrowRight, Menu } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

import { LocaleSwitcher } from "@/components/locale-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Wordmark } from "@/components/wordmark"
import { appHref } from "@/lib/site-config"

const SECTIONS = ["features", "stack", "pricing", "faq"] as const

export function SiteHeader() {
  const t = useTranslations("landing.nav")
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" className="shrink-0">
          <Wordmark />
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {SECTIONS.map((s) => (
            <a
              key={s}
              href={`#${s}`}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(s)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden items-center gap-1.5 sm:flex">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
          <Button
            asChild
            variant="ghost"
            className="hidden text-sm sm:inline-flex"
          >
            <a href={appHref("/login")}>{t("signIn")}</a>
          </Button>
          <Button asChild className="hidden shadow-sm sm:inline-flex">
            <a href={appHref("/register")}>
              {t("getStarted")}
              <ArrowRight className="size-4" />
            </a>
          </Button>

          {/* Mobile */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex h-full flex-col gap-1 p-6">
                <Wordmark className="mb-6" />
                {SECTIONS.map((s) => (
                  <SheetClose asChild key={s}>
                    <a
                      href={`#${s}`}
                      className="rounded-lg px-3 py-3 text-lg font-medium transition-colors hover:bg-accent"
                    >
                      {t(s)}
                    </a>
                  </SheetClose>
                ))}
                <div className="mt-auto flex flex-col gap-3 pt-6">
                  <div className="flex items-center gap-2">
                    <LocaleSwitcher />
                    <ThemeToggle />
                  </div>
                  <SheetClose asChild>
                    <Button asChild variant="outline">
                      <a href={appHref("/login")}>{t("signIn")}</a>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button asChild>
                      <a href={appHref("/register")}>
                        {t("getStarted")}
                        <ArrowRight className="size-4" />
                      </a>
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
