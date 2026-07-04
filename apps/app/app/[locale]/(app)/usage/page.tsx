import { getTranslations } from "next-intl/server"
import { cn } from "@workspace/ui/lib/utils"

import { UsageByAppDonut } from "@/components/usage/usage-by-app-donut"
import { UsageRequestsChart } from "@/components/usage/usage-requests-chart"
import { UsageStats } from "@/components/usage/usage-stats"

type PlanLimit = {
  label: string
  used: string
  limit: string
  pct: number
}

const PLAN_LIMITS: PlanLimit[] = [
  { label: "API Requests", used: "256K", limit: "500K", pct: 51 },
  { label: "Bandwidth", used: "1.2TB", limit: "2TB", pct: 60 },
  { label: "Compute Hours", used: "840h", limit: "900h", pct: 93 },
  { label: "Storage", used: "64GB", limit: "200GB", pct: 32 },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "nav" })
  return { title: t("usage") }
}

export default async function UsagePage() {
  const t = await getTranslations("nav")

  return (
    <>
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("usage")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track API consumption and resource limits across your apps.
        </p>
      </div>

      <UsageStats />

      <UsageRequestsChart />

      <div className="grid gap-4 lg:grid-cols-2">
        <UsageByAppDonut />

        {/* Plan Limits */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
          <h3 className="mb-4 text-sm font-semibold">Plan Limits</h3>
          <ul className="space-y-4">
            {PLAN_LIMITS.map((item) => (
              <li key={item.label}>
                <div className="flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {item.used} / {item.limit}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      item.pct >= 90 ? "bg-warning" : "bg-brand"
                    )}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  )
}
