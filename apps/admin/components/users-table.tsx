"use client"

import { MoreHorizontal, Plus, Search, SlidersHorizontal } from "lucide-react"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Input } from "@workspace/ui/components/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

type Role = "admin" | "member" | "viewer"
type Status = "active" | "invited" | "suspended"
type Row = {
  name: string
  email: string
  role: Role
  status: Status
  joined: string
}

// Sample directory — replace with a paginated query from your admin API.
const USERS: Row[] = [
  {
    name: "Ada Lovelace",
    email: "ada@analytical.engine",
    role: "admin",
    status: "active",
    joined: "2025-01-04",
  },
  {
    name: "Grace Hopper",
    email: "grace@navy.mil",
    role: "admin",
    status: "active",
    joined: "2025-01-11",
  },
  {
    name: "Alan Turing",
    email: "alan@bletchley.uk",
    role: "member",
    status: "active",
    joined: "2025-02-02",
  },
  {
    name: "Katherine Johnson",
    email: "katherine@nasa.gov",
    role: "member",
    status: "invited",
    joined: "2025-02-19",
  },
  {
    name: "Linus Torvalds",
    email: "linus@kernel.org",
    role: "member",
    status: "active",
    joined: "2025-03-01",
  },
  {
    name: "Margaret Hamilton",
    email: "margaret@mit.edu",
    role: "viewer",
    status: "active",
    joined: "2025-03-12",
  },
  {
    name: "Dennis Ritchie",
    email: "dmr@bell-labs.com",
    role: "admin",
    status: "suspended",
    joined: "2025-03-20",
  },
  {
    name: "Barbara Liskov",
    email: "liskov@mit.edu",
    role: "viewer",
    status: "invited",
    joined: "2025-04-02",
  },
  {
    name: "Ken Thompson",
    email: "ken@bell-labs.com",
    role: "member",
    status: "active",
    joined: "2025-04-15",
  },
  {
    name: "Radia Perlman",
    email: "radia@spanning.tree",
    role: "viewer",
    status: "active",
    joined: "2025-05-01",
  },
  {
    name: "Guido van Rossum",
    email: "guido@python.org",
    role: "member",
    status: "active",
    joined: "2025-05-18",
  },
  {
    name: "Bjarne Stroustrup",
    email: "bjarne@cpp.org",
    role: "viewer",
    status: "suspended",
    joined: "2025-06-07",
  },
]

const PAGE_SIZE = 8

const STATUS_VARIANT: Record<Status, "success" | "warning" | "destructive"> = {
  active: "success",
  invited: "warning",
  suspended: "destructive",
}

export function UsersTable() {
  const t = useTranslations("users")
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return USERS
    return USERS.filter(
      (u) =>
        u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  }, [query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const rows = filtered.slice(
    current * PAGE_SIZE,
    current * PAGE_SIZE + PAGE_SIZE
  )
  const from = filtered.length === 0 ? 0 : current * PAGE_SIZE + 1
  const to = current * PAGE_SIZE + rows.length

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder={t("search")}
            className="h-10 pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-10">
            <SlidersHorizontal className="size-4" />
            {t("filter")}
          </Button>
          <Button size="sm" className="h-10">
            <Plus className="size-4" />
            {t("add")}
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6">{t("columns.user")}</TableHead>
            <TableHead>{t("columns.role")}</TableHead>
            <TableHead>{t("columns.status")}</TableHead>
            <TableHead>{t("columns.joined")}</TableHead>
            <TableHead className="pr-6 text-right">
              {t("columns.actions")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((u) => (
            <TableRow key={u.email}>
              <TableCell className="pl-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs font-semibold uppercase">
                    {u.name.slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={u.role === "admin" ? "brand" : "secondary"}>
                  {t(`roles.${u.role}`)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={STATUS_VARIANT[u.status]}>
                  {t(`status.${u.status}`)}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {u.joined}
              </TableCell>
              <TableCell className="pr-6 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      aria-label={t("columns.actions")}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{t("columns.user")}</DropdownMenuItem>
                    <DropdownMenuItem>{t("roles.admin")}</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive">
                      {t("status.suspended")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border p-4 sm:flex-row">
        <p className="font-mono text-xs text-muted-foreground">
          {t("showing", { from, to, total: filtered.length })}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={current === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            {t("prev")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={current >= pageCount - 1}
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  )
}
