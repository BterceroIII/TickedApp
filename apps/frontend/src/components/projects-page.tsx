import { useEffect, useState } from "react"
import {
  ArrowLeftIcon,
  FolderKanbanIcon,
  PlusIcon,
  UserIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { DatePickerInput } from "@/components/date-picker-input"
import { NotificationsBell } from "@/components/notifications-bell"
import { ProjectRowActions } from "@/components/project-row-actions"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { useCurrentUser } from "@/services/auth/auth.service"
import { getUserDisplayName, useUsers } from "@/services/auth/users.service"
import type {
  Project,
  ProjectProgress,
  ProjectStatus,
} from "@/services/projects/projects.service"
import {
  useCreateProject,
  useProjects,
  useProjectsProgress,
  useUpdateProject,
} from "@/services/projects/projects.service"
import { CreateProjectSchema, PROJECT_DESCRIPTION_MAX_LENGTH } from "../../schema"

const statusConfig: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  EN_PROGRESO: { label: "En progreso", className: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  EN_REVISION: { label: "En revisión", className: "border-red-200 bg-red-50 text-yellow-700" },
  PLANIFICACION: { label: "Planificación", className: "border-blue-200 bg-blue-50 text-blue-700" },
  COMPLETADO: { label: "Completado", className: "border-green-200 bg-green-50 text-green-700" },
}

type FormErrors = Partial<Record<string, string>>

function getFormErrors(issues: { path: PropertyKey[]; message: string }[]) {
  return issues.reduce<FormErrors>((errors, issue) => {
    const field = String(issue.path[0] ?? "form")
    if (!errors[field]) errors[field] = issue.message
    return errors
  }, {})
}

export function ProjectsPage() {
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)
  const currentUserQuery = useCurrentUser()
  const projectsQuery = useProjects()
  const progressQuery = useProjectsProgress()
  const canManageProjects = currentUserQuery.data?.role === "ADMIN"

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const editProjectId = Number(searchParams.get("editProject"))
    const viewProjectId = Number(searchParams.get("viewProject"))

    if (!projectsQuery.data?.length) return

    if (canManageProjects && Number.isFinite(editProjectId) && editProjectId > 0) {
      const project = projectsQuery.data.find((item) => item.id === editProjectId)
      if (!project) return

      setEditingProject(project)
      setShowCreateProject(true)
      window.history.replaceState(null, "", window.location.pathname)
      return
    }

    if (Number.isFinite(viewProjectId) && viewProjectId > 0) {
      const project = projectsQuery.data.find((item) => item.id === viewProjectId)
      if (!project) return

      setViewingProject(project)
      window.history.replaceState(null, "", window.location.pathname)
    }
  }, [canManageProjects, projectsQuery.data])

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
                <h1 className="truncate text-lg font-semibold">Mis proyectos</h1>
                <p className="truncate text-sm text-muted-foreground">
                  Estado y avance de todos tus proyectos
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <NotificationsBell />
                {canManageProjects ? (
                  <Button
                    aria-label="Crear proyecto"
                    className="size-8 px-0 sm:size-auto sm:h-8 sm:px-2.5"
                    onClick={() => {
                      setEditingProject(null)
                      setShowCreateProject((value) => !value)
                    }}
                  >
                    <PlusIcon data-icon="inline-start item-center" />
                    <span className="hidden sm:inline">Crear proyecto</span>
                  </Button>
                ) : null}
              </div>
            </div>
          </header>

          <main className="flex flex-1 flex-col gap-5 bg-muted/35 p-4 md:p-6">
            {canManageProjects && showCreateProject ? (
              <CreateProjectCard
                key={editingProject?.id ?? "new-project"}
                project={editingProject}
                onDone={() => {
                  setEditingProject(null)
                  setShowCreateProject(false)
                }}
              />
            ) : null}

            <div className="grid gap-3 md:hidden">
              {projectsQuery.isLoading ? (
                <MobileMessage>Cargando proyectos...</MobileMessage>
              ) : null}
              {projectsQuery.isError ? (
                <MobileMessage>No se pudieron cargar los proyectos desde la API.</MobileMessage>
              ) : null}
              {projectsQuery.data?.length ? (
                projectsQuery.data.map((project) => (
                  <ProjectMobileCard
                    key={project.id}
                    project={project}
                    progress={progressQuery.data?.find(
                      (item) => item.projectId === project.id
                    )}
                    canManageProjects={canManageProjects}
                    onView={setViewingProject}
                    onEdit={
                      canManageProjects
                        ? (nextProject) => {
                            setEditingProject(nextProject)
                            setShowCreateProject(true)
                          }
                        : undefined
                    }
                  />
                ))
              ) : null}
              {projectsQuery.data?.length === 0 ? (
                <MobileMessage>No hay proyectos registrados.</MobileMessage>
              ) : null}
            </div>

            <Card className="hidden rounded-2xl bg-card py-0 md:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Proyecto
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Estado
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Responsable
                      </TableHead>
                      <TableHead className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Fecha límite
                      </TableHead>
                      <TableHead className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Avance
                      </TableHead>
                      <TableHead className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsQuery.isLoading ? (
                      <TableMessage colSpan={6}>Cargando proyectos...</TableMessage>
                    ) : null}
                    {projectsQuery.isError ? (
                      <TableMessage colSpan={6}>
                        No se pudieron cargar los proyectos desde la API.
                      </TableMessage>
                    ) : null}
                    {projectsQuery.data?.length ? (
                      projectsQuery.data.map((project) => (
                        <ProjectRow
                          key={project.id}
                          project={project}
                          progress={progressQuery.data?.find(
                            (item) => item.projectId === project.id
                          )}
                          canManageProjects={canManageProjects}
                          onView={setViewingProject}
                          onEdit={
                            canManageProjects
                              ? (nextProject) => {
                                  setEditingProject(nextProject)
                                  setShowCreateProject(true)
                                }
                              : undefined
                          }
                        />
                      ))
                    ) : null}
                    {projectsQuery.data?.length === 0 ? (
                      <TableMessage colSpan={6}>
                        No hay proyectos registrados.
                      </TableMessage>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <ProjectDetailSheet
              project={viewingProject}
              progress={progressQuery.data?.find(
                (item) => item.projectId === viewingProject?.id
              )}
              onOpenChange={(open) => {
                if (!open) {
                  setViewingProject(null)
                }
              }}
            />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

function ProjectMobileCard({
  project,
  progress,
  canManageProjects,
  onView,
  onEdit,
}: {
  project: Project
  progress?: ProjectProgress
  canManageProjects: boolean
  onView: (project: Project) => void
  onEdit?: (project: Project) => void
}) {
  const progressPercentage = progress?.percentage ?? 0

  return (
    <Card className="rounded-2xl py-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-3">
            <div className="flex items-center gap-3">
              <span className="size-3 rounded-full bg-primary" />
              <h2 className="truncate text-base font-semibold">{project.name}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <ProjectStatusSelect project={project} disabled={!canManageProjects} compact />
              <span>Vence {formatDate(project.dateLimit)}</span>
            </div>
          </div>
          <ProjectRowActions
            project={project}
            canManageProjects={canManageProjects}
            onView={onView}
            onEdit={onEdit}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs font-medium text-muted-foreground">
            {progressPercentage}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ProjectRow({
  project,
  progress,
  canManageProjects,
  onView,
  onEdit,
}: {
  project: Project
  progress?: ProjectProgress
  canManageProjects: boolean
  onView: (project: Project) => void
  onEdit?: (project: Project) => void
}) {
  const progressPercentage = progress?.percentage ?? 0

  return (
    <TableRow>
      <TableCell className="px-4 py-5 font-semibold">
        <div className="flex items-center gap-3">
          <span className="size-2 rounded-full bg-primary" />
          {project.name}
        </div>
      </TableCell>
      <TableCell className="px-4 py-5">
        <ProjectStatusSelect project={project} disabled={!canManageProjects} />
      </TableCell>
      <TableCell className="px-4 py-5 font-mono text-xs text-muted-foreground">
        {project.responsible ? getUserDisplayName(project.responsible) : "Sin responsable"}
      </TableCell>
      <TableCell className="px-4 py-5 text-muted-foreground">
        {formatDate(project.dateLimit)}
      </TableCell>
      <TableCell className="px-4 py-5">
        <div className="ml-auto flex max-w-36 items-center justify-end gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="w-8 text-right text-xs text-muted-foreground">
            {progressPercentage}%
          </span>
        </div>
      </TableCell>
      <TableCell className="px-4 py-5 text-right">
        <ProjectRowActions
          project={project}
          canManageProjects={canManageProjects}
          onView={onView}
          onEdit={onEdit}
        />
      </TableCell>
    </TableRow>
  )
}

function ProjectStatusSelect({
  project,
  disabled,
  compact = false,
}: {
  project: Project
  disabled: boolean
  compact?: boolean
}) {
  const updateProject = useUpdateProject()
  const { notifyUpdated, notifyError } = useToastNotifications("project")
  const status = statusConfig[project.status]

  return (
    <Select
      value={project.status}
      onValueChange={(value) => {
        if (value === project.status) return
        updateProject.mutate(
          { id: project.id, input: { status: value as ProjectStatus } },
          {
            onSuccess: notifyUpdated,
            onError: () => notifyError("actualizar"),
          }
        )
      }}
    >
      <SelectTrigger
        className={`${compact ? "h-7 w-32" : "h-8 w-36"} ${status.className}`}
        disabled={disabled || updateProject.isPending}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="PLANIFICACION">Planificación</SelectItem>
          <SelectItem value="EN_PROGRESO">En progreso</SelectItem>
          <SelectItem value="EN_REVISION">En revisión</SelectItem>
          <SelectItem value="COMPLETADO">Completado</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function ProjectDetailSheet({
  project,
  progress,
  onOpenChange,
}: {
  project: Project | null
  progress?: ProjectProgress
  onOpenChange: (open: boolean) => void
}) {
  const status = project ? statusConfig[project.status] : null
  const progressPercentage = progress?.percentage ?? 0

  return (
    <Sheet open={Boolean(project)} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{project?.name ?? "Detalle del proyecto"}</SheetTitle>
          <SheetDescription>
            Vista de solo lectura del proyecto seleccionado.
          </SheetDescription>
        </SheetHeader>
        {project ? (
          <div className="flex flex-col gap-5 px-4 pb-4">
            <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/35 p-4">
              <div>
                <p className="text-sm text-muted-foreground">Avance</p>
                <p className="text-3xl font-semibold tabular-nums">
                  {progressPercentage}%
                </p>
              </div>
              {status ? <Badge variant="outline" className={status.className}>{status.label}</Badge> : null}
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="grid gap-4 text-sm">
              <DetailItem label="Responsable">
                {project.responsible
                  ? getUserDisplayName(project.responsible)
                  : "Sin responsable"}
              </DetailItem>
              <DetailItem label="Fecha límite">
                {formatDate(project.dateLimit)}
              </DetailItem>
              <DetailItem label="Tickets resueltos">
                {progress?.resolvedTickets ?? 0} de {progress?.totalTickets ?? 0}
              </DetailItem>
              <DetailItem label="Descripción">
                {project.description || "Sin descripción registrada."}
              </DetailItem>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function DetailItem({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1 rounded-xl border bg-background/60 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <div className="text-foreground">{children}</div>
    </div>
  )
}

function CreateProjectCard({
  project,
  onDone,
}: {
  project: Project | null
  onDone: () => void
}) {
  const [name, setName] = useState(project?.name ?? "")
  const [responsible, setResponsible] = useState(project?.responsibleId ?? "")
  const [dateLimit, setDateLimit] = useState(toDateInputValue(project?.dateLimit))
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? "PLANIFICACION")
  const [description, setDescription] = useState(project?.description ?? "")
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const usersQuery = useUsers()
  const { notifyCreated, notifyUpdated, notifyError } = useToastNotifications("project")
  const [errors, setErrors] = useState<FormErrors>({})
  const isEditing = Boolean(project)
  const isPending = createProject.isPending || updateProject.isPending
  const descriptionRemaining = PROJECT_DESCRIPTION_MAX_LENGTH - description.length

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const result = CreateProjectSchema.safeParse({
      name,
      responsible,
      dateLimit,
      status,
      description: description || undefined,
    })

    if (!result.success) {
      setErrors(getFormErrors(result.error.issues))
      return
    }

    setErrors({})

    if (project) {
      updateProject.mutate(
        { id: project.id, input: result.data },
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

    createProject.mutate(result.data, {
      onSuccess: () => {
        notifyCreated()
        setTimeout(onDone, 300)
      },
      onError: () => notifyError("crear"),
    })
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-start justify-baseline gap-4">
        <Button variant="outline" type="button" onClick={onDone}>
          <ArrowLeftIcon data-icon="inline-start" />
          Volver
        </Button>
        <div className="flex flex-col gap-1">
          <CardTitle>{isEditing ? "Editar proyecto" : "Crear proyecto"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Actualiza los datos principales del proyecto."
              : "Completa los datos mínimos para registrar un nuevo proyecto."}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Nombre del proyecto</Label>
            <Input
              id="project-name"
              placeholder="Ej. Portal Cliente"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setErrors((current) => ({ ...current, name: undefined }))
              }}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name ? <p className="text-sm text-destructive">{errors.name}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-responsible">Responsable</Label>
            <Select
              value={responsible}
              onValueChange={(value) => {
                setResponsible(value)
                setErrors((current) => ({ ...current, responsible: undefined }))
              }}
            >
              <SelectTrigger id="project-responsible" className="w-full" aria-invalid={Boolean(errors.responsible)}>
                <UserIcon data-icon="inline-start" />
                <SelectValue placeholder="Selecciona un responsable" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  {usersQuery.isLoading ? (
                    <SelectItem value="__loading" disabled>
                      Cargando responsables...
                    </SelectItem>
                  ) : null}
                  {usersQuery.isError ? (
                    <SelectItem value="__error" disabled>
                      No se pudieron cargar responsables
                    </SelectItem>
                  ) : null}
                  {usersQuery.data?.length === 0 ? (
                    <SelectItem value="__empty" disabled>
                      No hay responsables disponibles
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
            {errors.responsible ? <p className="text-sm text-destructive">{errors.responsible}</p> : null}
          </div>
          <DatePickerInput
            id="project-date"
            label="Fecha límite"
            value={dateLimit}
            onChange={(value) => {
              setDateLimit(value)
              setErrors((current) => ({ ...current, dateLimit: undefined }))
            }}
            error={errors.dateLimit}
          />
          <div className="flex flex-col gap-2">
            <Label>Estado</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as ProjectStatus)
                setErrors((current) => ({ ...current, status: undefined }))
              }}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.status)}>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="PLANIFICACION">Planificación</SelectItem>
                  <SelectItem value="EN_PROGRESO">En progreso</SelectItem>
                  <SelectItem value="EN_REVISION">En revisión</SelectItem>
                  <SelectItem value="COMPLETADO">Completado</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.status ? <p className="text-sm text-destructive">{errors.status}</p> : null}
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="project-description">Descripción</Label>
            <Textarea
              id="project-description"
              placeholder="Describe el alcance principal del proyecto"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value)
                setErrors((current) => ({ ...current, description: undefined }))
              }}
              maxLength={PROJECT_DESCRIPTION_MAX_LENGTH}
              aria-invalid={Boolean(errors.description)}
            />
            <p className="text-xs text-muted-foreground">
              Máximo {PROJECT_DESCRIPTION_MAX_LENGTH} caracteres / {descriptionRemaining} restantes
            </p>
            {errors.description ? <p className="text-sm text-destructive">{errors.description}</p> : null}
          </div>
          {createProject.isError || updateProject.isError ? (
            <p className="text-sm text-destructive md:col-span-2">
              No se pudo guardar el proyecto. Revisa los datos e intenta de nuevo.
            </p>
          ) : null}
          <div className="flex justify-end gap-2 md:col-span-2">
            <Button variant="outline" type="button" onClick={onDone}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <FolderKanbanIcon data-icon="inline-start" />
              {isPending ? "Guardando..." : "Guardar proyecto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
