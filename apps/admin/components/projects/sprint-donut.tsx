"use client"

import { Cell, Pie, PieChart } from "recharts"
import {
  type ChartConfig,
  ChartContainer,
} from "@workspace/ui/components/chart"

const SPRINT_DATA = [
  { key: "completed", name: "Completed", value: 34, color: "var(--chart-1)" },
  {
    key: "inProgress",
    name: "In Progress",
    value: 16,
    color: "var(--chart-2)",
  },
  { key: "toDo", name: "To Do", value: 10, color: "var(--chart-3)" },
  { key: "blocked", name: "Blocked", value: 2, color: "var(--chart-4)" },
] as const

const chartConfig = {
  completed: { label: "Completed", color: "var(--chart-1)" },
  inProgress: { label: "In Progress", color: "var(--chart-2)" },
  toDo: { label: "To Do", color: "var(--chart-3)" },
  blocked: { label: "Blocked", color: "var(--chart-4)" },
} satisfies ChartConfig

/** Sprint completion donut with a centered percentage and a colored-dot legend. */
export function SprintDonut() {
  return (
    <div>
      <div className="relative mx-auto aspect-square w-full max-w-[200px]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full w-full"
        >
          <PieChart>
            <Pie
              data={SPRINT_DATA}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={2}
              strokeWidth={2}
              isAnimationActive={false}
            >
              {SPRINT_DATA.map((entry) => (
                <Cell key={entry.key} fill={entry.color} stroke="var(--card)" />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">68%</span>
          <span className="text-xs text-muted-foreground">Complete</span>
        </div>
      </div>

      <ul className="mt-5 space-y-2.5">
        {SPRINT_DATA.map((entry) => (
          <li
            key={entry.key}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-medium tabular-nums">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
