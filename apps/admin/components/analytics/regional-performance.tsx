import { Button } from "@workspace/ui/components/button"

const COUNTRIES = [
  { label: "United States", users: 18276 },
  { label: "United Kingdom", users: 5842 },
  { label: "Canada", users: 3982 },
  { label: "Australia", users: 2911 },
  { label: "Germany", users: 2431 },
] as const

const MAX_USERS = Math.max(...COUNTRIES.map((c) => c.users))

export function RegionalPerformance() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <h3 className="text-sm font-semibold">Regional Performance</h3>

      <div className="mt-4 flex-1 space-y-3.5">
        {COUNTRIES.map((country) => (
          <div key={country.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-sm text-muted-foreground">
              {country.label}
            </span>
            <div className="h-2 flex-1 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-brand"
                style={{ width: `${(country.users / MAX_USERS) * 100}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-sm tabular-nums">
              {country.users.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="mt-4 w-fit">
        View All Regions
      </Button>
    </div>
  )
}
