// Background Audio Service for Mobile Playback
interface AudioSessionConfig {
  category: 'playback' | 'ambient' | 'record' | 'playAndRecord' | 'multiRoute';
  mode: 'default' | 'voiceChat' | 'videoChat' | 'gameChat' | 'videoRecording' | 'measurement' | 'moviePlayback' | 'spokenAudio';
  options: {
    allowBluetooth?: boolean;
    allowBluetoothA2DP?: boolean;
    allowAirPlay?: boolean;
    defaultToSpeaker?: boolean;
    mixWithOthers?: boolean;
    duckOthers?: boolean;
    interruptSpokenAudioAndMixWithOthers?: boolean;
  };
}

interface WakeLockConfig {
  type: 'screen' | 'system';
}

class BackgroundAudioService {
  private wakeLock: WakeLockSentinel | null = null;
  private audioSession: any = null;
  private serviceWorker: ServiceWorkerRegistration | null = null;
  private mediaSession: MediaSession | null = null;
  private isInitialized = false;

  // Initialize the background audio service
  async initialize(): Promise<boolean> {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        this.serviceWorker = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered for background audio');
      }

      // Initialize audio session (iOS/mobile specific)
      await this.initializeAudioSession();

      // Initialize wake lock
      await this.initializeWakeLock();

      // Initialize media session
      this.initializeMediaSession();

      this.isInitialized = true;
      console.log('Background audio service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize background audio service:', error);
      return false;
    }
  }

  // Initialize audio session for mobile devices
  private async initializeAudioSession(): Promise<void> {
    if ('mediaSession' in navigator) {
      this.mediaSession = navigator.mediaSession;
    }

    // iOS/mobile audio session setup
    if (this.isMobile()) {
      try {
        // Set audio session category for background playback
        await this.setAudioSessionCategory({
          category: 'playback',
          mode: 'moviePlayback',
          options: {
            allowBluetooth: true,
            allowBluetoothA2DP: true,
            allowAirPlay: true,
            defaultToSpeaker: false,
            mixWithOthers: false,
            duckOthers: true
          }
        });
      } catch (error) {
        console.warn('Audio session setup failed:', error);
      }
    }
  }

  // Set audio session category (iOS specific)
  private async setAudioSessionCategory(config: AudioSessionConfig): Promise<void> {
    if (this.isIOS()) {
      // iOS-specific audio session setup
      try {
        // This would typically use Web Audio API or native bridge
        // For now, we'll use the Web Audio API approach
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Resume audio context if suspended
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        // Set audio session properties
        if ('setSinkId' in audioContext) {
          // Set audio output device if needed
          console.log('Audio context initialized for background playback');
        }
      } catch (error) {
        console.error('Failed to set audio session category:', error);
      }
    }
  }

  // Initialize wake lock to prevent device sleep
  private async initializeWakeLock(): Promise<void> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        console.log('Wake lock acquired for background audio');
        
        // Handle wake lock release
        this.wakeLock.addEventListener('release', () => {
          console.log('Wake lock released');
        });
      } catch (error) {
        console.warn('Wake lock not available:', error);
      }
    }
  }

  // Initialize media session for lock screen controls
  private initializeMediaSession(): void {
    if ('mediaSession' in navigator) {
      // Set up media session action handlers
      navigator.mediaSession.setActionHandler('play', () => {
        this.handleMediaSessionAction('play');
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.handleMediaSessionAction('pause');
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.handleMediaSessionAction('previous');
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.handleMediaSessionAction('next');
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        this.handleMediaSessionAction('seekto', details.seekTime);
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        this.handleMediaSessionAction('seekbackward', details.seekOffset);
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        this.handleMediaSessionAction('seekforward', details.seekOffset);
      });

      console.log('Media session initialized');
    }
  }

  // Update media session metadata
  updateMediaSession(metadata: {
    title: string;
    artist: string;
    album?: string;
    artwork?: string;
    duration?: number;
  }): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album || 'Unknown Album',
        artwork: metadata.artwork ? [
          { src: metadata.artwork, sizes: '512x512', type: 'image/png' }
        ] : []
      });

      // Update playback state
      navigator.mediaSession.playbackState = 'playing';
    }

    // Update service worker
    if (this.serviceWorker?.active) {
      this.serviceWorker.active.postMessage({
        type: 'UPDATE_MEDIA_SESSION',
        data: metadata
      });
    }
  }

  // Set playback state
  setPlaybackState(state: 'playing' | 'paused' | 'none'): void {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = state;
    }
  }

  // Set position state for seeking
  setPositionState(position: {
    duration: number;
    playbackRate: number;
    position: number;
  }): void {
    if ('mediaSession' in navigator && navigator.mediaSession.setPositionState) {
      navigator.mediaSession.setPositionState(position);
    }
  }

  // Handle media session actions
  private handleMediaSessionAction(action: string, data?: any): void {
    // Dispatch custom event for the player to handle
    const event = new CustomEvent('mediaSessionAction', {
      detail: { action, data }
    });
    window.dispatchEvent(event);
  }

  // Request wake lock
  async requestWakeLock(type: 'screen' = 'screen'): Promise<boolean> {
    if ('wakeLock' in navigator) {
      try {
        this.wakeLock = await navigator.wakeLock.request(type);
        return true;
      } catch (error) {
        console.warn('Failed to request wake lock:', error);
        return false;
      }
    }
    return false;
  }

  // Release wake lock
  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
    }
  }

  // Enable background audio
  async enableBackgroundAudio(): Promise<void> {
    // Request wake lock
    await this.requestWakeLock();

    // Register background sync
    if (this.serviceWorker && 'sync' in this.serviceWorker) {
      try {
        await (this.serviceWorker as any).sync.register('background-audio');
      } catch (error) {
        console.warn('Background sync registration failed:', error);
      }
    }

    // Set up visibility change handler
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  // Handle visibility change
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'hidden') {
      // App went to background - ensure audio continues
      this.ensureBackgroundPlayback();
    } else {
      // App came to foreground
      this.handleForegroundReturn();
    }
  }

  // Ensure audio continues in background
  private ensureBackgroundPlayback(): void {
    // Request wake lock if not already held
    if (!this.wakeLock) {
      this.requestWakeLock();
    }

    // Update media session to indicate background playback
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  }

  // Handle return to foreground
  private handleForegroundReturn(): void {
    // Release wake lock if no longer needed
    if (this.wakeLock) {
      this.releaseWakeLock();
    }
  }

  // Show audio notification
  async showAudioNotification(data: {
    title: string;
    artist: string;
    artwork?: string;
  }): Promise<void> {
    if (this.serviceWorker?.active) {
      this.serviceWorker.active.postMessage({
        type: 'SHOW_AUDIO_NOTIFICATION',
        data
      });
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.releaseWakeLock();
    
    if (this.serviceWorker) {
      await this.serviceWorker.unregister();
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    this.isInitialized = false;
  }

  // Utility methods
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  // Get initialization status
  get isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const backgroundAudioService = new BackgroundAudioService(); 