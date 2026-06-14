import { queryOptions, useQuery } from "@tanstack/react-query"

import { api } from "@/services/api"
import type { InvoiceStatus } from "@/services/invoices/invoices.service"
import type { ProjectStatus } from "@/services/projects/projects.service"
import type { TicketPriority, TicketStatus } from "@/services/tickeds/tickeds.service"

export type DashboardMetric = {
  label: string
  value: number
  helper: string
}

export type DashboardProject = {
  id: number
  name: string
  status: ProjectStatus
  dateLimit: string
  totalTickets: number
  resolvedTickets: number
  progress: number
}

export type DashboardTicket = {
  id: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  projectName: string
  createdAt: string
}

export type DashboardInvoice = {
  id: string
  concept: string
  amount: number
  status: InvoiceStatus
  dueDate: string
}

export type DashboardSummary = {
  metrics: DashboardMetric[]
  activeProjects: DashboardProject[]
  recentTickets: DashboardTicket[]
  recentInvoices: DashboardInvoice[]
}

export const dashboardQueryKey = ["dashboard"] as const

export const dashboardQueryOptions = queryOptions({
  queryKey: dashboardQueryKey,
  queryFn: fetchDashboardSummary,
})

export async function fetchDashboardSummary() {
  const { data } = await api.get<DashboardSummary>("/dashboard")
  return data
}

export function useDashboardSummary() {
  return useQuery(dashboardQueryOptions)
}
