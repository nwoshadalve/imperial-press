import { create } from 'zustand'

interface Notification {
  id: string
  message: string
  read: boolean
  createdAt: string
}

interface NotificationStore {
  notifications: Notification[]
  unreadCount: number
  addNotification: (message: string) => void
  markAllRead: () => void
}

export const useNotificationStore = create<NotificationStore>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (message) => {
    const notification: Notification = {
      id: crypto.randomUUID(),
      message,
      read: false,
      createdAt: new Date().toISOString(),
    }
    const next = [notification, ...get().notifications]
    set({ notifications: next, unreadCount: next.filter(n => !n.read).length })
  },
  markAllRead: () => {
    set({
      notifications: get().notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    })
  },
}))
