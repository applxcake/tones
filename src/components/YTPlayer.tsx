import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';
import { backgroundAudioService } from '@/services/backgroundAudioService';

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const YTPlayer = forwardRef((props, ref) => {
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    setDuration, 
    playbackRate,
    loopMode,
    togglePlayPause,
    nextTrack,
    previousTrack,
    seekToPosition
  } = usePlayer();
  
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingApiRef = useRef<boolean>(false);
  const hasApiLoadedRef = useRef<boolean>(false);
  const isPlayerReadyRef = useRef<boolean>(false);
  const scriptLoadedRef = useRef<boolean>(false);
  const playWhenReady = useRef(false);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);
  const userInteractedRef = useRef(false);
  const backgroundAudioInitialized = useRef(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  
  // Track last loaded videoId to avoid reloading on play/pause
  const lastLoadedVideoId = useRef<string | null>(null);
  
  // Track if user has interacted with the page (required for autoplay)
  const userHasInteracted = useRef(false);

  // Initialize background audio service
  useEffect(() => {
    const initializeBackgroundAudio = async () => {
      if (!backgroundAudioInitialized.current) {
        try {
          console.log('[YTPlayer] Initializing background audio service...');
          const success = await backgroundAudioService.initialize();
          if (success) {
            backgroundAudioInitialized.current = true;
            console.log('[YTPlayer] Background audio service initialized successfully');
            
            // Update media session if we have a current track
            if (currentTrack && isPlaying) {
              backgroundAudioService.updateMediaSession({
                title: currentTrack.title,
                artist: currentTrack.channelTitle,
                artwork: currentTrack.thumbnailUrl
              });
            }
          } else {
            console.warn('[YTPlayer] Background audio service initialization failed');
          }
        } catch (error) {
          console.error('[YTPlayer] Failed to initialize background audio:', error);
        }
      }
    };

    // Initialize on component mount
    initializeBackgroundAudio();

    // Also initialize when user interacts with the page (required for some browsers)
    const handleUserInteraction = async () => {
      if (!backgroundAudioInitialized.current) {
        initializeBackgroundAudio();
      }
      
      // Request wake lock on user interaction if page is visible
      try {
        await backgroundAudioService.requestWakeLockFromUserInteraction();
      } catch (error) {
        console.warn('[YTPlayer] Failed to request wake lock on user interaction:', error);
      }
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [currentTrack, isPlaying]);

  // Handle visibility changes to ensure background playback
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is hidden, ensure audio continues
        console.log('[YTPlayer] Page hidden - ensuring background playback');
        if (isPlaying && playerRef.current && isPlayerReadyRef.current) {
          // Force play to ensure audio continues
          try {
            if (typeof playerRef.current.playVideo === 'function') {
              playerRef.current.playVideo();
            }
          } catch (e) {
            console.warn('[YTPlayer] Background play failed:', e);
          }
        }
      } else {
        // Page is visible again
        console.log('[YTPlayer] Page visible - audio should continue normally');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Handle media session actions from lock screen/notifications
  useEffect(() => {
    const handleMediaSessionAction = (event: CustomEvent) => {
      const { action, data } = event.detail;
      
      switch (action) {
        case 'play':
          if (!isPlaying) {
            togglePlayPause();
          }
          break;
        case 'pause':
          if (isPlaying) {
            togglePlayPause();
          }
          break;
        case 'next':
          nextTrack();
          break;
        case 'previous':
          previousTrack();
          break;
        case 'seekto':
          if (data && currentTrack) {
            const duration = playerRef.current?.getDuration() || 180;
            const seekPercentage = (data / duration) * 100;
            seekToPosition(seekPercentage);
          }
          break;
        case 'seekforward':
          if (currentTrack) {
            const currentTime = playerRef.current?.getCurrentTime() || 0;
            const newTime = Math.min(currentTime + (data || 10), playerRef.current?.getDuration() || 180);
            playerRef.current?.seekTo(newTime, true);
          }
          break;
        case 'seekbackward':
          if (currentTrack) {
            const currentTime = playerRef.current?.getCurrentTime() || 0;
            const newTime = Math.max(currentTime - (data || 10), 0);
            playerRef.current?.seekTo(newTime, true);
          }
          break;
      }
    };

    window.addEventListener('mediaSessionAction', handleMediaSessionAction as EventListener);
    
    return () => {
      window.removeEventListener('mediaSessionAction', handleMediaSessionAction as EventListener);
    };
  }, [isPlaying, currentTrack, togglePlayPause, nextTrack, previousTrack, seekToPosition]);

  const onPlayerReady = useCallback(() => {
    if (isPlayerReadyRef.current) {
      console.log('[YTPlayer] Player already ready, skipping initialization');
      return;
    }
    
    isPlayerReadyRef.current = true;
    console.log('[YTPlayer] Player ready');
    
    // Ensure player starts unmuted and with proper volume
    if (playerRef.current) {
      try {
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(100);
        }
        console.log('[YTPlayer] Player initialized with unmuted state');
      } catch (e) {
        console.warn('[YTPlayer] Could not set initial player state:', e);
      }
    }
    
    // If we should play when ready, do so now
    if (playWhenReady.current && currentTrack) {
      if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
        playerRef.current.loadVideoById({
          videoId: currentTrack.id,
          startSeconds: 0,
          suggestedQuality: 'small'
        });
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      }
      playWhenReady.current = false;
    }
  }, [currentTrack]);

  const forceUnmuteAndVolume = useCallback(() => {
    if (playerRef.current && isPlayerReadyRef.current) {
      try {
        console.log('[YTPlayer] Attempting to unmute and set volume...');
        
        // First attempt
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(100);
        }
        
        // Check mute state and retry if needed
        if (typeof playerRef.current.isMuted === 'function') {
          const muted = playerRef.current.isMuted();
          setIsAudioMuted(muted);
          console.log('[YTPlayer] Initial mute state:', muted);
          
          if (muted) {
            // Show overlay if audio is muted
            setShowPlayOverlay(true);
            
            // Multiple retry attempts with different intervals
            const retryTimes = [100, 500, 1000, 2000];
            retryTimes.forEach((delay, index) => {
              setTimeout(() => {
                try {
                  if (playerRef.current && isPlayerReadyRef.current) {
                    playerRef.current.unMute();
                    playerRef.current.setVolume(100);
                    const stillMuted = playerRef.current.isMuted();
                    setIsAudioMuted(stillMuted);
                    console.log(`[YTPlayer] Retry ${index + 1} (${delay}ms) - Muted: ${stillMuted}`);
                    
                    if (!stillMuted) {
                      console.log('[YTPlayer] Successfully unmuted!');
                      setShowPlayOverlay(false);
                    }
                  }
                } catch (e) {
                  console.warn(`[YTPlayer] Retry ${index + 1} failed:`, e);
                }
              }, delay);
            });
          } else {
            console.log('[YTPlayer] Player is not muted');
            setShowPlayOverlay(false);
          }
        }
      } catch (e) {
        console.warn('[YTPlayer] Could not force unmute/volume:', e);
      }
    } else {
      console.log('[YTPlayer] Player not ready, skipping unmute/volume');
    }
  }, []);

  const onPlayerStateChange = useCallback((event: any) => {
    const playerState = event.data;
    console.log('[YTPlayer] Player state changed:', playerState);
    
    if (playerState === window.YT?.PlayerState?.PLAYING) {
      const duration = playerRef.current?.getDuration() || 0;
      setDuration(duration);
      
      // Force unmute and set volume when playing starts
      setTimeout(() => {
        forceUnmuteAndVolume();
      }, 100);
      
      // Request wake lock when playback starts
      if (backgroundAudioInitialized.current) {
        backgroundAudioService.onPlaybackStart().catch(error => {
          console.warn('[YTPlayer] Failed to request wake lock on playback start:', error);
        });
      }
      
      // Update media session for background playback
      if (currentTrack && backgroundAudioInitialized.current) {
        backgroundAudioService.updateMediaSession({
          title: currentTrack.title,
          artist: currentTrack.channelTitle,
          artwork: currentTrack.thumbnailUrl,
          duration: duration
        });
        
        backgroundAudioService.setPlaybackState('playing');
        
        // Set position state for seeking
        backgroundAudioService.setPositionState({
          duration: duration,
          playbackRate: playbackRate,
          position: 0
        });
      }

      // Ensure background playback is enabled
      if (document.visibilityState === 'hidden') {
        console.log('[YTPlayer] Playing in background - ensuring audio continues');
        // Force play to ensure audio continues in background
        try {
          if (typeof playerRef.current.playVideo === 'function') {
            playerRef.current.playVideo();
          }
        } catch (e) {
          console.warn('[YTPlayer] Background play failed:', e);
        }
      }
    } else if (playerState === window.YT?.PlayerState?.PAUSED) {
      backgroundAudioService.setPlaybackState('paused');
    } else if (playerState === window.YT?.PlayerState?.ENDED) {
      backgroundAudioService.setPlaybackState('none');
      // Trigger next track when video ends
      console.log('[YTPlayer] Video ended - triggering next track');
      nextTrack();
    } else if (playerState === window.YT?.PlayerState?.BUFFERING) {
      console.log('[YTPlayer] Video buffering...');
    } else if (playerState === window.YT?.PlayerState?.CUED) {
      console.log('[YTPlayer] Video cued and ready to play');
    }
  }, [currentTrack, setDuration, playbackRate, forceUnmuteAndVolume, nextTrack]);

  const loadVideo = useCallback((videoId: string) => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: 0,
          suggestedQuality: 'small'
        });
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      } catch (error) {
        console.error('Error loading video:', error);
      }
    }
  }, []);
  
  const initializePlayer = useCallback(() => {
    if (!hasApiLoadedRef.current || !containerRef.current || playerRef.current) return;
    
    try {
      // Clear the container before initializing
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        if (!containerRef.current.id) {
          containerRef.current.id = 'yt-player-container';
        }
      }
      
      playerRef.current = new window.YT.Player(containerRef.current.id, {
        height: '40',
        width: '40',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
          // Enable background playback
          playsinline: 1,
          // Better mobile support
          iv_load_policy: 3,
          cc_load_policy: 0,
        } as any,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: (event) => {
            console.error('[YTPlayer] Player error:', event.data);
            setPlaybackError('Playback error occurred. Please try again.');
          }
        }
      });
      
      console.log('[YTPlayer] Player initialized');
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
    }
  }, [onPlayerReady, onPlayerStateChange]);
  
  // Load YouTube API only once
  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.getElementById('youtube-api-script');
    
    if (!window.YT && !loadingApiRef.current && !existingScript) {
      loadingApiRef.current = true;
      
      const tag = document.createElement('script');
      tag.id = 'youtube-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      
      window.onYouTubeIframeAPIReady = () => {
        hasApiLoadedRef.current = true;
        scriptLoadedRef.current = true;
        if (!playerRef.current) {
          initializePlayer();
        }
      };
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    } else if (window.YT && window.YT.Player && !playerRef.current && containerRef.current) {
      hasApiLoadedRef.current = true;
      scriptLoadedRef.current = true;
      initializePlayer();
    }
    
    return () => {
      if (playerRef.current) {
        try {
          // Safely destroy the player
          if (typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
          }
          playerRef.current = null;
          isPlayerReadyRef.current = false;
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, []);

  // Load video only when currentTrack changes
  useEffect(() => {
    if (playerRef.current && currentTrack && isPlayerReadyRef.current) {
      if (lastLoadedVideoId.current !== currentTrack.id) {
        // New track selected, load it
        try {
          console.log('[YTPlayer] Loading new video:', currentTrack.id);
          playerRef.current.loadVideoById({
            videoId: currentTrack.id,
            startSeconds: 0,
            suggestedQuality: 'small'
          });
          lastLoadedVideoId.current = currentTrack.id;
          
          // Handle track transition for background playback
          if (backgroundAudioInitialized.current) {
            backgroundAudioService.onTrackTransition({
              title: currentTrack.title,
              artist: currentTrack.channelTitle,
              artwork: currentTrack.thumbnailUrl
            }).catch(error => {
              console.warn('[YTPlayer] Failed to handle track transition:', error);
            });
          }
          
          if (isPlaying) {
            // Small delay to ensure video is loaded before playing
            setTimeout(() => {
              if (playerRef.current && isPlayerReadyRef.current) {
                playerRef.current.playVideo();
                forceUnmuteAndVolume();
              }
            }, 500);
          } else {
            playerRef.current.pauseVideo();
          }
        } catch (e) {
          setPlaybackError('Failed to load video.');
          console.error('[YTPlayer] Error loading video:', e);
        }
      } else {
        // Same track, just play/pause
        if (isPlaying) {
          playerRef.current.playVideo();
          forceUnmuteAndVolume();
        } else {
          playerRef.current.pauseVideo();
        }
      }
    } else if (currentTrack && !isPlayerReadyRef.current) {
      // If not ready, set flag to play when ready
      playWhenReady.current = true;
      console.log('[YTPlayer] Player not ready, setting playWhenReady flag');
    } else if (currentTrack && !playerRef.current) {
      // If no player, try to initialize
      console.log('[YTPlayer] No player available, attempting to initialize');
      if (window.YT && window.YT.Player && containerRef.current) {
        initializePlayer();
      }
    }
  }, [currentTrack, isPlaying, forceUnmuteAndVolume, initializePlayer]);
  
  // Update volume when changed
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setVolume === 'function' && isPlayerReadyRef.current) {
      playerRef.current.setVolume(volume * 100);
    }
  }, [volume]);

  // Update playback rate when changed
  useEffect(() => {
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function' && isPlayerReadyRef.current) {
      playerRef.current.setPlaybackRate(playbackRate);
      
      // Update position state with new playback rate
      if (currentTrack && backgroundAudioInitialized.current) {
        const duration = playerRef.current?.getDuration() || 180;
        const currentTime = playerRef.current?.getCurrentTime() || 0;
        backgroundAudioService.setPositionState({
          duration: duration,
          playbackRate: playbackRate,
          position: currentTime
        });
      }
    }
  }, [playbackRate, currentTrack]);

  // Expose seekTo method
  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function' && isPlayerReadyRef.current) {
        playerRef.current.seekTo(seconds, true);
        
        // Update position state after seeking
        if (currentTrack && backgroundAudioInitialized.current) {
          const duration = playerRef.current?.getDuration() || 180;
          backgroundAudioService.setPositionState({
            duration: duration,
            playbackRate: playbackRate,
            position: seconds
          });
        }
      }
    }
  }), [currentTrack, playbackRate]);

  // On mobile/Android, require user interaction to play
  useEffect(() => {
    if ((isAndroid() || isMobile()) && isPlaying && currentTrack) {
      if (!userInteractedRef.current) {
        setShowPlayOverlay(true);
      }
    } else {
      setShowPlayOverlay(false);
    }
  }, [isPlaying, currentTrack]);

  const handlePlayOverlayClick = () => {
    userInteractedRef.current = true;
    setShowPlayOverlay(false);
    setPlaybackError(null);
    
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        // Force unmute first
        if (typeof playerRef.current.unMute === 'function') {
          playerRef.current.unMute();
        }
        if (typeof playerRef.current.setVolume === 'function') {
          playerRef.current.setVolume(100);
        }
        
        // Then play
        playerRef.current.playVideo();
        forceUnmuteAndVolume();
        console.log('[YTPlayer] playVideo() called from overlay');
      } catch (e) {
        setPlaybackError('Playback failed. Please try again.');
        console.error('[YTPlayer] Playback error:', e);
      }
    } else {
      setPlaybackError('Player not ready. Please try again.');
      console.error('[YTPlayer] Player not ready on overlay click');
    }
  };

  // Handle user interaction to enable audio
  useEffect(() => {
    const handleUserInteraction = () => {
      console.log('[YTPlayer] User interaction detected - enabling audio');
      userInteractedRef.current = true;
      
      // Try to resume audio context if suspended
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('[YTPlayer] Audio context resumed');
          });
        }
      }
      
      // Force unmute and set volume
      if (playerRef.current && isPlayerReadyRef.current) {
        forceUnmuteAndVolume();
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [forceUnmuteAndVolume]);

  // Real-time progress tracking that works in background
  useEffect(() => {
    if (!isPlaying || !currentTrack || !playerRef.current || !isPlayerReadyRef.current) {
      return;
    }

    const updateProgress = () => {
      try {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          
          if (duration > 0) {
            const progress = (currentTime / duration) * 100;
            
            // Update progress in PlayerContext
            if (typeof window !== 'undefined' && (window as any)._updatePlayerProgress) {
              (window as any)._updatePlayerProgress(progress);
            }
            
            // Update media session position state
            if (backgroundAudioInitialized.current) {
              backgroundAudioService.setPositionState({
                duration: duration,
                playbackRate: playbackRate,
                position: currentTime
              });
            }
            
            // Check if song is ending (within last 1 second) and trigger next track
            if (duration - currentTime <= 1 && progress >= 95) {
              console.log('[YTPlayer] Song ending - triggering next track');
              // Small delay to ensure the current track finishes properly
              setTimeout(() => {
                nextTrack();
              }, 500);
            }
          }
        }
      } catch (error) {
        console.warn('[YTPlayer] Error updating progress:', error);
      }
    };

    // Update progress every 500ms for smoother tracking
    const progressInterval = setInterval(updateProgress, 500);
    
    // Also update immediately
    updateProgress();

    return () => {
      clearInterval(progressInterval);
    };
  }, [isPlaying, currentTrack, playbackRate, nextTrack]);

  // Expose setProgress function globally for PlayerContext to use
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any)._setProgress = (progress: number) => {
        // This will be called by the progress tracking mechanism
        // The PlayerContext can access this to update its progress state
        if (typeof window !== 'undefined' && (window as any)._updatePlayerProgress) {
          (window as any)._updatePlayerProgress(progress);
        }
      };
    }
  }, []);

  // Backup mechanism to ensure next track is triggered when video ends
  useEffect(() => {
    if (!isPlaying || !currentTrack || !playerRef.current || !isPlayerReadyRef.current) {
      return;
    }

    const checkVideoEnd = () => {
      try {
        if (playerRef.current && typeof playerRef.current.getPlayerState === 'function') {
          const playerState = playerRef.current.getPlayerState();
          
          // YouTube PlayerState.ENDED = 0
          if (playerState === 0) {
            console.log('[YTPlayer] Video ended detected by state check - triggering next track');
            nextTrack();
          }
        }
      } catch (error) {
        console.warn('[YTPlayer] Error checking video end:', error);
      }
    };

    // Check every 2 seconds for video end state
    const endCheckInterval = setInterval(checkVideoEnd, 2000);

    return () => {
      clearInterval(endCheckInterval);
    };
  }, [isPlaying, currentTrack, nextTrack]);

  // Simple audio test function
  const testAudio = useCallback(() => {
    if (playerRef.current && isPlayerReadyRef.current) {
      try {
        console.log('[YTPlayer] Testing audio...');
        
        // Check player state
        const playerState = playerRef.current.getPlayerState();
        console.log('[YTPlayer] Player state:', playerState);
        
        // Check if muted
        const isMuted = playerRef.current.isMuted();
        console.log('[YTPlayer] Is muted:', isMuted);
        
        // Check volume
        const volume = playerRef.current.getVolume();
        console.log('[YTPlayer] Volume:', volume);
        
        // Try to unmute and set volume
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
        
        // Check again
        const newMuted = playerRef.current.isMuted();
        const newVolume = playerRef.current.getVolume();
        console.log('[YTPlayer] After fix - Muted:', newMuted, 'Volume:', newVolume);
        
        return !newMuted && newVolume > 0;
      } catch (error) {
        console.error('[YTPlayer] Audio test failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Expose test function globally for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).testYTPlayerAudio = testAudio;
    }
  }, [testAudio]);

  // Ensure player is initialized when component mounts
  useEffect(() => {
    const ensurePlayerInitialized = () => {
      if (!playerRef.current && window.YT && window.YT.Player && containerRef.current) {
        console.log('[YTPlayer] Ensuring player is initialized on mount');
        initializePlayer();
      }
    };

    // Try immediately
    ensurePlayerInitialized();
    
    // Also try after a short delay in case API is still loading
    const timeoutId = setTimeout(ensurePlayerInitialized, 1000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [initializePlayer]);

  return (
    <>
      <div
        ref={containerRef}
        style={{ width: 40, height: 40, opacity: 0.2, pointerEvents: 'none', position: 'fixed', right: 8, bottom: 8, zIndex: 10 }}
      />
      {showPlayOverlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={handlePlayOverlayClick}
          style={{ cursor: 'pointer' }}
        >
          <button className="bg-white rounded-full p-6 shadow-lg text-2xl font-bold">
            {isAudioMuted ? '🔊 Tap to Enable Audio' : '▶️ Tap to Play'}
          </button>
        </div>
      )}
      {playbackError && (
        <div className="fixed bottom-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          {playbackError}
        </div>
      )}
    </>
  );
});

export default YTPlayer;