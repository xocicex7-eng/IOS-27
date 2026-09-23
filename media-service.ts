/**
 * Media Service
 * 
 * Provides media playback control and volume management.
 * Simulates iOS Control Center media controls with
 * a clean, reactive state model.
 */

export interface MediaTrack {
  id: string
  title: string
  artist?: string
  album?: string
  duration: number // seconds
  artwork?: string
  source?: 'local' | 'stream' | 'airplay'
}

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'buffering' | 'error'

export interface MediaServiceInterface {
  getState(): { state: PlaybackState; track: MediaTrack | null; volume: number; currentTime: number }
  setVolume(volume: number): void
  getVolume(): number
  play(track: MediaTrack): void
  pause(): void
  resume(): void
  stop(): void
  seek(seconds: number): void
  next(): void
  previous(): void
  setPlaylist(tracks: MediaTrack[], startIndex?: number): void
  getPlaylist(): MediaTrack[]
  addListener(listener: (state: ReturnType<MediaServiceInterface['getState']>) => void): () => void
  simulateTrackChange(): void
}

const DEFAULT_VOLUME = 0.8
const MOCK_TRACKS: MediaTrack[] = [
  { id: '1', title: 'Midnight Drive', artist: 'Neon Waves', album: 'Synthwave Dreams', duration: 245, source: 'stream' },
  { id: '2', title: 'Golden Hour', artist: 'Luna Echo', album: 'Coastal Tapes', duration: 198, source: 'local' },
  { id: '3', title: 'Static Bloom', artist: 'Static Bloom', album: 'Signal', duration: 212, source: 'airplay' },
]

class MediaService implements MediaServiceInterface {
  private state: PlaybackState = 'idle'
  private track: MediaTrack | null = null
  private volume: number = DEFAULT_VOLUME
  private currentTime: number = 0
  private playlist: MediaTrack[] = []
  private playlistIndex: number = -1
  private listeners: Set<(state: ReturnType<MediaServiceInterface['getState']>) => void> = new Set()
  private progressTimer: ReturnType<typeof setInterval> | null = null

  getState() {
    return { state: this.state, track: this.track, volume: this.volume, currentTime: this.currentTime }
  }

  getVolume(): number {
    return this.volume
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    this.notifyListeners()
  }

  play(track: MediaTrack): void {
    this.track = track
    this.state = 'playing'
    this.currentTime = 0
    this.startProgressTimer()
    this.notifyListeners()
  }

  pause(): void {
    if (this.state === 'playing') {
      this.state = 'paused'
      this.stopProgressTimer()
      this.notifyListeners()
    }
  }

  resume(): void {
    if (this.state === 'paused' && this.track) {
      this.state = 'playing'
      this.startProgressTimer()
      this.notifyListeners()
    }
  }

  stop(): void {
    this.state = 'idle'
    this.track = null
    this.currentTime = 0
    this.stopProgressTimer()
    this.notifyListeners()
  }

  seek(seconds: number): void {
    if (!this.track) return
    this.currentTime = Math.max(0, Math.min(this.track.duration, seconds))
    this.notifyListeners()
  }

  next(): void {
    if (this.playlist.length === 0) {
      this.stop()
      return
    }
    this.playlistIndex = (this.playlistIndex + 1) % this.playlist.length
    this.track = this.playlist[this.playlistIndex]
    this.state = 'playing'
    this.currentTime = 0
    this.startProgressTimer()
    this.notifyListeners()
  }

  previous(): void {
    if (this.playlist.length === 0) {
      this.stop()
      return
    }
    this.playlistIndex = Math.max(0, this.playlistIndex - 1)
    this.track = this.playlist[this.playlistIndex]
    this.state = 'playing'
    this.currentTime = 0
    this.startProgressTimer()
    this.notifyListeners()
  }

  setPlaylist(tracks: MediaTrack[], startIndex: number = 0): void {
    this.playlist = tracks
    this.playlistIndex = startIndex
    if (tracks.length > 0) {
      this.track = tracks[startIndex]
      this.state = 'playing'
      this.currentTime = 0
      this.startProgressTimer()
    }
    this.notifyListeners()
  }

  getPlaylist(): MediaTrack[] {
    return this.playlist
  }

  addListener(listener: (state: ReturnType<MediaServiceInterface['getState']>) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  simulateTrackChange(): void {
    if (this.playlist.length > 0) {
      this.next()
    } else if (MOCK_TRACKS.length > 0) {
      this.setPlaylist(MOCK_TRACKS, 0)
    } else {
      this.stop()
    }
  }

  private startProgressTimer(): void {
    this.stopProgressTimer()
    this.progressTimer = setInterval(() => {
      if (this.state === 'playing' && this.track) {
        this.currentTime += 1
        if (this.currentTime >= this.track.duration) {
          this.next()
        }
        this.notifyListeners()
      }
    }, 1000)
  }

  private stopProgressTimer(): void {
    if (this.progressTimer) {
      clearInterval(this.progressTimer)
      this.progressTimer = null
    }
  }

  private notifyListeners(): void {
    const snapshot = this.getState()
    this.listeners.forEach((listener) => listener(snapshot))
  }
}

export const mediaService = new MediaService()