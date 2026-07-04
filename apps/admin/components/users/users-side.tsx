"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

type ActivityItem = {
  who: string
  action: string
  ago: string
}

type DonutSlice = {
  name: string
  value: number
  pct: string
  color: string
}

const ACTIVITY: ActivityItem[] = [
  {
    who: "Liam Carter",
    action: "invited 3 new members to the workspace",
    ago: "2h ago",
  },
  {
    who: "Olivia Bennett",
    action: "approved a pending access request",
    ago: "4h ago",
  },
  { who: "Ava Patel", action: "updated user role to Admin", ago: "6h ago" },
  {
    who: "Noah Williams",
    action: "suspended an account for policy violation",
    ago: "1d ago",
  },
  { who: "Emma Johnson", action: "created team “Growth Squad”", ago: "2d ago" },
]

const PLAN_DATA: DonutSlice[] = [
  { name: "Pro", value: 1482, pct: "38.6%", color: "var(--chart-1)" },
  { name: "Team", value: 1236, pct: "32.2%", color: "var(--chart-2)" },
  { name: "Basic", value: 1124, pct: "29.2%", color: "var(--chart-3)" },
]

const ROLE_DATA: DonutSlice[] = [
  { name: "Admin", value: 214, pct: "5.6%", color: "var(--chart-1)" },
  { name: "Manager", value: 658, pct: "17.1%", color: "var(--chart-2)" },
  { name: "Member", value: 2970, pct: "77.3%", color: "var(--chart-3)" },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function ActivityFeed() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <h3 className="text-sm font-semibold">Activity Feed</h3>
      <div className="mt-4 space-y-4">
        {ACTIVITY.map((item) => (
          <div key={item.who + item.ago} className="flex items-start gap-3">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary font-mono text-[10px] font-semibold uppercase">
              {initials(item.who)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                <span className="font-medium">{item.who}</span>{" "}
                <span className="text-muted-foreground">{item.action}</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {item.ago}
              </span>
              <span className="size-1.5 rounded-full bg-brand" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DonutCard({ title, data }: { title: string; data: DonutSlice[] }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mx-auto mt-2 h-[160px] w-[160px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 space-y-2.5">
        {data.map((slice) => (
          <div
            key={slice.name}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate text-muted-foreground">
                {slice.name}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-2 tabular-nums">
              <span className="font-medium">
                {slice.value.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">{slice.pct}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Right rail for the Users page: recent activity + plan/role distribution donuts. */
export function UsersSide() {
  return (
    <div className="space-y-4">
      <ActivityFeed />
      <DonutCard title="Users by Plan" data={PLAN_DATA} />
      <DonutCard title="Users by Role" data={ROLE_DATA} />
    </div>
  )
}
