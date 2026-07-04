import { cn } from "@workspace/ui/lib/utils"

/** App wordmark — lime tile + name, shared by auth screens and the app shell. */
export function BrandMark({
  className,
  label = "turbo/app",
}: {
  className?: string
  label?: string
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg bg-brand font-mono text-[15px] font-bold text-brand-foreground shadow-sm"
      >
        {"{}"}
      </span>
      <span className="text-[15px] font-semibold tracking-tight">{label}</span>
    </span>
  )
}
