const SOURCES = [
  { label: "Organic Search", value: 18642, pct: 38.1 },
  { label: "Paid Search", value: 11208, pct: 22.9 },
  { label: "Direct", value: 8931, pct: 18.2 },
  { label: "Referral", value: 5477, pct: 11.2 },
  { label: "Social Media", value: 2674, pct: 5.5 },
  { label: "Email", value: 1102, pct: 2.3 },
  { label: "Other", value: 898, pct: 1.8 },
] as const

export function TrafficSource() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <h3 className="text-sm font-semibold">Traffic Source</h3>

      <div className="mt-4 space-y-3.5">
        {SOURCES.map((source) => (
          <div key={source.label} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate text-sm text-muted-foreground">
              {source.label}
            </span>
            <div className="h-2 flex-1 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-brand"
                style={{ width: `${source.pct}%` }}
              />
            </div>
            <span className="w-24 shrink-0 text-right text-sm tabular-nums">
              {source.value.toLocaleString()}{" "}
              <span className="text-muted-foreground">
                ({source.pct.toFixed(1)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
