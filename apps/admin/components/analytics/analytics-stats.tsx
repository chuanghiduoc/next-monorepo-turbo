"use client"

import { Clock, DollarSign, ShieldCheck, Users } from "lucide-react"

import { StatCard, type Stat } from "@/components/stat-card"

/** Deterministic sparkline series (no Math.random) so SSR/CSR markup matches. */
const spark = (seed: number) =>
  Array.from({ length: 16 }, (_, i) =>
    Math.round(50 + Math.sin(i / 2 + seed) * 18 + i * 1.5)
  )

const PERIOD = "vs May 11 – Jun 9"

const STATS: Stat[] = [
  {
    label: "Total Visitors",
    value: "48,932",
    delta: "+16.3%",
    up: true,
    period: PERIOD,
    icon: Users,
    spark: spark(0),
  },
  {
    label: "Monthly Recurring Revenue",
    value: "$62,480",
    delta: "+12.8%",
    up: true,
    period: PERIOD,
    icon: DollarSign,
    spark: spark(2),
  },
  {
    label: "Churn Rate",
    value: "2.31%",
    delta: "-0.42pp",
    up: false,
    period: PERIOD,
    icon: ShieldCheck,
    spark: spark(4),
  },
  {
    label: "Avg. Session Duration",
    value: "4m 32s",
    delta: "+8.7%",
    up: true,
    period: PERIOD,
    icon: Clock,
    spark: spark(6),
  },
]

export function AnalyticsStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((s) => (
        <StatCard key={s.label} stat={s} />
      ))}
    </div>
  )
}
