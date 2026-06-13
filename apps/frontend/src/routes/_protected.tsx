import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import {
  currentUserQueryKey,
  fetchCurrentUser,
} from "@/services/auth/auth.service"

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData({
        queryKey: currentUserQueryKey,
        queryFn: fetchCurrentUser,
      })
    } catch {
      throw redirect({ to: "/login" })
    }
  },
  component: ProtectedLayout,
})

function ProtectedLayout() {
  return <Outlet />
}
