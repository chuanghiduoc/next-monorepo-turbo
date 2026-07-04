"use client"

import { DollarSign, Gauge, ShieldCheck, Users } from "lucide-react"
import { useTranslations } from "next-intl"

import { StatCard, type Stat } from "@/components/stat-card"

const spark = (seed: number) =>
  Array.from({ length: 16 }, (_, i) =>
    Math.round(50 + Math.sin(i / 2 + seed) * 18 + i * 1.5)
  )

export function OverviewStats() {
  const t = useTranslations("overview")
  const period = t("period")

  const stats: Stat[] = [
    {
      label: t("stats.revenue"),
      value: "$24,590",
      delta: "+12.5%",
      up: true,
      period,
      icon: DollarSign,
      spark: spark(0),
    },
    {
      label: t("stats.users"),
      value: "3,842",
      delta: "+8.3%",
      up: true,
      period,
      icon: Users,
      spark: spark(2),
    },
    {
      label: t("stats.conversion"),
      value: "7.41%",
      delta: "+1.2%",
      up: true,
      period,
      icon: Gauge,
      spark: spark(4),
    },
    {
      label: t("stats.uptime"),
      value: "99.97%",
      delta: "+0.02%",
      up: true,
      period,
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
