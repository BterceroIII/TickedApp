import { useState } from "react"
import {
  MessageSquareIcon,
  PlusIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { DatePickerInput } from "@/components/date-picker-input"
import ErrorMessage, { type ActionState } from "@/components/error-message"
import { NotificationsBell } from "@/components/notifications-bell"
import { TickedRowActions } from "@/components/ticked-row-actions"
import { useToastNotifications } from "@/hooks/use-toast-notifications"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { TooltipProvider } from "@/components/ui/tooltip"
import { getUserDisplayName, useUsers } from "@/services/auth/users.service"
import { useProjects } from "@/services/projects/projects.service"
import type { Ticked } from "@/services/tickeds/tickeds.service"
import {
  type TicketPriority,
  type TicketStatus,
  useCreateTicked,
  useTickeds,
  useUpdateTicked,
} from "@/services/tickeds/tickeds.service"
import { CreateTickedSchema } from "../../schema"

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  ABIERTO: { label: "Abierto", variant: "outline" },
  EN_PROCESO: { label: "En proceso", variant: "default" },
  RESUELTO: { label: "Resuelto", variant: "secondary" },
}

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  ALTA: { label: "Alta", variant: "destructive" },
  MEDIA: { label: "Media", variant: "default" },
  BAJA: { label: "Baja", variant: "secondary" },
}

export function TickedsPage() {
  const [showCreateTicket, setShowCreateTicket] = useState(false)
  const [editingTicked, setEditingTicked] = useState<Ticked | null>(null)
  const tickedsQuery = useTickeds()
  const projectsQuery = useProjects()

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
                <h1 className="truncate text-lg font-semibold">Tickets</h1>
                <p className="truncate text-sm text-muted-foreground">
                  Seguimiento de incidencias y solicitudes
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <NotificationsBell />
                <Button
                  aria-label="Crear ticket"
                  className="size-8 px-0 sm:size-auto sm:h-8 sm:px-2.5"
                  onClick={() => {
                    setEditingTicked(null)
                    setShowCreateTicket((v) => !v)
                  }}
                >
                  <PlusIcon data-icon="inline-start item-center" />
                  <span className="hidden sm:inline">Crear ticket</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-5 bg-muted/35 p-4 md:p-6">
            {showCreateTicket ? (
              <CreateTicketCard
                key={editingTicked?.id ?? "new-ticket"}
                ticked={editingTicked}
                onDone={() => {
                  setEditingTicked(null)
                  setShowCreateTicket(false)
                }}
              />
            ) : null}

            <div className="grid gap-3 md:hidden">
              {tickedsQuery.isLoading ? (
                <MobileMessage>Cargando tickets...</MobileMessage>
              ) : null}
              {tickedsQuery.isError ? (
                <MobileMessage>No se pudieron cargar los tickets desde la API.</MobileMessage>
              ) : null}
              {tickedsQuery.data?.length ? (
                tickedsQuery.data.map((ticked) => (
                  <TickedMobileCard
                    key={ticked.id}
                    ticked={ticked}
                    projectName={getProjectName(
                      ticked.projectId,
                      ticked.project?.name,
                      projectsQuery.data
                    )}
                    onEdit={(nextTicked) => {
                      setEditingTicked(nextTicked)
                      setShowCreateTicket(true)
                    }}
                  />
                ))
              ) : null}
              {tickedsQuery.data?.length === 0 ? (
                <MobileMessage>No hay tickets registrados.</MobileMessage>
              ) : null}
            </div>

            <Card className="hidden rounded-2xl bg-card py-0 md:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Ticket
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Título
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Estado
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Prioridad
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Proyecto
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Asignado a
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Fecha estimada
                      </TableHead>
                      <TableHead className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Creado
                      </TableHead>
                      <TableHead className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickedsQuery.isLoading ? (
                      <TableMessage colSpan={9}>Cargando tickets...</TableMessage>
                    ) : null}
                    {tickedsQuery.isError ? (
                      <TableMessage colSpan={9}>
                        No se pudieron cargar los tickets desde la API.
                      </TableMessage>
                    ) : null}
                    {tickedsQuery.data?.length ? (
                      tickedsQuery.data.map((ticked) => {
                        const status = statusConfig[ticked.status] ?? {
                          label: ticked.status,
                          variant: "outline",
                        }
                        const priority = priorityConfig[ticked.priority] ?? {
                          label: ticked.priority,
                          variant: "default",
                        }
                        return (
                          <TableRow key={ticked.id}>
                            <TableCell className="px-4 py-5 font-mono text-xs font-semibold text-muted-foreground">
                              {ticked.id}
                            </TableCell>
                            <TableCell className="px-4 py-5 font-semibold">
                              {ticked.title}
                            </TableCell>
                            <TableCell className="px-4 py-5">
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </TableCell>
                            <TableCell className="px-4 py-5">
                              <Badge variant={priority.variant}>{priority.label}</Badge>
                            </TableCell>
                            <TableCell className="px-4 py-5 text-muted-foreground">
                              {getProjectName(ticked.projectId, ticked.project?.name, projectsQuery.data)}
                            </TableCell>
                            <TableCell className="px-4 py-5 text-muted-foreground">
                              {ticked.assignedTo
                                ? getUserDisplayName(ticked.assignedTo)
                                : "Sin asignar"}
                            </TableCell>
                            <TableCell className="px-4 py-5 text-muted-foreground">
                              {ticked.estimatedDate
                                ? formatDate(ticked.estimatedDate)
                                : "Sin fecha"}
                            </TableCell>
                            <TableCell className="px-4 py-5 text-right text-muted-foreground">
                              {new Date(ticked.createdAt).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell className="px-4 py-5 text-right">
                              <TickedRowActions
                                ticked={ticked}
                                onEdit={(nextTicked) => {
                                  setEditingTicked(nextTicked)
                                  setShowCreateTicket(true)
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : null}
                    {tickedsQuery.data?.length === 0 ? (
                      <TableMessage colSpan={9}>No hay tickets registrados.</TableMessage>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function TickedMobileCard({
  ticked,
  projectName,
  onEdit,
}: {
  ticked: Ticked
  projectName: string
  onEdit: (ticked: Ticked) => void
}) {
  const status = statusConfig[ticked.status] ?? {
    label: ticked.status,
    variant: "outline" as const,
  }
  const priority = priorityConfig[ticked.priority] ?? {
    label: ticked.priority,
    variant: "default" as const,
  }

  return (
    <Card className="rounded-2xl py-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <p className="font-mono text-sm font-medium text-muted-foreground">
              {ticked.id}
            </p>
            <h2 className="line-clamp-2 text-base font-semibold leading-snug">
              {ticked.title}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Badge variant={status.variant}>{status.label}</Badge>
            <TickedRowActions ticked={ticked} onEdit={onEdit} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
          <Badge variant={priority.variant}>{priority.label}</Badge>
          <span>·</span>
          <span className="truncate">{projectName}</span>
          <span>·</span>
          <span>
            {ticked.estimatedDate ? formatDate(ticked.estimatedDate) : "Sin fecha"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateTicketCard({
  ticked,
  onDone,
}: {
  ticked: Ticked | null
  onDone: () => void
}) {
  const [title, setTitle] = useState(ticked?.title ?? "")
  const [description, setDescription] = useState(ticked?.description ?? "")
  const [status, setStatus] = useState<TicketStatus>(ticked?.status ?? "ABIERTO")
  const [priority, setPriority] = useState<TicketPriority>(ticked?.priority ?? "MEDIA")
  const [projectId, setProjectId] = useState(ticked ? String(ticked.projectId) : "")
  const [assignedToId, setAssignedToId] = useState(ticked?.assignedToId ?? "")
  const [estimatedDate, setEstimatedDate] = useState(toDateInputValue(ticked?.estimatedDate ?? undefined))

  const { mutate: createTicked, isPending } = useCreateTicked()
  const updateTicked = useUpdateTicked()
  const projectsQuery = useProjects()
  const usersQuery = useUsers()
  const { notifyCreated, notifyUpdated, notifyError } = useToastNotifications("ticket")
  const [actionState, setActionState] = useState<ActionState>({})
  const isEditing = Boolean(ticked)
  const isSaving = isPending || updateTicked.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = CreateTickedSchema.safeParse({
      title,
      description,
      status,
      priority,
      projectId: Number(projectId),
      assignedToId,
      estimatedDate,
    })

    if (!result.success) {
      setActionState({
        succeeded: false,
        message: result.error.issues[0]?.message ?? "Revisa los datos del ticket",
        title: "Validación del formulario",
      })
      return
    }

    if (ticked) {
      updateTicked.mutate(
        { id: ticked.id, input: result.data },
        {
          onSuccess: () => {
            notifyUpdated()
            setTimeout(onDone, 300)
          },
          onError: () => notifyError("actualizar"),
        }
      )
      return
    }

    createTicked(result.data, {
      onSuccess: () => {
        notifyCreated()
        setTimeout(onDone, 300)
      },
      onError: () => notifyError("crear"),
    })
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>{isEditing ? "Editar ticket" : "Crear ticket"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza los datos principales del ticket"
            : "Registra una nueva incidencia o solicitud"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorMessage state={actionState} />
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="ticket-title">Título</Label>
            <Input
              id="ticket-title"
              placeholder="Ej. Error al cargar módulo ventas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ticket-project">Proyecto</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger id="ticket-project" className="w-full">
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  {projectsQuery.isLoading ? (
                    <SelectItem value="__loading" disabled>
                      Cargando proyectos...
                    </SelectItem>
                  ) : null}
                  {projectsQuery.isError ? (
                    <SelectItem value="__error" disabled>
                      No se pudieron cargar proyectos
                    </SelectItem>
                  ) : null}
                  {projectsQuery.data?.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      No hay proyectos disponibles
                    </SelectItem>
                  ) : null}
                  {projectsQuery.data?.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Prioridad</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as TicketPriority)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="BAJA">Baja</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Asignado a</Label>
            <Select value={assignedToId} onValueChange={setAssignedToId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  {usersQuery.isLoading ? (
                    <SelectItem value="__loading" disabled>
                      Cargando usuarios...
                    </SelectItem>
                  ) : null}
                  {usersQuery.isError ? (
                    <SelectItem value="__error" disabled>
                      No se pudieron cargar usuarios
                    </SelectItem>
                  ) : null}
                  {usersQuery.data?.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      No hay usuarios disponibles
                    </SelectItem>
                  ) : null}
                  {usersQuery.data?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {getUserDisplayName(user)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <DatePickerInput
            id="ticket-estimated-date"
            label="Fecha estimada"
            value={estimatedDate}
            onChange={setEstimatedDate}
            required
          />
          <div className="flex flex-col gap-2">
            <Label>Estado</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as TicketStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="ABIERTO">Abierto</SelectItem>
                  <SelectItem value="EN_PROCESO">En proceso</SelectItem>
                  <SelectItem value="RESUELTO">Resuelto</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="ticket-description">Descripción</Label>
            <Textarea
              id="ticket-description"
              placeholder="Describe el problema o solicitud"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button variant="outline" type="button" onClick={onDone}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              <MessageSquareIcon data-icon="inline-start" />
              {isSaving ? "Guardando..." : "Guardar ticket"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function getProjectName(
  projectId: number,
  includedName: string | undefined,
  projects: { id: number; name: string }[] | undefined
) {
  return includedName ?? projects?.find((project) => project.id === projectId)?.name ?? `#${projectId}`
}

function toDateInputValue(value: string | undefined) {
  return value ? new Date(value).toISOString().slice(0, 10) : ""
}

function TableMessage({
  children,
  colSpan,
}: {
  children: React.ReactNode
  colSpan: number
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="px-4 py-12 text-center text-muted-foreground">
        {children}
      </TableCell>
    </TableRow>
  )
}

function MobileMessage({ children }: { children: React.ReactNode }) {
  return (
    <Card className="rounded-2xl py-0">
      <CardContent className="p-6 text-center text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  )
}
