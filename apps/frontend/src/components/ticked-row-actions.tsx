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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Abrir acciones">
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEdit?.(ticked)} disabled={!onEdit}>
          <PencilIcon />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={removeTicked.isPending}
          onClick={() =>
            removeTicked.mutate(ticked.id, {
              onSuccess: notifyDeleted,
              onError: () => notifyError("eliminar"),
            })
          }
        >
          <Trash2Icon />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
