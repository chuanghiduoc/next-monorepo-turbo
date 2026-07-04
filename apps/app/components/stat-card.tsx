"use client"

import { Info } from "lucide-react"
import type { ComponentType } from "react"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import { cn } from "@workspace/ui/lib/utils"

export type Stat = {
  label: string
  value: string
  delta: string
  up: boolean
  period: string
  icon: ComponentType<{ className?: string }>
  spark: number[]
}

/** KPI card: label + info, icon chip, big metric, delta, and a mini sparkline. */
export function StatCard({ stat }: { stat: Stat }) {
  const { label, value, delta, up, period, icon: Icon, spark } = stat
  const data = spark.map((v, i) => ({ i, v }))

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03] transition-colors hover:border-brand/40">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <Info className="size-3.5 text-muted-foreground/50" />
        </div>
        <span className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground">
          <Icon className="size-4" />
        </span>
      </div>

      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-xs">
          <span
            className={cn(
              "font-medium tabular-nums",
              up ? "text-success" : "text-destructive"
            )}
          >
            {delta}
          </span>{" "}
          <span className="text-muted-foreground">{period}</span>
        </p>
        <div className="h-9 w-24 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="v"
                stroke="var(--brand)"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
