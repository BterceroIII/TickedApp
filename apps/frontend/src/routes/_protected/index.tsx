import { createFileRoute } from "@tanstack/react-router"

import { App } from "@/App"
import { dashboardQueryOptions } from "@/services/dashboard/dashboard.service"

export const Route = createFileRoute("/_protected/")({
  loader: ({ context }) => context.queryClient.prefetchQuery(dashboardQueryOptions),
  component: App,
})
