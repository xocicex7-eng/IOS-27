/**
 * useSystemServices Hook
 * 
 * React hook that exposes the Notification and Media services
 * as reactive state for UI components.
 */

import { useState, useEffect, useCallback } from 'react'
import { notificationService } from '@/lib/services/notification-service'
import { mediaService } from '@/lib/services/media-service'
import type { NotificationPayload } from '@/lib/services/notification-service'
import type {
  MediaTrack,
  MediaServiceInterface,
  PlaybackState,
} from '@/lib/services/media-service'

export interface SystemServicesState {
  notificationPermission: 'default' | 'granted' | 'denied'
  notifications: NotificationPayload[]
  mediaState: PlaybackState
  mediaTrack: MediaTrack | null
  mediaVolume: number
  mediaCurrentTime: number
  mediaPlaylist: MediaTrack[]
}

export interface SystemServicesActions {
  requestNotificationPermission(): Promise<'default' | 'granted' | 'denied'>
  sendNotification(payload: Omit<NotificationPayload, 'id' | 'timestamp'>): string
  dismissNotification(id: string): void
  clearNotifications(): void
  setMediaVolume(volume: number): void
  playMedia(track: MediaTrack): void
  pauseMedia(): void
  resumeMedia(): void
  stopMedia(): void
  seekMedia(seconds: number): void
  nextMediaTrack(): void
  previousMediaTrack(): void
  setMediaPlaylist(tracks: MediaTrack[], startIndex?: number): void
  simulateTrackChange(): void
}

export function useSystemServices(): [SystemServicesState, SystemServicesActions] {
  const [state, setState] = useState<SystemServicesState>({
    notificationPermission: notificationService.getPermission(),
    notifications: notificationService.getActive(),
    mediaState: 'idle',
    mediaTrack: null,
    mediaVolume: 0.8,
    mediaCurrentTime: 0,
    mediaPlaylist: [],
  })

  // Sync with notification service
  useEffect(() => {
    const unsubscribe = notificationService.addListener((notification) => {
      setState((prev) => ({
        ...prev,
        notifications: notificationService.getActive(),
      }))
    })
    return unsubscribe
  }, [])

  // Sync with media service
  useEffect(() => {
    const unsubscribe = mediaService.addListener((mediaState) => {
      setState((prev) => ({
        ...prev,
        mediaState: mediaState.state,
        mediaTrack: mediaState.track,
        mediaVolume: mediaState.volume,
        mediaCurrentTime: mediaState.currentTime,
        mediaPlaylist: mediaService.getPlaylist(),
      }))
    })
    // Initial sync
    const initial = mediaService.getState()
    setState((prev) => ({
      ...prev,
      mediaState: initial.state,
      mediaTrack: initial.track,
      mediaVolume: initial.volume,
      mediaCurrentTime: initial.currentTime,
      mediaPlaylist: mediaService.getPlaylist(),
    }))
    return unsubscribe
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    const permission = await notificationService.requestPermission()
    setState((prev) => ({ ...prev, notificationPermission: permission }))
    return permission
  }, [])

  const sendNotification = useCallback(
    (payload: Omit<NotificationPayload, 'id' | 'timestamp'>) => {
      return notificationService.show(payload)
    },
    []
  )

  const dismissNotification = useCallback((id: string) => {
    notificationService.dismiss(id)
    setState((prev) => ({ ...prev, notifications: notificationService.getActive() }))
  }, [])

  const clearNotifications = useCallback(() => {
    notificationService.clearAll()
    setState((prev) => ({ ...prev, notifications: [] }))
  }, [])

  const setMediaVolume = useCallback((volume: number) => {
    mediaService.setVolume(volume)
  }, [])

  const playMedia = useCallback((track: MediaTrack) => {
    mediaService.play(track)
  }, [])

  const pauseMedia = useCallback(() => {
    mediaService.pause()
  }, [])

  const resumeMedia = useCallback(() => {
    mediaService.resume()
  }, [])

  const stopMedia = useCallback(() => {
    mediaService.stop()
  }, [])

  const seekMedia = useCallback((seconds: number) => {
    mediaService.seek(seconds)
  }, [])

  const nextMediaTrack = useCallback(() => {
    mediaService.next()
  }, [])

  const previousMediaTrack = useCallback(() => {
    mediaService.previous()
  }, [])

  const setMediaPlaylist = useCallback((tracks: MediaTrack[], startIndex?: number) => {
    mediaService.setPlaylist(tracks, startIndex)
  }, [])

  const simulateTrackChange = useCallback(() => {
    mediaService.simulateTrackChange()
  }, [])

  const actions: SystemServicesActions = {
    requestNotificationPermission,
    sendNotification,
    dismissNotification,
    clearNotifications,
    setMediaVolume,
    playMedia,
    pauseMedia,
    resumeMedia,
    stopMedia,
    seekMedia,
    nextMediaTrack,
    previousMediaTrack,
    setMediaPlaylist,
    simulateTrackChange,
  }

  return [state, actions]
}

export type { MediaServiceInterface, PlaybackState, MediaTrack, NotificationPayload }