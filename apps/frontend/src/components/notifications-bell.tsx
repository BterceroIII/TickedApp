import { useState } from "react"
import type { ReactNode } from "react"
import { BellIcon, CheckCheckIcon, Trash2Icon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  type Notification,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotificationEvents,
  useNotifications,
  useRemoveAllNotifications,
  useRemoveNotification,
} from "@/services/notifications/notifications.service"

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const notificationsQuery = useNotifications()
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()
  const removeNotification = useRemoveNotification()
  const removeAllNotifications = useRemoveAllNotifications()
  const notifications = notificationsQuery.data ?? []
  const unreadCount = notifications.filter((notification) => !notification.read).length
  const unreadLabel = unreadCount > 9 ? "9+" : String(unreadCount)

  useNotificationEvents((notification) => {
    toast.info(notification.title, {
      description: notification.message,
    })
  })

  function handleNotificationClick(notification: Notification) {
    if (!notification.read) {
      markAsRead.mutate(notification.id)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="relative"
          aria-label="Notificaciones"
        >
          <BellIcon />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold leading-none text-primary-foreground">
              {unreadLabel}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(24rem,calc(100vw-2rem))] gap-0 p-0">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h2 className="text-lg font-semibold">Notificaciones</h2>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} sin leer`
                : "No tienes notificaciones pendientes"}
            </p>
          </div>
          {unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Marcar todas como leídas"
              disabled={markAllAsRead.isPending}
              onClick={() => markAllAsRead.mutate()}
            >
              <CheckCheckIcon />
            </Button>
          ) : null}
          {notifications.length > 0 ? (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Eliminar todas las notificaciones"
              disabled={removeAllNotifications.isPending}
              onClick={() => removeAllNotifications.mutate()}
            >
              <Trash2Icon />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cerrar notificaciones"
            onClick={() => setOpen(false)}
          >
            <XIcon />
          </Button>
        </div>
        <Separator />
        <div className="max-h-[24rem] overflow-y-auto">
          {notificationsQuery.isLoading ? (
            <NotificationMessage>Cargando notificaciones...</NotificationMessage>
          ) : null}
          {notificationsQuery.isError ? (
            <NotificationMessage>No se pudieron cargar las notificaciones.</NotificationMessage>
          ) : null}
          {notifications.length === 0 && notificationsQuery.isSuccess ? (
            <NotificationMessage>No hay notificaciones por ahora.</NotificationMessage>
          ) : null}
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "flex w-full items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/70",
                !notification.read && "bg-muted/60"
              )}
            >
              <span
                className={cn(
                  "mt-1 size-2 rounded-full bg-transparent",
                  !notification.read && "bg-primary"
                )}
                aria-hidden="true"
              />
              <button
                type="button"
                className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                onClick={() => handleNotificationClick(notification)}
              >
                <span className="line-clamp-2 text-sm font-medium text-foreground">
                  {notification.message}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatNotificationTime(notification.createdAt)}
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Eliminar notificación"
                disabled={removeNotification.isPending}
                onClick={() => removeNotification.mutate(notification.id)}
              >
                <Trash2Icon />
              </Button>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function NotificationMessage({ children }: { children: ReactNode }) {
  return <div className="px-5 py-8 text-center text-sm text-muted-foreground">{children}</div>
}

function formatNotificationTime(date: string) {
  const value = new Date(date).getTime()
  const diff = Date.now() - value
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) {
    return "Ahora"
  }

  if (diff < hour) {
    return `Hace ${Math.floor(diff / minute)} min`
  }

  if (diff < day) {
    return `Hace ${Math.floor(diff / hour)} h`
  }

  if (diff < day * 2) {
    return "Ayer"
  }

  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
  })
}
