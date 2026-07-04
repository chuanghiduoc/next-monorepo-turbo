"use client"

import { ShieldCheck, UserCheck, UserPlus, Users } from "lucide-react"

import { StatCard, type Stat } from "@/components/stat-card"

const spark = (seed: number) =>
  Array.from({ length: 16 }, (_, i) =>
    Math.round(50 + Math.sin(i / 2 + seed) * 16 + i * 1.4)
  )

export function MembersStats() {
  const stats: Stat[] = [
    {
      label: "Total Members",
      value: "24",
      delta: "+3",
      up: true,
      period: "this month",
      icon: Users,
      spark: spark(0),
    },
    {
      label: "Active",
      value: "21",
      delta: "+2",
      up: true,
      period: "vs last month",
      icon: UserCheck,
      spark: spark(2),
    },
    {
      label: "Pending Invites",
      value: "3",
      delta: "-1",
      up: false,
      period: "vs last month",
      icon: UserPlus,
      spark: spark(4),
    },
    {
      label: "Admins",
      value: "4",
      delta: "+0",
      up: true,
      period: "vs last month",
      icon: ShieldCheck,
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
