import { Flag } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { ProjectStats } from "@/components/projects/project-stats"
import { SprintDonut } from "@/components/projects/sprint-donut"

type DeliveryStatus = "onTrack" | "atRisk" | "behind"

const STATUS_META: Record<
  DeliveryStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  onTrack: { label: "On Track", variant: "success" },
  atRisk: { label: "At Risk", variant: "warning" },
  behind: { label: "Behind", variant: "destructive" },
}

type Project = {
  name: string
  category: string
  swatch: string
  owner: string
  progress: number
  status: DeliveryStatus
  due: string
  tasksDone: number
  tasksTotal: number
  assignees: string[]
}

const PROJECTS: Project[] = [
  {
    name: "Website Redesign",
    category: "Marketing",
    swatch: "bg-brand/15 text-brand",
    owner: "Olivia Bennett",
    progress: 72,
    status: "onTrack",
    due: "Jun 18, 2025",
    tasksDone: 18,
    tasksTotal: 24,
    assignees: ["Olivia Bennett", "Liam Carter", "Ava Patel"],
  },
  {
    name: "Mobile App",
    category: "Product",
    swatch: "bg-[var(--chart-2)]/15 text-[var(--chart-2)]",
    owner: "Liam Carter",
    progress: 45,
    status: "atRisk",
    due: "Jun 22, 2025",
    tasksDone: 11,
    tasksTotal: 24,
    assignees: ["Liam Carter", "Noah Williams"],
  },
  {
    name: "Data Dashboard",
    category: "Analytics",
    swatch: "bg-[var(--chart-3)]/15 text-[var(--chart-3)]",
    owner: "Ava Patel",
    progress: 90,
    status: "onTrack",
    due: "Jun 10, 2025",
    tasksDone: 22,
    tasksTotal: 24,
    assignees: ["Ava Patel", "Emma Johnson", "Olivia Bennett"],
  },
  {
    name: "Payment Gateway",
    category: "Engineering",
    swatch: "bg-[var(--chart-4)]/15 text-[var(--chart-4)]",
    owner: "Noah Williams",
    progress: 60,
    status: "onTrack",
    due: "Jun 25, 2025",
    tasksDone: 15,
    tasksTotal: 25,
    assignees: ["Noah Williams", "Liam Carter"],
  },
  {
    name: "Security Audit",
    category: "Compliance",
    swatch: "bg-warning/15 text-warning",
    owner: "Emma Johnson",
    progress: 30,
    status: "atRisk",
    due: "Jul 2, 2025",
    tasksDone: 6,
    tasksTotal: 20,
    assignees: ["Emma Johnson", "Ava Patel"],
  },
  {
    name: "API Integration",
    category: "Engineering",
    swatch: "bg-destructive/10 text-destructive",
    owner: "Olivia Bennett",
    progress: 15,
    status: "behind",
    due: "Jun 15, 2025",
    tasksDone: 3,
    tasksTotal: 20,
    assignees: ["Olivia Bennett", "Noah Williams", "Emma Johnson"],
  },
]

type Milestone = {
  name: string
  project: string
  due: string
  status: DeliveryStatus
  completion: number
}

const MILESTONES: Milestone[] = [
  {
    name: "Design System v2",
    project: "Website Redesign",
    due: "Jun 15, 2025",
    status: "onTrack",
    completion: 85,
  },
  {
    name: "Beta Launch",
    project: "Mobile App",
    due: "Jun 20, 2025",
    status: "atRisk",
    completion: 40,
  },
  {
    name: "Q2 Data Migration",
    project: "Data Dashboard",
    due: "Jun 25, 2025",
    status: "onTrack",
    completion: 95,
  },
  {
    name: "PCI Compliance Review",
    project: "Payment Gateway",
    due: "Jul 1, 2025",
    status: "onTrack",
    completion: 55,
  },
  {
    name: "Pen Test Remediation",
    project: "Security Audit",
    due: "Jul 5, 2025",
    status: "behind",
    completion: 20,
  },
]

type ActivityItem = {
  who: string
  action: string
  ago: string
}

const ACTIVITY: ActivityItem[] = [
  {
    who: "Olivia Bennett",
    action: "moved “Homepage Hero” to Done",
    ago: "12m ago",
  },
  {
    who: "Liam Carter",
    action: "commented on “API Auth Flow”",
    ago: "45m ago",
  },
  {
    who: "Ava Patel",
    action: "completed milestone “Q2 Data Migration”",
    ago: "2h ago",
  },
  {
    who: "Noah Williams",
    action: "opened task “Refactor Checkout”",
    ago: "5h ago",
  },
  {
    who: "Emma Johnson",
    action: "flagged “Security Audit” as at risk",
    ago: "1d ago",
  },
]

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "nav" })
  return { title: t("projects") }
}

export default function ProjectsPage() {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track delivery progress, manage tasks, and ensure team execution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">Filters</Button>
          <Button>New Project</Button>
        </div>
      </div>

      <ProjectStats />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Active Projects */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03] lg:col-span-2">
          <h3 className="text-sm font-semibold">Active Projects</h3>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-0">Project</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead className="pr-0">Assignees</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROJECTS.map((project) => {
                  const status = STATUS_META[project.status]
                  return (
                    <TableRow key={project.name}>
                      <TableCell className="pl-0">
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "grid size-8 shrink-0 place-items-center rounded-md text-xs font-semibold",
                              project.swatch
                            )}
                          >
                            {project.name[0]}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {project.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {project.category}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarFallback>
                              {initials(project.owner)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{project.owner}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex w-32 items-center gap-2">
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-brand"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {project.progress}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {project.due}
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {project.tasksDone} / {project.tasksTotal}
                      </TableCell>
                      <TableCell className="pr-0">
                        <div className="flex -space-x-2">
                          {project.assignees.map((assignee) => (
                            <Avatar
                              key={assignee}
                              size="sm"
                              className="ring-2 ring-card"
                            >
                              <AvatarFallback>
                                {initials(assignee)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm">
              View All Projects
            </Button>
          </div>
        </div>

        {/* Sprint Progress */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
          <h3 className="text-sm font-semibold">Sprint Progress</h3>
          <div className="mt-4">
            <SprintDonut />
          </div>
          <div className="mt-5">
            <Button variant="outline" size="sm" className="w-full">
              View Sprint Board
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Upcoming Milestones */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03] lg:col-span-2">
          <h3 className="text-sm font-semibold">Upcoming Milestones</h3>
          <div className="mt-4 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-0">Milestone</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-0">Completion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MILESTONES.map((milestone) => {
                  const status = STATUS_META[milestone.status]
                  return (
                    <TableRow key={milestone.name}>
                      <TableCell className="pl-0">
                        <div className="flex items-center gap-2.5">
                          <Flag className="size-4 shrink-0 text-brand" />
                          <span className="text-sm font-medium">
                            {milestone.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {milestone.project}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {milestone.due}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="pr-0">
                        <div className="flex w-32 items-center gap-2">
                          <div className="h-1.5 w-full rounded-full bg-muted">
                            <div
                              className="h-1.5 rounded-full bg-brand"
                              style={{ width: `${milestone.completion}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {milestone.completion}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Task Activity */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs shadow-black/[0.03]">
          <h3 className="text-sm font-semibold">Task Activity</h3>
          <div className="mt-4 space-y-4">
            {ACTIVITY.map((item) => (
              <div key={item.who + item.ago} className="flex items-start gap-3">
                <Avatar size="sm" className="mt-0.5">
                  <AvatarFallback>{initials(item.who)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{item.who}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 pt-0.5">
                  <span className="font-mono text-xs text-muted-foreground">
                    {item.ago}
                  </span>
                  <span className="size-1.5 rounded-full bg-brand" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
