import { createFileRoute } from "@tanstack/react-router"

import { TickedsPage } from "@/components/tickeds-page"

export const Route = createFileRoute("/_protected/(tickeds)/tickeds")({
  component: TickedsPage,
})
