import { cn } from "@workspace/ui/lib/utils"

/**
 * Brand wordmark: a lime tile with a monospace bracket glyph next to the
 * repo name. Kept dependency-free so header and footer share one source.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg bg-brand font-mono text-[15px] font-bold text-brand-foreground shadow-sm"
      >
        {"{}"}
      </span>
      <span className="text-[15px] font-semibold tracking-tight">
        turbo<span className="text-muted-foreground">/starter</span>
      </span>
    </span>
  )
}
