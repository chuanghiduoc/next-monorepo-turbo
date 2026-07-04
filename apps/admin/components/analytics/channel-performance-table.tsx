import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

const CHANNELS = [
  {
    channel: "Google Ads",
    impressions: 892450,
    clicks: 24680,
    ctr: "2.77%",
    conversions: 1842,
    cvr: "7.46%",
    cpa: "$18.42",
    spend: "$33,924",
    active: true,
  },
  {
    channel: "Facebook Ads",
    impressions: 654320,
    clicks: 15230,
    ctr: "2.33%",
    conversions: 986,
    cvr: "6.47%",
    cpa: "$22.15",
    spend: "$21,834",
    active: true,
  },
  {
    channel: "LinkedIn Ads",
    impressions: 128940,
    clicks: 3412,
    ctr: "2.65%",
    conversions: 412,
    cvr: "12.08%",
    cpa: "$41.20",
    spend: "$16,975",
    active: true,
  },
  {
    channel: "TwitX Ads",
    impressions: 98210,
    clicks: 1876,
    ctr: "1.91%",
    conversions: 94,
    cvr: "5.01%",
    cpa: "$38.60",
    spend: "$3,628",
    active: false,
  },
  {
    channel: "Email Campaigns",
    impressions: 245600,
    clicks: 18940,
    ctr: "7.71%",
    conversions: 2104,
    cvr: "11.11%",
    cpa: "$4.85",
    spend: "$10,204",
    active: true,
  },
  {
    channel: "Referral Program",
    impressions: 42180,
    clicks: 6542,
    ctr: "15.51%",
    conversions: 891,
    cvr: "13.62%",
    cpa: "$6.20",
    spend: "$5,524",
    active: true,
  },
] as const

export function ChannelPerformanceTable() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <h3 className="text-sm font-semibold">Channel Performance</h3>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Channel</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Clicks</TableHead>
              <TableHead className="text-right">CTR</TableHead>
              <TableHead className="text-right">Conversions</TableHead>
              <TableHead className="text-right">CVR</TableHead>
              <TableHead className="text-right">CPA</TableHead>
              <TableHead className="text-right">Spend</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CHANNELS.map((row) => (
              <TableRow key={row.channel}>
                <TableCell className="text-sm font-medium">
                  {row.channel}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.impressions.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.clicks.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.ctr}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.conversions.toLocaleString()}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.cvr}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.cpa}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {row.spend}
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant={row.active ? "success" : "warning"}>
                    {row.active ? "Active" : "Paused"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
