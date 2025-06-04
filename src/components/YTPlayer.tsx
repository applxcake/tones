
import React, { useEffect, useRef } from 'react';
import { usePlayer } from '@/contexts/PlayerContext';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
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
  
  // Load YouTube API
  useEffect(() => {
    if (!window.YT && !loadingApiRef.current) {
      loadingApiRef.current = true;
      
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      window.onYouTubeIframeAPIReady = () => {
        hasApiLoadedRef.current = true;
        initializePlayer();
      };
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else if (window.YT && window.YT.Player) {
      hasApiLoadedRef.current = true;
      initializePlayer();
    }
    
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, [currentTrack]);
  
  const initializePlayer = () => {
    if (!hasApiLoadedRef.current || !containerRef.current) return;
    
    try {
      playerRef.current = new window.YT.Player('youtube-player', {
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
  };

  const onPlayerReady = () => {
    console.log('YouTube player ready');
    if (currentTrack) {
      loadVideo(currentTrack.id);
    }
  };

  const onPlayerStateChange = (event: any) => {
    const playerState = event.data;
    
    if (playerState === window.YT.PlayerState.PLAYING) {
      const duration = playerRef.current?.getDuration() || 0;
      setDuration(duration);
    }
  };
  
  // Load video when track changes
  useEffect(() => {
    if (playerRef.current && currentTrack && hasApiLoadedRef.current) {
      loadVideo(currentTrack.id);
    }
  }, [currentTrack]);
  
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

  const loadVideo = (videoId: string) => {
    if (playerRef.current && typeof playerRef.current.loadVideoById === 'function') {
      try {
        playerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: 0,
          suggestedQuality: 'small'
        });
        
        if (!isPlaying) {
          setTimeout(() => {
            playerRef.current?.pauseVideo();
          }, 100);
        }
      } catch (error) {
        console.error('Error loading video:', error);
      }
    }
  };

  return <div id="youtube-player" className="hidden" ref={containerRef} />;
};

export default YTPlayer;
