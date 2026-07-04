"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

const USAGE = [
  {
    name: "Marketing Landing Page",
    value: 96,
    pct: "37.5%",
    color: "var(--chart-1)",
  },
  { name: "Customer Portal", value: 64, pct: "25.0%", color: "var(--chart-2)" },
  {
    name: "Internal Dashboard",
    value: 48,
    pct: "18.8%",
    color: "var(--chart-3)",
  },
  {
    name: "AI Image Generator",
    value: 32,
    pct: "12.5%",
    color: "var(--chart-4)",
  },
  {
    name: "Data Processing API",
    value: 16,
    pct: "6.2%",
    color: "var(--chart-5)",
  },
]

export function UsageDonut() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Usage by App</h3>
        <span className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground">
          Last 30 days
        </span>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative size-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={USAGE}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={76}
                paddingAngle={2}
                strokeWidth={0}
                isAnimationActive={false}
              >
                {USAGE.map((u) => (
                  <Cell key={u.name} fill={u.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold tabular-nums">256K</span>
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
        </div>

        <ul className="w-full space-y-2.5">
          {USAGE.map((u) => (
            <li key={u.name} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: u.color }}
              />
              <span className="flex-1 truncate text-foreground/90">
                {u.name}
              </span>
              <span className="font-medium tabular-nums">{u.value}K</span>
              <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                {u.pct}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
