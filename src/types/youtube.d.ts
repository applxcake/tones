
// Type definitions for YouTube IFrame API
declare namespace YT {
  interface Player {
    loadVideoById: (options: {videoId: string, startSeconds?: number, suggestedQuality?: string}) => void;
    pauseVideo: () => void;
    playVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    setVolume: (volume: number) => void;
    getVolume: () => number;
    setPlaybackRate: (rate: number) => void;
    destroy: () => void;
  }

  interface PlayerEvent {
    target: Player;
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
  }

  interface OnStateChangeEvent {
    data: PlayerState;
    target: Player;
  }
  
  // Add interface for error event
  interface OnErrorEvent {
    data: number; // Error code
    target: Player;
  }
}

interface Window {
  YT: {
    Player: new (
      elementId: string,
      options: {
        height: string | number;
        width: string | number;
        videoId?: string;
        playerVars?: {
          autoplay?: 0 | 1;
          controls?: 0 | 1;
          rel?: 0 | 1;
          modestbranding?: 0 | 1;
          fs?: 0 | 1;
          disablekb?: 0 | 1;  // Added this property
          origin?: string;    // Added this property
          // Add any additional player variables needed
        };
        events?: {
          onReady?: (event: YT.PlayerEvent) => void;
          onStateChange?: (event: YT.OnStateChangeEvent) => void;
          onError?: (event: YT.OnErrorEvent) => void;
        };
      }
    ) => YT.Player;
    PlayerState: typeof YT.PlayerState;
  };
  onYouTubeIframeAPIReady: () => void;
}
