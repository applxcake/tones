
/// <reference types="vite/client" />

// Add intersection observer type definition
interface IntersectionObserverInit {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

// Add YouTube IFrame API types for better performance handling
interface YT {
  Player: new (
    elementId: string,
    options: {
      height?: number | string;
      width?: number | string;
      videoId?: string;
      playerVars?: {
        autoplay?: number;
        controls?: number;
        disablekb?: number;
        fs?: number;
        rel?: number;
        modestbranding?: number;
        playsinline?: number;
        origin?: string;
      };
      events?: {
        onReady?: (event: YT.PlayerEvent) => void;
        onStateChange?: (event: YT.OnStateChangeEvent) => void;
        onError?: (event: YT.OnErrorEvent) => void;
        onPlaybackQualityChange?: (event: YT.OnPlaybackQualityChangeEvent) => void;
        onPlaybackRateChange?: (event: YT.OnPlaybackRateChangeEvent) => void;
        onApiChange?: (event: YT.PlayerEvent) => void;
      };
    }
  ) => YT.Player;
  PlayerState: {
    UNSTARTED: number;
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
    BUFFERING: number;
    CUED: number;
  };
}
