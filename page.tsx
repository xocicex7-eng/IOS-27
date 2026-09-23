'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSystemServices } from '@/hooks/use-system-services'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import {
  Bell,
  Volume2,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Music,
  Settings,
  ChevronLeft,
  Check,
  X,
} from 'lucide-react'

const sections = [
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'media', label: 'Media', icon: Music },
  { id: 'general', label: 'General', icon: Settings },
] as const

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<'notifications' | 'media' | 'general'>('notifications')
  const [testNotification, setTestNotification] = useState<{ visible: boolean; title: string; body: string }>({
    visible: false,
    title: '',
    body: '',
  })

  const [state, actions] = useSystemServices()

  const handleTestNotification = () => {
    const id = actions.sendNotification({
      title: 'Test Notification',
      body: 'This is a test notification from System Settings',
      icon: '/icon-light-32x32.png',
      tag: 'test',
    })
    setTestNotification({ visible: true, title: 'Test Sent', body: `ID: ${id}` })
    setTimeout(() => setTestNotification({ ...testNotification, visible: false }), 3000)
  }

  const handleRequestPermission = async () => {
    const permission = await actions.requestNotificationPermission()
    setTestNotification({ visible: true, title: 'Permission', body: `Status: ${permission}` })
    setTimeout(() => setTestNotification({ ...testNotification, visible: false }), 3000)
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'notifications':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Access</CardTitle>
                <CardDescription>
                  Allow apps to read and interact with your notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Switch
                  checked={state.notificationPermission === 'granted'}
                  onCheckedChange={handleRequestPermission}
                  label="Notification Listener"
                  description="Enable system-wide notification monitoring"
                />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Permission</span>
                  <span
                    className={`font-medium px-2 py-0.5 rounded ${
                      state.notificationPermission === 'granted'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : state.notificationPermission === 'denied'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {state.notificationPermission}
                  </span>
                </div>
                <Button variant="outline" onClick={handleRequestPermission} className="w-full">
                  Request Permission
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Notification</CardTitle>
                <CardDescription>Send a test notification to verify settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleTestNotification} className="w-full">
                  <Bell className="mr-2 h-4 w-4" />
                  Send Test Notification
                </Button>
                {testNotification.visible && (
                  <div className="p-3 rounded border border-green-200 bg-green-50 dark:bg-green-900/20">
                    <p className="font-medium text-green-800 dark:text-green-200">{testNotification.title}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">{testNotification.body}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>
                  {state.notifications.length} notification{state.notifications.length !== 1 ? 's' : ''} received
                </CardDescription>
              </CardHeader>
              <CardContent>
                {state.notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No notifications yet</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {state.notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        className="flex items-start gap-3 p-3 rounded border border-border bg-background"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{notif.title}</p>
                          {notif.body && (
                            <p className="text-sm text-muted-foreground truncate">{notif.body}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => actions.dismissNotification(notif.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                {state.notifications.length > 0 && (
                  <Button variant="ghost" onClick={actions.clearNotifications} className="mt-2 w-full">
                    Clear All
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 'media':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Now Playing</CardTitle>
                <CardDescription>Control media playback from any app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.mediaTrack ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                        <Music className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{state.mediaTrack.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {state.mediaTrack.artist || 'Unknown Artist'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                        {Math.floor(state.mediaCurrentTime / 60)}:{String(state.mediaCurrentTime % 60).padStart(2, '0')}
                      </span>
                      <Slider
                        value={state.mediaCurrentTime}
                        min={0}
                        max={state.mediaTrack.duration}
                        step={1}
                        onChange={actions.seekMedia}
                        showValue={false}
                        className="flex-1"
                      />
                      <span className="text-xs text-muted-foreground tabular-nums w-10">
                        {Math.floor(state.mediaTrack.duration / 60)}:{String(state.mediaTrack.duration % 60).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <Button variant="outline" size="icon" onClick={actions.previousMediaTrack}>
                        <SkipBack className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon-lg"
                        onClick={state.mediaState === 'playing' ? actions.pauseMedia : actions.resumeMedia}
                      >
                        {state.mediaState === 'playing' ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={actions.nextMediaTrack}>
                        <SkipForward className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <Slider
                        value={Math.round(state.mediaVolume * 100)}
                        min={0}
                        max={100}
                        step={1}
                        onChange={(v) => actions.setMediaVolume(v / 100)}
                        label=""
                        showValue={false}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No media playing</p>
                    <Button variant="outline" onClick={actions.simulateTrackChange} className="mt-4">
                      Simulate Track
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volume</CardTitle>
                <CardDescription>System media volume control</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <Slider
                    value={Math.round(state.mediaVolume * 100)}
                    min={0}
                    max={100}
                    step={1}
                    onChange={(v) => actions.setMediaVolume(v / 100)}
                    label=""
                    showValue={false}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground tabular-nums w-10">
                    {Math.round(state.mediaVolume * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Playlist</CardTitle>
                <CardDescription>
                  {state.mediaPlaylist.length} track{state.mediaPlaylist.length !== 1 ? 's' : ''} in queue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {state.mediaPlaylist.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Queue is empty</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {state.mediaPlaylist.map((track, index) => (
                      <div
                        key={track.id}
                        className={`flex items-center gap-3 p-2 rounded ${
                          index === state.mediaPlaylist.findIndex(t => t.id === state.mediaTrack?.id)
                            ? 'bg-primary/10 border border-primary/20'
                            : 'border border-border'
                        }`}
                      >
                        <span className="text-sm text-muted-foreground w-6 text-center">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{track.title}</p>
                          <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case 'general':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>System-wide preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Switch
                  checked={true}
                  label="Dark Mode"
                  description="Use system dark mode preference"
                />
                <Switch
                  checked={true}
                  label="Haptic Feedback"
                  description="Vibrate on interactions"
                />
                <Switch
                  checked={false}
                  label="Reduce Motion"
                  description="Minimize animations"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>Application information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Build</span>
                  <span>2026.09.23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Framework</span>
                  <span>Next.js 16</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 text-foreground hover:opacity-80">
              <ChevronLeft className="h-5 w-5" />
              <span className="font-semibold">Settings</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <nav
          className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-border"
          role="tablist"
          aria-label="Settings sections"
        >
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={activeSection === id}
              onClick={() => setActiveSection(id)}
              className={`
                flex items-center gap-2 shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors
                ${activeSection === id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
              `}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <main role="tabpanel" aria-label={activeSection}>
          {renderSection()}
        </main>
      </div>
    </div>
  )
}