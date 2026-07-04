"use client"

import { Area, AreaChart, CartesianGrid, Line, XAxis, YAxis } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"

/**
 * Deterministic ~20-point series spanning May 12 → Jun 9 (no Math.random,
 * no Date object) so server- and client-rendered markup match exactly.
 */
const POINT_COUNT = 20
const LAST_DAY_OFFSET = 28 // May 12 (offset 0) → Jun 9 (offset 28)

const TREND = Array.from({ length: POINT_COUNT }, (_, i) => {
  const dayOffset = Math.round((i * LAST_DAY_OFFSET) / (POINT_COUNT - 1))
  const dayOfMay = 12 + dayOffset
  const label = dayOfMay <= 31 ? `May ${dayOfMay}` : `Jun ${dayOfMay - 31}`

  return {
    label,
    visitors: Math.round(1800 + Math.sin(i / 3) * 400 + i * 35),
    pageViews: Math.round(4200 + Math.cos(i / 4) * 600 + i * 50),
    signups: Math.round(220 + Math.sin(i / 2.5 + 1) * 40 + i * 6),
    conversions: Math.round(60 + Math.cos(i / 3 + 2) * 15 + i * 2),
  }
})

const config = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  pageViews: { label: "Page Views", color: "var(--chart-2)" },
  signups: { label: "Signups", color: "var(--chart-3)" },
  conversions: { label: "Conversions", color: "var(--chart-4)" },
} satisfies ChartConfig

const LEGEND = [
  { key: "visitors", label: "Visitors" },
  { key: "pageViews", label: "Page Views" },
  { key: "signups", label: "Signups" },
  { key: "conversions", label: "Conversions" },
] as const

export function PerformanceTrends() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Performance Trends</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            {LEGEND.map((item) => (
              <span key={item.key} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: `var(--color-${item.key})` }}
                />
                {item.label}
              </span>
            ))}
          </div>
        </div>
        <span className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground">
          Daily
        </span>
      </div>
      <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
        <AreaChart data={TREND} margin={{ left: 4, right: 4 }}>
          <defs>
            <linearGradient id="analyticsVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-visitors)"
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor="var(--color-visitors)"
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
            minTickGap={32}
          />
          <YAxis tickLine={false} axisLine={false} width={40} />
          <ChartTooltip
            cursor
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            dataKey="visitors"
            type="monotone"
            stroke="var(--color-visitors)"
            strokeWidth={2}
            fill="url(#analyticsVisitors)"
          />
          <Line
            dataKey="pageViews"
            type="monotone"
            stroke="var(--color-pageViews)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="signups"
            type="monotone"
            stroke="var(--color-signups)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            dataKey="conversions"
            type="monotone"
            stroke="var(--color-conversions)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
