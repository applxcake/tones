import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useState } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

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
    loopMode
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
  
  const onPlayerReady = useCallback(() => {
    isPlayerReadyRef.current = true;
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

  const onPlayerStateChange = useCallback((event: any) => {
    const playerState = event.data;
    if (playerState === window.YT?.PlayerState?.PLAYING) {
      const duration = playerRef.current?.getDuration() || 0;
      setDuration(duration);
    }
  }, [setDuration]);

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
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        }
      });
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
        initializePlayer();
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
  }, [initializePlayer]);

  // Load video when currentTrack changes and player is ready
  useEffect(() => {
    if (playerRef.current && currentTrack && isPlayerReadyRef.current) {
      if (isPlaying) {
        loadVideo(currentTrack.id);
      } else {
        // Just load, don't play
        playerRef.current.loadVideoById({
          videoId: currentTrack.id,
          startSeconds: 0,
          suggestedQuality: 'small'
        });
        playerRef.current.pauseVideo();
      }
    } else if (currentTrack && !isPlayerReadyRef.current) {
      // If not ready, set flag to play when ready
      playWhenReady.current = isPlaying;
    }
  }, [currentTrack, isPlaying, loadVideo]);
  
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
    }
  }, [playbackRate]);

  // Expose seekTo method
  useImperativeHandle(ref, () => ({
    seekTo: (seconds: number) => {
      if (playerRef.current && typeof playerRef.current.seekTo === 'function' && isPlayerReadyRef.current) {
        playerRef.current.seekTo(seconds, true);
      }
    }
  }), []);

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
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      playerRef.current.playVideo();
    }
  };

  return (
    <>
      <div 
        className="hidden" 
        ref={containerRef}
        style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
      />
      {showPlayOverlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={handlePlayOverlayClick}
          style={{ cursor: 'pointer' }}
        >
          <button className="bg-white rounded-full p-6 shadow-lg text-2xl font-bold">
            ▶️ Tap to Play
          </button>
        </div>
      )}
    </>
  );
});

export default YTPlayer;