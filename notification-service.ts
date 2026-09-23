/**
 * Notification Service
 * 
 * Provides notification listening and management capabilities.
 * Wraps the Web Notifications API with additional features
 * for an iOS-like experience.
 */

export interface NotificationPayload {
  id: string
  title: string
  body?: string
  icon?: string
  tag?: string
  timestamp: number
  appPackage?: string
  data?: Record<string, unknown>
}

export type NotificationPermissionState = 'default' | 'granted' | 'denied'

export interface NotificationServiceInterface {
  requestPermission(): Promise<NotificationPermissionState>
  getPermission(): NotificationPermissionState
  isSupported(): boolean
  show(payload: Omit<NotificationPayload, 'id' | 'timestamp'>): string
  dismiss(id: string): void
  clearAll(): void
  getActive(): NotificationPayload[]
  addListener(listener: (notification: NotificationPayload) => void): () => void
  simulateIncoming(payload: Omit<NotificationPayload, 'id' | 'timestamp'>): void
}

class NotificationService implements NotificationServiceInterface {
  private permission: NotificationPermissionState = 'default'
  private activeNotifications: Map<string, NotificationPayload> = new Map()
  private listeners: Set<(notification: NotificationPayload) => void> = new Set()
  private readonly storageKey = 'ios-notifications-log'
  private nextId = 1

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window
  }

  getPermission(): NotificationPermissionState {
    if (!this.isSupported()) return 'denied'
    return (Notification as any).permission as NotificationPermissionState
  }

  async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) {
      this.permission = 'denied'
      return 'denied'
    }
    try {
      const result = await Notification.requestPermission()
      this.permission = result as NotificationPermissionState
      return this.permission
    } catch {
      this.permission = 'denied'
      return 'denied'
    }
  }

  show(payload: Omit<NotificationPayload, 'id' | 'timestamp'>): string {
    const id = `notif-${this.nextId++}`
    const notification: NotificationPayload = {
      ...payload,
      id,
      timestamp: Date.now(),
    }

    this.activeNotifications.set(id, notification)
    this.notifyListeners(notification)
    this.persistLog(notification)

    if (this.isSupported() && this.getPermission() === 'granted') {
      try {
        const n = new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon,
          tag: payload.tag || id,
        })
        n.onclick = () => {
          window.focus()
          n.close()
        }
      } catch {
        // ignore native notification errors
      }
    }

    return id
  }

  dismiss(id: string): void {
    this.activeNotifications.delete(id)
  }

  clearAll(): void {
    this.activeNotifications.clear()
  }

  getActive(): NotificationPayload[] {
    return Array.from(this.activeNotifications.values())
  }

  addListener(listener: (notification: NotificationPayload) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  simulateIncoming(payload: Omit<NotificationPayload, 'id' | 'timestamp'>): void {
    this.show(payload)
  }

  private notifyListeners(notification: NotificationPayload): void {
    this.listeners.forEach((listener) => listener(notification))
  }

  private persistLog(notification: NotificationPayload): void {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(this.storageKey)
      const log: NotificationPayload[] = raw ? JSON.parse(raw) : []
      log.unshift(notification)
      window.localStorage.setItem(this.storageKey, JSON.stringify(log.slice(0, 100)))
    } catch {
      // ignore storage errors
    }
  }
}

export const notificationService = new NotificationService()