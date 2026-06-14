import { createFileRoute } from "@tanstack/react-router"

import { InvoicesPage } from "@/components/invoices-page"

export const Route = createFileRoute("/_protected/(invoices)/invoices")({
  component: InvoicesPage,
})
