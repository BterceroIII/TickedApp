import {
  ActivityIcon,
  AlertCircleIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  CreditCardIcon,
  FileTextIcon,
  FolderKanbanIcon,
  MessageSquarePlusIcon,
  TrendingUpIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { NotificationsBell } from "@/components/notifications-bell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

const summaryCards = [
  {
    title: "Proyectos activos",
    value: "6",
    detail: "2 entregas esta semana",
    icon: FolderKanbanIcon,
    trend: "+2",
  },
  {
    title: "Facturas pendientes",
    value: "$12,480",
    detail: "3 documentos por aprobar",
    icon: CreditCardIcon,
    trend: "7 días",
  },
  {
    title: "Tickets abiertos",
    value: "14",
    detail: "4 requieren respuesta",
    icon: AlertCircleIcon,
    trend: "SLA 92%",
  },
]

const projects = [
  {
    name: "Portal ecommerce B2B",
    phase: "Desarrollo",
    progress: "72%",
    date: "18 Jun",
  },
  {
    name: "Integración Odoo CRM",
    phase: "Discovery",
    progress: "38%",
    date: "24 Jun",
  },
  {
    name: "Campaña inbound Q3",
    phase: "Aprobación",
    progress: "91%",
    date: "12 Jun",
  },
]

const tickets = [
  {
    id: "TK-2048",
    title: "Ajuste de permisos para usuarios externos",
    status: "En revisión",
    time: "Hace 25 min",
  },
  {
    id: "TK-2043",
    title: "Error intermitente al descargar reportes",
    status: "Abierto",
    time: "Hace 2 h",
  },
  {
    id: "TK-2037",
    title: "Solicitud de nuevo dashboard comercial",
    status: "Planificado",
    time: "Ayer",
  },
]

const invoices = [
  { id: "FAC-1042", concept: "Sprint mayo", amount: "$4,800" },
  { id: "FAC-1047", concept: "Horas soporte", amount: "$1,280" },
  { id: "FAC-1051", concept: "Licencias marketing", amount: "$6,400" },
]

export function App() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">Dashboard</h2>
                <p className="text-sm text-muted-foreground">Resumen general de proyectos y tickets</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <NotificationsBell />
                <Button>
                  <MessageSquarePlusIcon data-icon="inline-start" />
                  Nuevo ticket
                </Button>
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <section className="overflow-hidden rounded-3xl border bg-card">
              <div className="grid gap-6 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-8">
                <div className="flex flex-col justify-between gap-8">
                  <div className="flex flex-col gap-4">
                    <Badge variant="secondary" className="w-fit">
                      Portal Cliente
                    </Badge>
                    <div className="flex flex-col gap-3">
                      <h1 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
                        Buen día, Sofía. Tus proyectos avanzan según lo planeado.
                      </h1>
                      <p className="max-w-xl text-muted-foreground">
                        Revisa entregables, facturas y tickets desde una vista centralizada conectada al flujo operativo de la agencia.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button>
                      <FileTextIcon data-icon="inline-start" />
                      Ver reportes
                    </Button>
                    <Button variant="outline">
                      <CalendarDaysIcon data-icon="inline-start" />
                      Agendar reunión
                    </Button>
                  </div>
                </div>
                <Card className="bg-muted/35">
                  <CardHeader>
                    <CardTitle>Próximo hito</CardTitle>
                    <CardDescription>Entrega de wireframes aprobables</CardDescription>
                    <CardAction>
                      <Badge>Viernes</Badge>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-4xl font-semibold">82%</p>
                        <p className="text-sm text-muted-foreground">avance del sprint actual</p>
                      </div>
                      <ActivityIcon className="text-muted-foreground" />
                    </div>
                    <div className="h-2 rounded-full bg-background">
                      <div className="h-full w-[82%] rounded-full bg-primary" />
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between text-sm text-muted-foreground">
                    <span>Última actualización</span>
                    <span>Hoy 10:45</span>
                  </CardFooter>
                </Card>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {summaryCards.map((item) => (
                <Card key={item.title}>
                  <CardHeader>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.detail}</CardDescription>
                    <CardAction>
                      <item.icon className="text-muted-foreground" />
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex items-end justify-between gap-4">
                    <p className="text-3xl font-semibold">{item.value}</p>
                    <Badge variant="outline">{item.trend}</Badge>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Proyectos recientes</CardTitle>
                  <CardDescription>Seguimiento rápido de entregables y fechas clave.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {projects.map((project) => (
                    <div key={project.name} className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                          <FolderKanbanIcon />
                        </div>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground">{project.phase} · entrega {project.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 md:min-w-48">
                        <div className="h-2 flex-1 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: project.progress }} />
                        </div>
                        <span className="text-sm font-medium">{project.progress}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tickets abiertos</CardTitle>
                    <CardDescription>Casos activos con soporte.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-start justify-between gap-4 rounded-xl border p-3">
                        <div className="flex gap-3">
                          <Clock3Icon className="mt-0.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{ticket.title}</p>
                            <p className="text-xs text-muted-foreground">{ticket.id} · {ticket.time}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{ticket.status}</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Facturas pendientes</CardTitle>
                    <CardDescription>Documentos esperando aprobación o pago.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2Icon className="text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{invoice.concept}</p>
                            <p className="text-xs text-muted-foreground">{invoice.id}</p>
                          </div>
                        </div>
                        <p className="font-medium">{invoice.amount}</p>
                      </div>
                    ))}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Ver facturación
                      <TrendingUpIcon data-icon="inline-end" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </section>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
