import { toast } from "sonner"

type EntityLabels = {
  singular: string
  masculine?: boolean
}

const entities: Record<string, EntityLabels> = {
  project: { singular: "proyecto", masculine: true },
  ticket: { singular: "ticket", masculine: true },
  invoice: { singular: "factura" },
}

function entityText(entity: string) {
  return entities[entity]?.singular ?? entity
}

function actionText(action: string, entity: string) {
  const label = entityText(entity)
  return `No se pudo ${action} ${entities[entity]?.masculine ? "el" : "la"} ${label}`
}

function capitalizeText(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export function useToastNotifications(entity: string) {
  return {
    notifyCreated: () => toast.success(capitalizeText(`${entityText(entity)} creado correctamente`)),
    notifyUpdated: () => toast.success(capitalizeText(`${entityText(entity)} actualizado correctamente`)),
    notifyDeleted: () => toast.success(capitalizeText(`${entityText(entity)} eliminado correctamente`)),
    notifyError: (action: string) => toast.error(actionText(action, entity)),
  }
}
