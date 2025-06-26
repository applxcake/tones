import React, { useEffect, useRef, useCallback } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const YTPlayer: React.FC = () => {
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
  
  const onPlayerReady = useCallback(() => {
    console.log('YouTube player ready');
    isPlayerReadyRef.current = true;
  }, []);

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
        
        if (!isPlaying) {
          setTimeout(() => {
            if (playerRef.current) {
              playerRef.current.pauseVideo();
            }
          }, 100);
        }
      } catch (error) {
        console.error('Error loading video:', error);
      }
    }
  }, [isPlaying]);
  
  const initializePlayer = useCallback(() => {
    if (!hasApiLoadedRef.current || !containerRef.current || playerRef.current) return;
    
    try {
      // Clear the container before initializing
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      
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

  // Load video when track changes - separate effect
  useEffect(() => {
    if (playerRef.current && currentTrack && isPlayerReadyRef.current) {
      loadVideo(currentTrack.id);
    }
  }, [currentTrack, loadVideo]);
  
  // Play/pause based on isPlaying state
  useEffect(() => {
    if (!playerRef.current || !isPlayerReadyRef.current) return;
    
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

  return (
    <div 
      className="hidden" 
      ref={containerRef}
      style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
    />
  );
};

export default YTPlayer;