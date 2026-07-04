"use client"

import { AlertCircle, Flag, Folder, Users } from "lucide-react"

import { StatCard, type Stat } from "@/components/stat-card"

// Deterministic 16-point sparkline (no Math.random → SSR-safe).
const spark = (seed: number) =>
  Array.from({ length: 16 }, (_, i) =>
    Math.round(50 + Math.sin(i / 2 + seed) * 18 + i * 1.5)
  )

const PERIOD = "vs May 11 – Jun 9"

const STATS: Stat[] = [
  {
    label: "Active Projects",
    value: "18",
    delta: "+12.5%",
    up: true,
    period: PERIOD,
    icon: Folder,
    spark: spark(0),
  },
  {
    label: "Overdue Tasks",
    value: "7",
    delta: "+16.7%",
    up: false,
    period: PERIOD,
    icon: AlertCircle,
    spark: spark(2),
  },
  {
    label: "Completed Milestones",
    value: "32",
    delta: "+20.0%",
    up: true,
    period: PERIOD,
    icon: Flag,
    spark: spark(4),
  },
  {
    label: "Team Utilization",
    value: "82%",
    delta: "+4.3%",
    up: true,
    period: PERIOD,
    icon: Users,
    spark: spark(6),
  },
]

/** Client wrapper: lucide icons can't cross the RSC boundary, so the 4 KPI stats live here. */
export function ProjectStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((s) => (
        <StatCard key={s.label} stat={s} />
      ))}
    </div>
  )
}
