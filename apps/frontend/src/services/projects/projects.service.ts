import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/services/api"
import type { User } from "@/services/auth/users.service"

export type ProjectStatus =
  | "EN_PROGRESO"
  | "EN_REVISION"
  | "PLANIFICACION"
  | "COMPLETADO"

export type Project = {
  id: number
  name: string
  description?: string | null
  status: ProjectStatus
  responsibleId: string
  responsible?: User
  dateLimit: string
  createdAt: string
  updatedAt: string
}

export type ProjectProgress = {
  projectId: number
  totalTickets: number
  resolvedTickets: number
  percentage: number
}

export type CreateProjectInput = {
  name: string
  description?: string
  responsible: string
  dateLimit: string | Date
  status: ProjectStatus
}

export type UpdateProjectInput = Partial<CreateProjectInput>

export const projectsQueryKey = ["projects"] as const
export const projectProgressQueryKey = ["projects", "progress"] as const

export async function fetchProjects() {
  const { data } = await api.get<Project[]>("/projects")
  return data
}

export async function fetchProjectsProgress() {
  const { data } = await api.get<ProjectProgress[]>("/projects/progress")
  return data
}

export async function fetchProjectById(id: number) {
  const { data } = await api.get<Project>(`/projects/${id}`)
  return data
}

export async function createProject(input: CreateProjectInput) {
  const { data } = await api.post<Project>("/projects", input)
  return data
}

export async function updateProject(id: number, input: UpdateProjectInput) {
  const { data } = await api.patch<Project>(`/projects/${id}`, input)
  return data
}

export async function removeProject(id: number) {
  await api.delete(`/projects/${id}`)
}

export function useProjects() {
  return useQuery({
    queryKey: projectsQueryKey,
    queryFn: fetchProjects,
  })
}

export function useProjectsProgress() {
  return useQuery({
    queryKey: projectProgressQueryKey,
    queryFn: fetchProjectsProgress,
  })
}

export function useProjectProgress(projectId: number) {
  const progressQuery = useProjectsProgress()

  return {
    ...progressQuery,
    data: progressQuery.data?.find((progress) => progress.projectId === projectId),
  }
}

export function useProject(id: number) {
  return useQuery({
    queryKey: [...projectsQueryKey, id],
    queryFn: () => fetchProjectById(id),
    enabled: Number.isFinite(id),
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectsQueryKey })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateProjectInput }) =>
      updateProject(id, input),
    onSuccess: (project) => {
      void queryClient.invalidateQueries({ queryKey: projectsQueryKey })
      void queryClient.invalidateQueries({
        queryKey: [...projectsQueryKey, project.id],
      })
    },
  })
}

export function useRemoveProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeProject,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectsQueryKey })
    },
  })
}
