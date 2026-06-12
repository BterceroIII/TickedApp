import { createFileRoute } from "@tanstack/react-router"

import { TickedsPage } from "@/components/tickeds-page"

export const Route = createFileRoute("/(tickeds)/tickeds")({
  component: TickedsPage,
})
