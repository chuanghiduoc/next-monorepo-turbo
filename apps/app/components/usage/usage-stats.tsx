"use client"

import { Activity, Cpu, Database, Network } from "lucide-react"

import { StatCard, type Stat } from "@/components/stat-card"

const spark = (seed: number) =>
  Array.from({ length: 16 }, (_, i) =>
    Math.round(50 + Math.sin(i / 2 + seed) * 16 + i * 1.4)
  )

export function UsageStats() {
  const period = "vs last month"
  const stats: Stat[] = [
    {
      label: "API Requests",
      value: "256K",
      delta: "+12.4%",
      up: true,
      period,
      icon: Activity,
      spark: spark(0),
    },
    {
      label: "Bandwidth",
      value: "1.2TB",
      delta: "+6.1%",
      up: true,
      period,
      icon: Network,
      spark: spark(2),
    },
    {
      label: "Compute",
      value: "840h",
      delta: "+18.9%",
      up: true,
      period,
      icon: Cpu,
      spark: spark(4),
    },
    {
      label: "Storage",
      value: "64GB",
      delta: "+3.5%",
      up: true,
      period,
      icon: Database,
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
