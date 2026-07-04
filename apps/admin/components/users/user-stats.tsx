"use client"

import { Ban, ShieldCheck, UserPlus, Users } from "lucide-react"

import { StatCard, type Stat } from "@/components/stat-card"

/** Deterministic sparkline series (no Math.random) so SSR/CSR markup matches. */
const spark = (seed: number) =>
  Array.from({ length: 16 }, (_, i) =>
    Math.round(50 + Math.sin(i / 2 + seed) * 18 + i * 1.5)
  )

const PERIOD = "vs May 11 – Jun 9"

const STATS: Stat[] = [
  {
    label: "Total Users",
    value: "3,842",
    delta: "+8.3%",
    up: true,
    period: PERIOD,
    icon: Users,
    spark: spark(0),
  },
  {
    label: "New Signups",
    value: "268",
    delta: "+15.7%",
    up: true,
    period: PERIOD,
    icon: UserPlus,
    spark: spark(2),
  },
  {
    label: "Active Teams",
    value: "128",
    delta: "+6.1%",
    up: true,
    period: PERIOD,
    icon: ShieldCheck,
    spark: spark(4),
  },
  {
    label: "Suspended Accounts",
    value: "18",
    delta: "-10.0%",
    up: false,
    period: PERIOD,
    icon: Ban,
    spark: spark(6),
  },
]

export function UserStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((s) => (
        <StatCard key={s.label} stat={s} />
      ))}
    </div>
  )
}
