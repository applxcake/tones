
// Type definitions for YouTube IFrame API
declare namespace YT {
  interface Player {
    loadVideoById: (options: {videoId: string, startSeconds?: number}) => void;
    pauseVideo: () => void;
    playVideo: () => void;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    getCurrentTime: () => number;
    getDuration: () => number;
    setVolume: (volume: number) => void;
    getVolume: () => number;
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
        };
        events?: {
          onReady?: (event: YT.PlayerEvent) => void;
          onStateChange?: (event: YT.OnStateChangeEvent) => void;
        };
      }
    ) => YT.Player;
    PlayerState: typeof YT.PlayerState;
  };
  onYouTubeIframeAPIReady: () => void;
}
