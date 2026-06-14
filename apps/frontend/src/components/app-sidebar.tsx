import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  FolderKanbanIcon,
  HomeIcon,
  MessageSquareIcon,
  ReceiptTextIcon,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <HomeIcon />,
    },
    {
      title: "Proyectos",
      url: "/projects",
      icon: <FolderKanbanIcon />,
    },
    {
      title: "Tickets",
      url: "/tickeds",
      icon: <MessageSquareIcon />,
    },
    {
      title: "Facturas",
      url: "/invoices",
      icon: <ReceiptTextIcon />,
    },
  ]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex h-12 items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
            CP
          </div>
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium text-sidebar-foreground">
              ClientPortal
            </span>
            <span className="truncate font-mono text-xs text-sidebar-foreground/65">
              v1.0 · Demo
            </span>
          </div>
        </div>
        <SidebarSeparator />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
