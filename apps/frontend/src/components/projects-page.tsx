import { useState } from "react"
import {
  FolderKanbanIcon,
  PlusIcon,
  UserIcon,
} from "lucide-react"

import { AppSidebar } from "@/components/app-sidebar"
import { DatePickerInput } from "@/components/date-picker-input"
import ErrorMessage, { type ActionState } from "@/components/error-message"
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
import { CreateProjectSchema } from "../../schema"

const statusConfig: Record<
  ProjectStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  EN_PROGRESO: { label: "En progreso", variant: "default" },
  EN_REVISION: { label: "En revisión", variant: "secondary" },
  PLANIFICACION: { label: "Planificación", variant: "outline" },
  COMPLETADO: { label: "Completado", variant: "secondary" },
}

export function ProjectsPage() {
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const currentUserQuery = useCurrentUser()
  const projectsQuery = useProjects()
  const progressQuery = useProjectsProgress()
  const canManageProjects = currentUserQuery.data?.role === "ADMIN"

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
                    onClick={() => {
                      setEditingProject(null)
                      setShowCreateProject((value) => !value)
                    }}
                  >
                    <PlusIcon data-icon="inline-start" />
                    Crear proyecto
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

            <Card className="rounded-2xl bg-card py-0">
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
                      {canManageProjects ? (
                        <TableHead className="px-4 py-4 text-right text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                          Acciones
                        </TableHead>
                      ) : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectsQuery.isLoading ? (
                      <TableMessage colSpan={canManageProjects ? 6 : 5}>Cargando proyectos...</TableMessage>
                    ) : null}
                    {projectsQuery.isError ? (
                      <TableMessage colSpan={canManageProjects ? 6 : 5}>
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
                      <TableMessage colSpan={canManageProjects ? 6 : 5}>
                        No hay proyectos registrados.
                      </TableMessage>
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

function ProjectRow({
  project,
  progress,
  canManageProjects,
  onEdit,
}: {
  project: Project
  progress?: ProjectProgress
  canManageProjects: boolean
  onEdit?: (project: Project) => void
}) {
  const status = statusConfig[project.status]
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
        <Badge variant={status.variant}>{status.label}</Badge>
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
      {canManageProjects ? (
        <TableCell className="px-4 py-5 text-right">
          <ProjectRowActions project={project} onEdit={onEdit} />
        </TableCell>
      ) : null}
    </TableRow>
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
  const [actionState, setActionState] = useState<ActionState>({})
  const isEditing = Boolean(project)
  const isPending = createProject.isPending || updateProject.isPending

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
      setActionState({
        succeeded: false,
        message: result.error.issues[0]?.message ?? "Revisa los datos del proyecto",
        title: "Validación del formulario",
      })
      return
    }

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
      <CardHeader>
        <CardTitle>{isEditing ? "Editar proyecto" : "Crear proyecto"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Actualiza los datos principales del proyecto."
            : "Completa los datos mínimos para registrar un nuevo proyecto."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ErrorMessage state={actionState} />
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Nombre del proyecto</Label>
            <Input
              id="project-name"
              placeholder="Ej. Portal Cliente"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-responsible">Responsable</Label>
            <Select value={responsible} onValueChange={setResponsible}>
              <SelectTrigger id="project-responsible" className="w-full">
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
          </div>
          <DatePickerInput
            id="project-date"
            label="Fecha límite"
            value={dateLimit}
            onChange={setDateLimit}
            required
          />
          <div className="flex flex-col gap-2">
            <Label>Estado</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as ProjectStatus)}
            >
              <SelectTrigger className="w-full">
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
          </div>
          <div className="flex flex-col gap-2 md:col-span-2">
            <Label htmlFor="project-description">Descripción</Label>
            <Textarea
              id="project-description"
              placeholder="Describe el alcance principal del proyecto"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
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

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
