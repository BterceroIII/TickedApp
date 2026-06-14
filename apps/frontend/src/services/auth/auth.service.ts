import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api, AUTH_TOKEN_STORAGE_KEY } from "@/services/api"
import { dashboardQueryKey } from "@/services/dashboard/dashboard.service"

export type CreateAccountInput = {
  name: string
  email: string
  password: string
}

export type ConfirmAccountInput = {
  token: string
}

export type LoginInput = {
  email: string
  password: string
}

export type AuthMessageResponse = {
  message: string
}

export type LoginResponse = {
  message: string
  token: string
}

export type CurrentUser = {
  id: string
  name: string
  email: string
  role?: "ADMIN" | "USER"
}

export const currentUserQueryKey = ["auth", "user"] as const

export async function createAccount(input: CreateAccountInput) {
  const { data } = await api.post<AuthMessageResponse>(
    "/auth/create-account",
    input
  )
  return data
}

export async function confirmAccount(input: ConfirmAccountInput) {
  const { data } = await api.post<AuthMessageResponse>(
    "/auth/confirm-account",
    input
  )
  return data
}

export async function login(input: LoginInput) {
  const { data } = await api.post<LoginResponse>("/auth/login", input)
  return data
}

export async function logout() {
  const { data } = await api.post<AuthMessageResponse>("/auth/logout")
  return data
}

export async function fetchCurrentUser() {
  const { data } = await api.get<CurrentUser>("/auth/user")
  return data
}

export function useCreateAccount() {
  return useMutation({
    mutationFn: createAccount,
  })
}

export function useConfirmAccount() {
  return useMutation({
    mutationFn: confirmAccount,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.token)
      void queryClient.invalidateQueries({ queryKey: currentUserQueryKey })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
      void queryClient.removeQueries({ queryKey: currentUserQueryKey })
      void queryClient.removeQueries({ queryKey: dashboardQueryKey })
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
    retry: false,
  })
}
