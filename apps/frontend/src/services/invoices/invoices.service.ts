import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/services/api"
import {
  dashboardQueryKey,
  dashboardQueryOptions,
} from "@/services/dashboard/dashboard.service"

export type InvoiceStatus = "PENDIENTE" | "VENCIDA" | "PAGADA"

export type Invoice = {
  id: string
  userId: string
  concept: string
  amount: string | number
  status: InvoiceStatus
  dueDate: string
  paidAt?: string | null
  createdAt: string
  updatedAt: string
}

export type CreateInvoiceInput = {
  concept: string
  amount: number
  status: InvoiceStatus
  dueDate: string | Date
  paidAt?: string | Date
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>

export const invoicesQueryKey = ["invoices"] as const

export async function fetchInvoices() {
  const { data } = await api.get<Invoice[]>("/invoices")
  return data
}

export async function fetchInvoiceById(id: string) {
  const { data } = await api.get<Invoice>(`/invoices/${id}`)
  return data
}

export async function createInvoice(input: CreateInvoiceInput) {
  const { data } = await api.post<Invoice>("/invoices", input)
  return data
}

export async function updateInvoice(id: string, input: UpdateInvoiceInput) {
  const { data } = await api.patch<Invoice>(`/invoices/${id}`, input)
  return data
}

export async function removeInvoice(id: string) {
  await api.delete(`/invoices/${id}`)
}

export function useInvoices() {
  return useQuery({
    queryKey: invoicesQueryKey,
    queryFn: fetchInvoices,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoicesQueryKey })
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
      void queryClient.prefetchQuery(dashboardQueryOptions)
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateInvoiceInput }) =>
      updateInvoice(id, input),
    onSuccess: (invoice) => {
      void queryClient.invalidateQueries({ queryKey: invoicesQueryKey })
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
      void queryClient.invalidateQueries({ queryKey: [...invoicesQueryKey, invoice.id] })
      void queryClient.prefetchQuery(dashboardQueryOptions)
    },
  })
}

export function useRemoveInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeInvoice,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invoicesQueryKey })
      void queryClient.invalidateQueries({ queryKey: dashboardQueryKey })
      void queryClient.prefetchQuery(dashboardQueryOptions)
    },
  })
}
