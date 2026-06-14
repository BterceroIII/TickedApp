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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Abrir acciones">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
            <DropdownMenuItem
              variant="destructive"
              disabled={removeProject.isPending}
              onClick={() =>
                removeProject.mutate(project.id, {
                  onSuccess: notifyDeleted,
                  onError: () => notifyError("eliminar"),
                })
              }
            >
              <Trash2Icon />
              Eliminar
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
