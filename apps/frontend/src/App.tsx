import { Link } from "@tanstack/react-router"
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  ReceiptTextIcon,
  TicketIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { NotificationsBell } from "@/components/notifications-bell"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { useCurrentUser } from "@/services/auth/auth.service"
import type { InvoiceStatus } from "@/services/invoices/invoices.service"
import type { ProjectStatus } from "@/services/projects/projects.service"
import type { TicketPriority, TicketStatus } from "@/services/tickeds/tickeds.service"
import { useDashboardSummary } from "@/services/dashboard/dashboard.service"

const metricIcons = [FolderKanbanIcon, TicketIcon, ReceiptTextIcon, CheckCircle2Icon]

type BadgeConfig = {
  label: string
  className: string
}

const projectStatusConfig: Record<ProjectStatus, BadgeConfig> = {
  EN_PROGRESO: { label: "En progreso", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  EN_REVISION: { label: "En revisión", className: "border-red-200 bg-red-50 text-yellow-700" },
  PLANIFICACION: { label: "Planificación", className: "border-blue-200 bg-blue-50 text-blue-700" },
  COMPLETADO: { label: "Completado", className: "border-green-200 bg-green-50 text-green-700" },
}

const ticketStatusConfig: Record<TicketStatus, BadgeConfig> = {
  ABIERTO: { label: "Abierto", className: "border-blue-200 bg-blue-50 text-blue-700" },
  EN_PROCESO: { label: "En proceso", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  RESUELTO: { label: "Resuelto", className: "border-green-200 bg-green-50 text-green-700" },
}

const priorityConfig: Record<TicketPriority, BadgeConfig> = {
  ALTA: { label: "Alta", className: "border-red-200 bg-red-50 text-red-700" },
  MEDIA: { label: "Media", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  BAJA: { label: "Baja", className: "border-green-200 bg-green-50 text-green-700" },
}

const invoiceStatusConfig: Record<InvoiceStatus, BadgeConfig> = {
  PENDIENTE: { label: "Pendiente", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  VENCIDA: { label: "Vencida", className: "border-red-200 bg-red-50 text-red-700" },
  PAGADA: { label: "Pagada", className: "border-green-200 bg-green-50 text-green-700" },
}

export function App() {
  const dashboardQuery = useDashboardSummary()
  const currentUserQuery = useCurrentUser()
  const isAdmin = currentUserQuery.data?.role === "ADMIN"

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <h1 className="truncate text-lg font-semibold">Dashboard</h1>
                <p className="truncate text-sm text-muted-foreground">
                  Pulso operativo de proyectos y tickets
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <NotificationsBell />
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-5 bg-muted/35 p-4 md:p-6">
            {dashboardQuery.isError ? (
              <Card className="rounded-2xl border-destructive/30 bg-destructive/5">
                <CardContent className="flex items-center gap-3 p-4 text-sm text-destructive">
                  <AlertCircleIcon className="size-4" />
                  No se pudo cargar el dashboard desde la API.
                </CardContent>
              </Card>
            ) : null}

            <section className="grid gap-4 md:grid-cols-3">
              {dashboardQuery.isLoading
                ? Array.from({ length: 3 }).map((_, index) => <MetricSkeleton key={index} />)
                : dashboardQuery.data?.metrics.map((metric, index) => {
                    const Icon = metricIcons[index] ?? LayoutDashboardIcon

                    return (
                      <Card key={metric.label} className="rounded-2xl bg-card">
                        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                          <div className="space-y-2">
                            <CardDescription>{metric.label}</CardDescription>
                            <CardTitle className="text-4xl font-semibold tabular-nums">
                              {metric.value}
                            </CardTitle>
                          </div>
                          <span className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <Icon className="size-4" />
                          </span>
                        </CardHeader>
                        <CardContent className="pt-0 text-sm text-muted-foreground">
                          {metric.helper}
                        </CardContent>
                      </Card>
                    )
                  })}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-2xl bg-card">
                <CardHeader>
                  <CardTitle>Proyectos activos</CardTitle>
                  <CardDescription>
                    Avance calculado por tickets resueltos dentro de cada proyecto.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {dashboardQuery.isLoading ? (
                    <ListSkeleton rows={4} />
                  ) : dashboardQuery.data?.activeProjects.length ? (
                    dashboardQuery.data.activeProjects.map((project) => {
                      const status = projectStatusConfig[project.status]

                      return (
                        <Link
                          key={project.id}
                          to="/projects"
                          search={isAdmin ? { editProject: project.id } : { viewProject: project.id }}
                          className="block rounded-xl border bg-background/60 p-4 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-1">
                              <p className="truncate font-semibold">{project.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {project.resolvedTickets}/{project.totalTickets} tickets resueltos · vence {formatDate(project.dateLimit)}
                              </p>
                            </div>
                            <Badge variant="outline" className={status.className}>{status.label}</Badge>
                          </div>
                          <div className="mt-4 flex items-center gap-3">
                            <div className="h-2 flex-1 rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="w-10 text-right text-sm font-medium tabular-nums text-muted-foreground">
                              {project.progress}%
                            </span>
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <EmptyState message="No hay proyectos activos." />
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-card">
                <CardHeader>
                  <CardTitle>Facturas recientes</CardTitle>
                  <CardDescription>Estado de los últimos documentos emitidos.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col divide-y p-0">
                  {dashboardQuery.isLoading ? (
                    <div className="flex flex-col gap-3 p-4">
                      <ListSkeleton rows={3} />
                    </div>
                  ) : dashboardQuery.data?.recentInvoices.length ? (
                    dashboardQuery.data.recentInvoices.map((invoice) => {
                      const status = invoiceStatusConfig[invoice.status]

                      return (
                        <Link
                          key={invoice.id}
                          to="/invoices"
                          search={{ editInvoice: invoice.id }}
                          className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <div className="min-w-0 space-y-1">
                            <p className="font-mono text-sm text-muted-foreground">{invoice.id}</p>
                            <p className="truncate font-semibold">{invoice.concept}</p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <p className="text-lg font-semibold tabular-nums">
                              {formatCurrency(invoice.amount)}
                            </p>
                            <Badge variant="outline" className={status.className}>{status.label}</Badge>
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <div className="p-4">
                      <EmptyState message="No hay facturas recientes." />
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="rounded-2xl bg-card">
                <CardHeader>
                  <CardTitle>Tickets recientes</CardTitle>
                  <CardDescription>Últimas solicitudes registradas o asignadas.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {dashboardQuery.isLoading ? (
                    <ListSkeleton rows={6} />
                  ) : dashboardQuery.data?.recentTickets.length ? (
                    dashboardQuery.data.recentTickets.map((ticket) => {
                      const status = ticketStatusConfig[ticket.status]
                      const priority = priorityConfig[ticket.priority]

                      return (
                        <Link
                          key={ticket.id}
                          to="/tickeds"
                          search={{ editTicked: ticket.id }}
                          className="block rounded-2xl border bg-background/80 p-4 shadow-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:rounded-xl md:p-3 md:shadow-none"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 space-y-2">
                              <span className="font-mono text-sm text-muted-foreground md:text-xs">
                                {ticket.id}
                              </span>
                              <p className="line-clamp-2 text-base font-semibold leading-snug md:truncate md:text-sm">
                                {ticket.title}
                              </p>
                            </div>
                            <Badge variant="outline" className={`shrink-0 ${status.className}`}>
                              {status.label}
                            </Badge>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground md:mt-3 md:text-xs">
                            <Badge variant="outline" className={priority.className}>{priority.label}</Badge>
                            <span>·</span>
                            <span className="truncate">{ticket.projectName}</span>
                            <span>·</span>
                            <span>{formatDate(ticket.createdAt)}</span>
                          </div>
                        </Link>
                      )
                    })
                  ) : (
                    <EmptyState message="No hay tickets recientes." />
                  )}
                </CardContent>
              </Card>
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function MetricSkeleton() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-40" />
      </CardContent>
    </Card>
  )
}

function ListSkeleton({ rows }: { rows: number }) {
  return Array.from({ length: rows }).map((_, index) => (
    <div key={index} className="rounded-xl border p-4">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-3 h-3 w-1/2" />
    </div>
  ))
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
