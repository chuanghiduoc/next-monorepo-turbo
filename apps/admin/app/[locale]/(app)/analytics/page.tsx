import { Button } from "@workspace/ui/components/button"

import { AnalyticsStats } from "@/components/analytics/analytics-stats"
import { PerformanceTrends } from "@/components/analytics/analytics-charts"
import { ChannelPerformanceTable } from "@/components/analytics/channel-performance-table"
import { ConversionFunnel } from "@/components/analytics/conversion-funnel"
import { RegionalPerformance } from "@/components/analytics/regional-performance"
import { TrafficSource } from "@/components/analytics/traffic-source"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await (
    await import("next-intl/server")
  ).getTranslations({ locale, namespace: "nav" })
  return { title: t("analytics") }
}

export default function AnalyticsPage() {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Performance insights and growth metrics across your platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Filters</Button>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      <AnalyticsStats />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <PerformanceTrends />
        </div>
        <div className="lg:col-span-2">
          <ConversionFunnel />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrafficSource />
        <RegionalPerformance />
      </div>

      <ChannelPerformanceTable />
    </>
  )
}
