"use client"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"

// Deterministic 29-day series, SSR-safe (no Math.random/Date).
const DATA = Array.from({ length: 29 }, (_, i) => {
  const day = i + 12
  return {
    label: day > 31 ? `Jun ${day - 31}` : `May ${day}`,
    requests: Math.round(6000 + Math.sin(i / 3) * 2400 + i * 220),
  }
})

const config = {
  requests: { label: "API Requests", color: "var(--chart-1)" },
} satisfies ChartConfig

const fmtK = (n: number) => `${Math.round(n / 1000)}K`

export function UsageRequestsChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">API Requests over time</h3>
        <span className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground">
          Last 29 days
        </span>
      </div>
      <ChartContainer config={config} className="aspect-auto h-[260px] w-full">
        <AreaChart data={DATA} margin={{ left: 4, right: 4 }}>
          <defs>
            <linearGradient id="fillUsageReq" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-requests)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--color-requests)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={48}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={fmtK}
          />
          <ChartTooltip
            cursor
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            dataKey="requests"
            type="monotone"
            stroke="var(--color-requests)"
            strokeWidth={2}
            fill="url(#fillUsageReq)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
