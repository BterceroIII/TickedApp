import { createFileRoute } from "@tanstack/react-router"

import { ProjectsPage } from "@/components/projects-page"

export const Route = createFileRoute("/(projects)/projects")({
  component: ProjectsPage,
})
