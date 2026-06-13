import { useEffect, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { API_BASE_URL, api } from "@/services/api"
import {
  projectProgressQueryKey,
  projectsQueryKey,
} from "@/services/projects/projects.service"
import { tickedsQueryKey } from "@/services/tickeds/tickeds.service"

export type Notification = {
  id: number
  userId: string
  title: string
  message: string
  read: boolean
  ticketId?: string | null
  projectId?: number | null
  createdAt: string
  updatedAt: string
}

type NotificationStreamEvent = Notification | { connected: true }

export const notificationsQueryKey = ["notifications"] as const

export async function fetchNotifications() {
  const { data } = await api.get<Notification[]>("/notifications")
  return data
}

export async function markNotificationAsRead(id: number) {
  const { data } = await api.patch<Notification>(`/notifications/${id}/read`)
  return data
}

export async function markAllNotificationsAsRead() {
  const { data } = await api.patch<Notification[]>("/notifications/read-all")
  return data
}

export async function removeNotification(id: number) {
  await api.delete(`/notifications/${id}`)
}

export async function removeAllNotifications() {
  await api.delete("/notifications")
}

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: fetchNotifications,
  })
}

export function useNotificationEvents(
  onNotification?: (notification: Notification) => void
) {
  const queryClient = useQueryClient()
  const onNotificationRef = useRef(onNotification)

  useEffect(() => {
    onNotificationRef.current = onNotification
  }, [onNotification])

  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/notifications/stream`, {
      withCredentials: true,
    })

    function syncRelatedQueries() {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
      void queryClient.invalidateQueries({ queryKey: projectsQueryKey })
      void queryClient.invalidateQueries({ queryKey: projectProgressQueryKey })
      void queryClient.invalidateQueries({ queryKey: tickedsQueryKey })
    }

    function handleNotification(event: MessageEvent) {
      const payload = JSON.parse(event.data) as NotificationStreamEvent

      if ("connected" in payload) {
        syncRelatedQueries()
        return
      }

      const notification = payload

      queryClient.setQueryData<Notification[]>(notificationsQueryKey, (current) => {
        if (!current) {
          return [notification]
        }

        const exists = current.some((item) => item.id === notification.id)

        if (exists) {
          return current.map((item) =>
            item.id === notification.id ? notification : item
          )
        }

        return [notification, ...current]
      })
      syncRelatedQueries()

      if (notification.projectId) {
        void queryClient.invalidateQueries({
          queryKey: [...projectsQueryKey, notification.projectId],
        })
      }

      if (notification.ticketId) {
        void queryClient.invalidateQueries({ queryKey: tickedsQueryKey })
        void queryClient.invalidateQueries({
          queryKey: [...tickedsQueryKey, notification.ticketId],
        })
      }

      onNotificationRef.current?.(notification)
    }

    eventSource.onopen = syncRelatedQueries
    eventSource.onmessage = handleNotification
    eventSource.addEventListener("notification", handleNotification)

    return () => {
      eventSource.removeEventListener("notification", handleNotification)
      eventSource.close()
    }
  }, [queryClient])
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })
}

export function useRemoveNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeNotification,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })
}

export function useRemoveAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeAllNotifications,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })
}
