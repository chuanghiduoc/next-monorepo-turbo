"use client"

import { useTranslations } from "next-intl"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  XAxis,
  YAxis,
} from "recharts"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart"

// Deterministic 29-day series (May 12 → Jun 9), no Math.random → SSR-safe.
const TREND = Array.from({ length: 29 }, (_, i) => {
  const day = i + 12
  const label = day > 31 ? `Jun ${day - 31}` : `May ${day}`
  return {
    label,
    revenue: Math.round(24000 + Math.sin(i / 3.5) * 8000 + i * 260),
    users: Math.round(2600 + Math.cos(i / 4) * 500 + i * 40),
  }
})

const SOURCES = [
  { name: "Direct", value: 13200 },
  { name: "Organic", value: 10400 },
  { name: "Paid", value: 15100 },
  { name: "Referrals", value: 5200 },
  { name: "Social", value: 2400 },
  { name: "Email", value: 6800 },
]

const usd = (n: number) => `$${(n / 1000).toFixed(0)}K`

export function PerformanceTrends() {
  const t = useTranslations("overview")
  const config = {
    revenue: { label: t("trendsRevenue"), color: "var(--chart-1)" },
    users: { label: t("trendsUsers"), color: "var(--chart-2)" },
  } satisfies ChartConfig

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{t("trends")}</h3>
          <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-[var(--chart-1)]" />
              {t("trendsRevenue")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded border-t-2 border-dashed border-[var(--chart-2)]" />
              {t("trendsUsers")}
            </span>
          </div>
        </div>
        <span className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground">
          Daily
        </span>
      </div>
      <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
        <AreaChart data={TREND} margin={{ left: 4, right: 4 }}>
          <defs>
            <linearGradient id="orbRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-revenue)"
                stopOpacity={0.25}
              />
              <stop
                offset="95%"
                stopColor="var(--color-revenue)"
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
            tickFormatter={usd}
          />
          <ChartTooltip
            cursor
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Area
            dataKey="revenue"
            type="monotone"
            stroke="var(--color-revenue)"
            strokeWidth={2}
            fill="url(#orbRevenue)"
          />
          <Line
            dataKey="users"
            type="monotone"
            stroke="var(--color-users)"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}

export function RevenueBySource() {
  const t = useTranslations("overview")
  const config = {
    value: { label: t("revenueBySource"), color: "var(--chart-1)" },
  } satisfies ChartConfig

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{t("revenueBySource")}</h3>
        <span className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground">
          This Month
        </span>
      </div>
      <ChartContainer config={config} className="aspect-auto h-[240px] w-full">
        <BarChart data={SOURCES} margin={{ left: 4, right: 4 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={usd}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <Bar
            dataKey="value"
            fill="var(--color-value)"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
