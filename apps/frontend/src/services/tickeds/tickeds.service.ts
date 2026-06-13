import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/services/api"
import type { User } from "@/services/auth/users.service"
import { projectProgressQueryKey } from "@/services/projects/projects.service"

export type TicketStatus = "ABIERTO" | "EN_PROCESO" | "RESUELTO"
export type TicketPriority = "ALTA" | "MEDIA" | "BAJA"

export type Ticked = {
  id: string
  projectId: number
  project?: {
    id: number
    name: string
  }
  title: string
  description?: string | null
  status: TicketStatus
  priority: TicketPriority
  assignedToId?: string | null
  assignedTo?: User | null
  estimatedDate?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateTickedInput = {
  projectId: number
  title: string
  description?: string
  status: TicketStatus
  priority: TicketPriority
  assignedToId: string
  estimatedDate: string | Date
}

export type UpdateTickedInput = Partial<CreateTickedInput>

export const tickedsQueryKey = ["tickeds"] as const

export async function fetchTickeds() {
  const { data } = await api.get<Ticked[]>("/tickeds")
  return data
}

export async function fetchTickedById(id: string) {
  const { data } = await api.get<Ticked>(`/tickeds/${id}`)
  return data
}

export async function createTicked(input: CreateTickedInput) {
  const { data } = await api.post<Ticked>("/tickeds", input)
  return data
}

export async function updateTicked(id: string, input: UpdateTickedInput) {
  const { data } = await api.patch<Ticked>(`/tickeds/${id}`, input)
  return data
}

export async function removeTicked(id: string) {
  await api.delete(`/tickeds/${id}`)
}

export function useTickeds() {
  return useQuery({
    queryKey: tickedsQueryKey,
    queryFn: fetchTickeds,
  })
}

export function useTicked(id: string) {
  return useQuery({
    queryKey: [...tickedsQueryKey, id],
    queryFn: () => fetchTickedById(id),
    enabled: id.length > 0,
  })
}

export function useCreateTicked() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTicked,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tickedsQueryKey })
      void queryClient.invalidateQueries({ queryKey: projectProgressQueryKey })
    },
  })
}

export function useUpdateTicked() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTickedInput }) =>
      updateTicked(id, input),
    onSuccess: (ticked) => {
      void queryClient.invalidateQueries({ queryKey: tickedsQueryKey })
      void queryClient.invalidateQueries({ queryKey: projectProgressQueryKey })
      void queryClient.invalidateQueries({
        queryKey: [...tickedsQueryKey, ticked.id],
      })
    },
  })
}

export function useRemoveTicked() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeTicked,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tickedsQueryKey })
      void queryClient.invalidateQueries({ queryKey: projectProgressQueryKey })
    },
  })
}
