import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { getApiErrorMessage } from "@/services/api"
import { useCurrentUser, useLogout } from "@/services/auth/auth.service"
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react"

function getUserInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.trim() || "Usuario"
  const words = source.split(/\s+/).filter(Boolean)

  if (words.length > 1) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const currentUser = useCurrentUser()
  const logoutMutation = useLogout()
  const user = currentUser.data
  const name = user?.name || "Usuario"
  const email = user?.email || "Cargando sesión..."
  const initials = getUserInitials(user?.name, user?.email)

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(data.message)
        void navigate({ to: "/login" })
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error))
      },
    })
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={logoutMutation.isPending}
              onSelect={handleLogout}
            >
              <LogOutIcon />
              {logoutMutation.isPending ? "Cerrando sesión..." : "Cerrar sesión"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
