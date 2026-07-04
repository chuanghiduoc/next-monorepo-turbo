import { Calendar, Check, ChevronDown } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"

import { ApiRequestsChart } from "@/components/overview/api-requests-chart"
import { OverviewStats } from "@/components/overview/overview-stats"
import { UsageDonut } from "@/components/overview/usage-donut"
import { getServerSession } from "@/lib/auth-server"

const APPS = [
  {
    name: "Marketing Landing Page",
    tech: "Next.js",
    env: "Production",
    color: "var(--chart-1)",
  },
  {
    name: "Customer Portal",
    tech: "React",
    env: "Production",
    color: "var(--chart-2)",
  },
  {
    name: "Internal Dashboard",
    tech: "Next.js",
    env: "Staging",
    color: "var(--chart-3)",
  },
  {
    name: "AI Image Generator",
    tech: "Python",
    env: "Development",
    color: "var(--chart-4)",
  },
  {
    name: "Data Processing API",
    tech: "Go",
    env: "Production",
    color: "var(--chart-5)",
  },
]

const ENV_VARIANT: Record<string, "success" | "warning" | "brand"> = {
  Production: "success",
  Staging: "warning",
  Development: "brand",
}

const PLAN_FEATURES = [
  "Unlimited API requests",
  "Up to 10 team members",
  "Advanced analytics",
  "Priority support",
]

const ACTIVITY = [
  {
    what: "API key generated for Marketing Landing Page",
    ago: "2 minutes ago",
  },
  { what: "New team member Jane Smith joined", ago: "1 hour ago" },
  { what: "Payment of $49.00 succeeded", ago: "1 day ago" },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "nav" })
  return { title: t("overview") }
}

export default async function OverviewPage() {
  const session = await getServerSession()
  const t = await getTranslations("nav")
  const firstName = session?.user.name?.split(" ")[0] ?? "there"

  return (
    <>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {t("overview")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {firstName}! Here&apos;s what&apos;s happening with
            your account today.
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2 font-normal">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="tabular-nums">May 12 – Jun 12, 2025</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </div>

      <OverviewStats />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ApiRequestsChart />
        </div>
        {/* Recent Apps */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Apps</h3>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              View all
            </Button>
          </div>
          <ul className="space-y-1">
            {APPS.map((app) => (
              <li
                key={app.name}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-lg font-mono text-xs font-bold text-white"
                  style={{ backgroundColor: app.color }}
                >
                  {app.name.slice(0, 1)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{app.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {app.tech}
                  </p>
                </div>
                <Badge variant={ENV_VARIANT[app.env]}>{app.env}</Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <UsageDonut />
          {/* Recent Activity */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Recent Activity</h3>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                View all
              </Button>
            </div>
            <ul className="space-y-3">
              {ACTIVITY.map((item) => (
                <li
                  key={item.what}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                    <span className="truncate">{item.what}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {item.ago}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Current Plan */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
          <h3 className="text-sm font-semibold">Current Plan</h3>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
              <Check className="size-5" strokeWidth={3} />
            </span>
            <div>
              <p className="font-heading text-lg font-semibold">Pro Plan</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">
                  $49
                </span>{" "}
                / month
              </p>
            </div>
          </div>
          <ul className="mt-5 space-y-2.5 border-t border-border pt-5">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <Check
                  className="size-4 shrink-0 text-success"
                  strokeWidth={3}
                />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="mt-5 w-full">
            Manage Plan
          </Button>
        </div>
      </div>
    </>
  )
}
