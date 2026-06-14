import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Link, useRouterState } from "@tanstack/react-router"
import { ChevronRightIcon } from "lucide-react"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: React.ReactNode
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <SidebarGroup className="gap-2">
      <SidebarGroupLabel className="h-9 text-sm">Portal</SidebarGroupLabel>
      <SidebarMenu className="gap-1.5">
        {items.map((item) => {
          const hasDropdownTransition = ["Proyectos", "Tickets"].includes(
            item.title
          )
          const isActive = item.url === pathname

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    size="lg"
                    tooltip={item.title}
                    className="text-[0.95rem]"
                  >
                    <Link to={item.url}>
                      {item.icon}
                      <span>{item.title}</span>
                      {item.items?.length ? (
                        <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      ) : null}
                    </Link>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items?.length ? (
                  <CollapsibleContent
                    forceMount={hasDropdownTransition || undefined}
                    className={cn(
                      hasDropdownTransition &&
                        "overflow-hidden transition-[height,opacity] duration-300 ease-out data-[state=closed]:h-0 data-[state=closed]:opacity-0 data-[state=open]:h-(--radix-collapsible-content-height) data-[state=open]:opacity-100"
                    )}
                  >
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link to={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
