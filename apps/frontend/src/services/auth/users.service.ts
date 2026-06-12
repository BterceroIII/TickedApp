import { useQuery } from "@tanstack/react-query"

import { api } from "@/services/api"

export type User = {
  id: string
  name?: string | null
  email: string
}

export const usersQueryKey = ["auth", "users"] as const

export function getUserDisplayName(user: User) {
  return user.name?.trim() || user.email
}

export async function fetchUsers() {
  const { data } = await api.get<User[]>("/auth/users")
  return data
}

export function useUsers() {
  return useQuery({
    queryKey: usersQueryKey,
    queryFn: fetchUsers,
  })
}
