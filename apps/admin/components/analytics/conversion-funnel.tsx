import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

const STAGES = [
  {
    label: "Visitors",
    users: 48932,
    pct: 100,
    barClass: "bg-brand text-brand-foreground",
  },
  {
    label: "Signups",
    users: 6842,
    pct: 13.98,
    barClass: "bg-brand/70 text-brand-foreground",
  },
  {
    label: "Trial Started",
    users: 3269,
    pct: 6.68,
    barClass: "bg-brand/45 text-foreground",
  },
  {
    label: "Paid Conversion",
    users: 1245,
    pct: 2.54,
    barClass: "bg-brand/25 text-foreground",
  },
] as const

const pctLabel = (pct: number) => `${pct.toFixed(2)}%`

export function ConversionFunnel() {
  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <h3 className="text-sm font-semibold">Conversion Funnel</h3>

      <div className="mt-4 space-y-2">
        {STAGES.map((stage) => (
          <div
            key={stage.label}
            className={`flex h-10 items-center justify-center rounded-md text-xs font-medium ${stage.barClass}`}
            style={{ width: `${stage.pct}%`, minWidth: "35%" }}
          >
            <span className="truncate px-2 tabular-nums">
              {stage.label} · {stage.users.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-0">Stage</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="pr-0 text-right">Conversion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {STAGES.map((stage) => (
              <TableRow key={stage.label}>
                <TableCell className="pl-0 text-sm font-medium">
                  {stage.label}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {stage.users.toLocaleString()}
                </TableCell>
                <TableCell className="pr-0 text-right text-muted-foreground tabular-nums">
                  {pctLabel(stage.pct)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">
          Overall Conversion Rate
        </span>
        <Badge variant="brand">2.54%</Badge>
      </div>
    </div>
  )
}
