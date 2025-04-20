
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { YouTubeVideo } from '@/services/youtubeService';
import { toast } from '@/components/ui/use-toast';

// Define YouTube Player API types
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}

// YouTube Player Types
declare namespace YT {
  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions);
    loadVideoById(videoId: string, startSeconds?: number): void;
    cueVideoById(videoId: string, startSeconds?: number): void;
    playVideo(): void;
    pauseVideo(): void;
    stopVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getVideoLoadedFraction(): number;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): number;
    setVolume(volume: number): void;
    getVolume(): number;
    destroy(): void;
  }

  interface PlayerOptions {
    videoId?: string;
    width?: number | string;
    height?: number | string;
    playerVars?: {
      autoplay?: 0 | 1;
      controls?: 0 | 1;
      disablekb?: 0 | 1;
      fs?: 0 | 1;
      iv_load_policy?: 1 | 3;
      modestbranding?: 0 | 1;
      rel?: 0 | 1;
      start?: number;
      [key: string]: any;
    };
    events?: {
      onReady?: (event: { target: Player }) => void;
      onStateChange?: (event: { data: number; target: Player }) => void;
      onError?: (event: { data: number; target: Player }) => void;
      [key: string]: any;
    };
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
  }
}

interface PlayerContextType {
  currentTrack: YouTubeVideo | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  recentlyPlayed: YouTubeVideo[];
  queue: YouTubeVideo[];
  likedSongs: YouTubeVideo[];
  playTrack: (track: YouTubeVideo) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: YouTubeVideo) => void;
  toggleLike: (track: YouTubeVideo) => boolean;
  isLiked: (trackId: string) => boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<YouTubeVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeVideo[]>([]);
  const [queue, setQueue] = useState<YouTubeVideo[]>([]);
  const [likedSongs, setLikedSongs] = useState<YouTubeVideo[]>([]);
  const [isApiReady, setIsApiReady] = useState(false);
  
  // YouTube Player integration
  const playerRef = useRef<YT.Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Load YouTube IFrame API
  useEffect(() => {
    // Only load the API if it's not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      
      // Set up the callback for when the API is ready
      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    } else {
      setIsApiReady(true);
    }
    
    // Create hidden container for YouTube player if it doesn't exist
    if (!playerContainerRef.current) {
      const container = document.createElement('div');
      container.id = 'youtube-player-container';
      container.style.position = 'absolute';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      document.body.appendChild(container);
      playerContainerRef.current = container;
    }
    
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error("Error destroying player:", err);
        }
      }
    };
  }, []);
  
  // Initialize YouTube Player when API is ready and we have a track
  useEffect(() => {
    const initPlayer = () => {
      if (currentTrack && playerContainerRef.current && isApiReady && window.YT && window.YT.Player) {
        try {
          if (playerRef.current) {
            // If player exists, just load the new video
            playerRef.current.loadVideoById(currentTrack.id);
            if (isPlaying) {
              playerRef.current.playVideo();
            } else {
              playerRef.current.pauseVideo();
            }
          } else {
            // Create new player
            playerRef.current = new window.YT.Player('youtube-player-container', {
              videoId: currentTrack.id,
              playerVars: {
                autoplay: isPlaying ? 1 : 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                iv_load_policy: 3,
                modestbranding: 1,
                rel: 0
              },
              events: {
                onReady: (event) => {
                  event.target.setVolume(volume * 100);
                  if (isPlaying) {
                    event.target.playVideo();
                  }
                },
                onStateChange: (event) => {
                  if (event.data === window.YT.PlayerState.ENDED) {
                    nextTrack();
                  }
                  if (event.data === window.YT.PlayerState.PLAYING) {
                    startProgressInterval();
                  }
                  if (event.data === window.YT.PlayerState.PAUSED) {
                    clearProgressInterval();
                  }
                },
                onError: (event) => {
                  console.error('YouTube player error:', event.data);
                  toast({
                    title: "Playback Error",
                    description: "Could not play this track. YouTube API limits apply.",
                    variant: "destructive"
                  });
                  nextTrack();
                }
              }
            });
          }
        } catch (error) {
          console.error("Error initializing YouTube player:", error);
          toast({
            title: "Player Error",
            description: "There was a problem initializing the player. Please try again.",
            variant: "destructive"
          });
        }
      }
    };

    // Only initialize if API is ready and we have a track
    if (isApiReady && currentTrack) {
      initPlayer();
    }
  }, [currentTrack, isApiReady]);
  
  // Progress tracking
  const progressIntervalRef = useRef<number | null>(null);
  
  const startProgressInterval = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    
    progressIntervalRef.current = window.setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && typeof playerRef.current.getDuration === 'function') {
        try {
          const currentTime = playerRef.current.getCurrentTime() || 0;
          const duration = playerRef.current.getDuration() || 1;
          const progressPercent = (currentTime / duration) * 100;
          setProgress(isNaN(progressPercent) ? 0 : progressPercent);
        } catch (error) {
          console.error("Error updating progress:", error);
        }
      }
    }, 1000);
  };
  
  const clearProgressInterval = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };
  
  // Effect to update YouTube player state based on isPlaying
  useEffect(() => {
    if (playerRef.current && isApiReady) {
      try {
        if (isPlaying && typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        } else if (!isPlaying && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      } catch (error) {
        console.error("Error toggling play state:", error);
      }
    }
  }, [isPlaying, isApiReady]);
  
  // Effect to update YouTube player volume
  useEffect(() => {
    if (playerRef.current && isApiReady && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(volume * 100);
      } catch (error) {
        console.error("Error setting volume:", error);
      }
    }
  }, [volume, isApiReady]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearProgressInterval();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error("Error destroying player:", err);
        }
      }
    };
  }, []);

  const playTrack = (track: YouTubeVideo) => {
    // Add current track to recently played if it exists
    if (currentTrack) {
      setRecentlyPlayed(prev => {
        // Filter out this track if it's already in the list
        const filtered = prev.filter(item => item.id !== currentTrack.id);
        // Add it to the beginning and limit to 20 items
        return [currentTrack, ...filtered].slice(0, 20);
      });
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (queue.length > 0) {
      // Play the next track in the queue
      const nextUp = queue[0];
      setQueue(prev => prev.slice(1));
      playTrack(nextUp);
    } else {
      // No more tracks in queue
      setIsPlaying(false);
    }
  };

  const prevTrack = () => {
    if (recentlyPlayed.length > 0) {
      // Play the previous track from history
      const prevTrack = recentlyPlayed[0];
      setRecentlyPlayed(prev => prev.slice(1));
      // Add current track to the beginning of the queue if it exists
      if (currentTrack) {
        setQueue(prev => [currentTrack, ...prev]);
      }
      setCurrentTrack(prevTrack);
      setIsPlaying(true);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
  };

  const addToQueue = (track: YouTubeVideo) => {
    setQueue(prev => [...prev, track]);
    toast({
      title: "Added to Queue",
      description: `"${track.title}" added to your queue.`,
    });
  };
  
  const toggleLike = (track: YouTubeVideo) => {
    const isCurrentlyLiked = likedSongs.some(song => song.id === track.id);
    
    if (isCurrentlyLiked) {
      // Remove from liked songs
      setLikedSongs(prev => prev.filter(song => song.id !== track.id));
      toast({
        title: "Removed from Liked Songs",
        description: `"${track.title}" removed from your liked songs.`,
      });
      return false;
    } else {
      // Add to liked songs
      setLikedSongs(prev => [...prev, track]);
      toast({
        title: "Added to Liked Songs",
        description: `"${track.title}" added to your liked songs.`,
      });
      return true;
    }
  };
  
  const isLiked = (trackId: string) => {
    return likedSongs.some(song => song.id === trackId);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        volume,
        recentlyPlayed,
        queue,
        likedSongs,
        playTrack,
        togglePlayPause,
        nextTrack,
        prevTrack,
        setVolume,
        addToQueue,
        toggleLike,
        isLiked,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
