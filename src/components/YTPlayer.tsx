
import React, { useEffect, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

// YouTube IFrame API type declaration
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YTPlayer: React.FC = () => {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    seekToPosition,
    setDuration, 
    playbackRate,
    loopMode
  } = usePlayer();
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingApiRef = useRef<boolean>(false);
  const hasApiLoadedRef = useRef<boolean>(false);
  
  // Load YouTube API script
  useEffect(() => {
    if (!window.YT && !loadingApiRef.current) {
      loadingApiRef.current = true;
      
      // Create script element
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      // Insert script before first script tag
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      // Define callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        hasApiLoadedRef.current = true;
        initializePlayer();
      };
    } else if (window.YT && window.YT.Player) {
      hasApiLoadedRef.current = true;
      initializePlayer();
    }
    
    // Clean up
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, []);
  
  // Initialize player when API is ready and container is rendered
  const initializePlayer = () => {
    if (!hasApiLoadedRef.current || !containerRef.current) return;
    
    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError
        }
      });
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  };

  // Player event handlers
  const onPlayerReady = (event: any) => {
    console.log('YouTube player ready');
    applyPlayerSettings();
    
    if (currentTrack) {
      loadVideo(currentTrack.id);
    }
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    
    // Update duration when video loads
    if (playerState === window.YT.PlayerState.PLAYING) {
      const duration = playerRef.current?.getDuration() || 0;
      setDuration(duration);
      
      // Start progress tracking
      startProgressTracking();
    }
    
    // Handle video ended
    if (playerState === window.YT.PlayerState.ENDED) {
      if (loopMode === 'one') {
        playerRef.current?.seekTo(0, true);
        playerRef.current?.playVideo();
      } else {
        // Next track handled by the context
      }
    }
  };

  const onPlayerError = (event: any) => {
    console.error('YouTube player error:', event.data);
  };

  // Track video progress
  const startProgressTracking = () => {
    const intervalId = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
        try {
          const currentTime = playerRef.current.getCurrentTime() || 0;
          const duration = playerRef.current.getDuration() || 100;
          const progressPercent = (currentTime / duration) * 100;
          
          // No need to manually update progress here, as it's done in PlayerContext
        } catch (error) {
          console.error('Error getting player time:', error);
        }
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  };
  
  // Load video when track changes
  useEffect(() => {
    if (playerRef.current && currentTrack && hasApiLoadedRef.current) {
      loadVideo(currentTrack.id);
    }
  }, [currentTrack]);
  
  // Apply player settings (volume, playback rate)
  const applyPlayerSettings = () => {
    if (playerRef.current) {
      if (typeof playerRef.current.setVolume === 'function') {
        playerRef.current.setVolume(volume * 100);
      }
      
      if (typeof playerRef.current.setPlaybackRate === 'function') {
        playerRef.current.setPlaybackRate(playbackRate);
      }
    }
  };
  
  // Play/pause based on isPlaying state
  useEffect(() => {
    if (!playerRef.current || !hasApiLoadedRef.current) return;
    
    if (isPlaying) {
      try {
        playerRef.current.playVideo();
      } catch (error) {
        console.error('Error playing video:', error);
      }
    } else {
      try {
        playerRef.current.pauseVideo();
      } catch (error) {
        console.error('Error pausing video:', error);
      }
    }
  }, [isPlaying]);

  // Update volume when changed
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Update playback rate when changed
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      playerRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  // Load video helper function
  const loadVideo = (videoId: string) => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: 0,
          suggestedQuality: 'small'
        });
        
        // If not supposed to be playing, pause immediately after loading
        if (!isPlaying) {
          setTimeout(() => {
            playerRef.current.pauseVideo();
          }, 100);
        }
      } catch (error) {
        console.error('Error loading video:', error);
      }
    }
  };

  return <div id="youtube-player-container" ref={containerRef} className="hidden" />;
};

export default YTPlayer;
