"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"

/**
 * Light/dark toggle. Both icons render and CSS (the `.dark` class next-themes
 * sets pre-hydration) decides which is visible — no mount guard, no mismatch.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme (D)"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground"
    >
      <Moon className="size-[1.15rem] dark:hidden" />
      <Sun className="hidden size-[1.15rem] dark:block" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
