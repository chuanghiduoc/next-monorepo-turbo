import { MoreHorizontal, Shield, UserMinus } from "lucide-react"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

type Role = "Owner" | "Admin" | "Member"
type Status = "Active" | "Pending"

type Member = {
  name: string
  email: string
  role: Role
  status: Status
  lastActive: string
}

const ROLE_VARIANT: Record<Role, "brand" | "secondary" | "outline"> = {
  Owner: "brand",
  Admin: "secondary",
  Member: "outline",
}

const STATUS_VARIANT: Record<Status, "success" | "warning"> = {
  Active: "success",
  Pending: "warning",
}

const MEMBERS: Member[] = [
  {
    name: "Jane Smith",
    email: "jane.smith@acme.dev",
    role: "Owner",
    status: "Active",
    lastActive: "2 minutes ago",
  },
  {
    name: "Michael Chen",
    email: "michael.chen@acme.dev",
    role: "Admin",
    status: "Active",
    lastActive: "1 hour ago",
  },
  {
    name: "Sofia Alvarez",
    email: "sofia.alvarez@acme.dev",
    role: "Admin",
    status: "Active",
    lastActive: "3 hours ago",
  },
  {
    name: "David Kim",
    email: "david.kim@acme.dev",
    role: "Member",
    status: "Active",
    lastActive: "1 day ago",
  },
  {
    name: "Priya Patel",
    email: "priya.patel@acme.dev",
    role: "Member",
    status: "Active",
    lastActive: "2 days ago",
  },
  {
    name: "Tom Wright",
    email: "tom.wright@acme.dev",
    role: "Member",
    status: "Pending",
    lastActive: "—",
  },
  {
    name: "Emma Johnson",
    email: "emma.johnson@acme.dev",
    role: "Member",
    status: "Active",
    lastActive: "4 days ago",
  },
  {
    name: "Liam O'Brien",
    email: "liam.obrien@acme.dev",
    role: "Member",
    status: "Pending",
    lastActive: "—",
  },
  {
    name: "Nadia Hassan",
    email: "nadia.hassan@acme.dev",
    role: "Admin",
    status: "Active",
    lastActive: "5 hours ago",
  },
  {
    name: "Carlos Mendes",
    email: "carlos.mendes@acme.dev",
    role: "Member",
    status: "Pending",
    lastActive: "—",
  },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function MembersTable() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Team Members</h3>
        <span className="text-xs text-muted-foreground tabular-nums">
          {MEMBERS.length} members
        </span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MEMBERS.map((member) => (
              <TableRow key={member.email}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{initials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={ROLE_VARIANT[member.role]}>
                    {member.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[member.status]}>
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.lastActive}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Actions for ${member.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Shield className="size-4" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem variant="destructive">
                        <UserMinus className="size-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
