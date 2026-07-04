"use client"

import { Activity, Boxes, DollarSign, Users } from "lucide-react"

import { StatCard, type Stat } from "@/components/stat-card"

const spark = (seed: number) =>
  Array.from({ length: 16 }, (_, i) =>
    Math.round(50 + Math.sin(i / 2 + seed) * 16 + i * 1.4)
  )

export function OverviewStats() {
  const period = "vs last month"
  const stats: Stat[] = [
    {
      label: "Total Apps",
      value: "12",
      delta: "+2 new",
      up: true,
      period: "this month",
      icon: Boxes,
      spark: spark(0),
    },
    {
      label: "Active Users",
      value: "1,248",
      delta: "+18.2%",
      up: true,
      period,
      icon: Users,
      spark: spark(2),
    },
    {
      label: "API Requests",
      value: "256K",
      delta: "-4.3%",
      up: false,
      period,
      icon: Activity,
      spark: spark(4),
    },
    {
      label: "Monthly Cost",
      value: "$320.50",
      delta: "-8.7%",
      up: true,
      period,
      icon: DollarSign,
      spark: spark(6),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.label} stat={s} />
      ))}
    </div>
  )
}
