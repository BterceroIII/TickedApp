import { useState } from "react"
import { MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react"

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
import type { Ticked } from "@/services/tickeds/tickeds.service"
import { useRemoveTicked } from "@/services/tickeds/tickeds.service"

export function TickedRowActions({
  ticked,
  onEdit,
}: {
  ticked: Ticked
  onEdit?: (ticked: Ticked) => void
}) {
  const removeTicked = useRemoveTicked()
  const { notifyDeleted, notifyError } = useToastNotifications("ticket")
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  function handleDelete() {
    removeTicked.mutate(ticked.id, {
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
        <DropdownMenuItem onClick={() => onEdit?.(ticked)} disabled={!onEdit}>
          <PencilIcon />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {confirmingDelete ? (
          <div className="flex flex-col gap-3 p-2">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Eliminar ticket</p>
              <p className="text-xs text-muted-foreground">
                Esta acción eliminará el ticket "{ticked.title}" y no se puede deshacer.
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
                disabled={removeTicked.isPending}
                onClick={handleDelete}
              >
                {removeTicked.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        ) : (
          <DropdownMenuItem
            variant="destructive"
            disabled={removeTicked.isPending}
            onSelect={(event) => {
              event.preventDefault()
              setConfirmingDelete(true)
            }}
          >
            <Trash2Icon />
            Eliminar
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
