import { useState } from "react"
import { EyeIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToastNotifications } from "@/hooks/use-toast-notifications"
import type { Project } from "@/services/projects/projects.service"
import { useRemoveProject } from "@/services/projects/projects.service"

export function ProjectRowActions({
  project,
  canManageProjects,
  onView,
  onEdit,
}: {
  project: Project
  canManageProjects: boolean
  onView: (project: Project) => void
  onEdit?: (project: Project) => void
}) {
  const removeProject = useRemoveProject()
  const { notifyDeleted, notifyError } = useToastNotifications("project")
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function handleDelete() {
    removeProject.mutate(project.id, {
      onSuccess: notifyDeleted,
      onError: () => notifyError("eliminar"),
    })
  }

  return (
    <DropdownMenu onOpenChange={(open) => !open && setConfirmingDelete(false)}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Abrir acciones">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={confirmingDelete ? "w-72" : undefined}>
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onView(project)}>
          <EyeIcon />
          Ver detalle
        </DropdownMenuItem>
        {canManageProjects ? (
          <>
            <DropdownMenuItem onClick={() => onEdit?.(project)} disabled={!onEdit}>
              <PencilIcon />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {confirmingDelete ? (
              <div className="flex flex-col gap-3 p-2">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Eliminar proyecto</p>
                  <p className="text-xs text-muted-foreground">
                    Esta acción eliminará el proyecto "{project.name}" y no se puede deshacer.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={removeProject.isPending}
                    onClick={handleDelete}
                  >
                    {removeProject.isPending ? "Eliminando..." : "Eliminar"}
                  </Button>
                </div>
              </div>
            ) : (
              <DropdownMenuItem
                variant="destructive"
                disabled={removeProject.isPending}
                onSelect={(event) => {
                  event.preventDefault()
                  setConfirmingDelete(true)
                }}
              >
                <Trash2Icon />
                Eliminar
              </DropdownMenuItem>
            )}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
