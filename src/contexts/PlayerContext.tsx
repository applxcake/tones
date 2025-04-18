
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { YouTubeVideo } from '@/services/youtubeService';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define YouTube Player API types
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: (() => void) | null;
  }
}

// Define YouTubeVideoBasic type for videos from database with fewer properties
interface YouTubeVideoBasic {
  id: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt?: string;
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
  recentlyPlayed: YouTubeVideoBasic[];
  queue: YouTubeVideo[];
  likedSongs: YouTubeVideoBasic[];
  playTrack: (track: YouTubeVideo) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: YouTubeVideo) => void;
  toggleLike: (track: YouTubeVideo) => Promise<boolean>;
  isLiked: (trackId: string) => boolean;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState<YouTubeVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeVideoBasic[]>([]);
  const [queue, setQueue] = useState<YouTubeVideo[]>([]);
  const [likedSongs, setLikedSongs] = useState<YouTubeVideoBasic[]>([]);
  const [isApiReady, setIsApiReady] = useState(false);
  
  // YouTube Player integration
  const playerRef = useRef<YT.Player | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      
      window.onYouTubeIframeAPIReady = () => {
        setIsApiReady(true);
      };
    } else {
      setIsApiReady(true);
    }
    
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
  
  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (!user?.id) {
        setLikedSongs([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('liked_songs')
          .select('songs(*)')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        const songs = data?.map(item => ({
          id: item.songs.id,
          title: item.songs.title,
          thumbnailUrl: item.songs.thumbnail_url,
          channelTitle: item.songs.channel_title,
          publishedAt: new Date().toISOString(), // Add a default publishedAt
        })) || [];
        
        setLikedSongs(songs);
      } catch (error) {
        console.error('Error loading liked songs:', error);
      }
    };
    
    fetchLikedSongs();
  }, [user]);
  
  useEffect(() => {
    const fetchRecentlyPlayed = async () => {
      if (!user?.id) {
        setRecentlyPlayed([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('recently_played')
          .select('songs(*)')
          .eq('user_id', user.id)
          .order('played_at', { ascending: false })
          .limit(20);
          
        if (error) throw error;
        
        const songs = data?.map(item => ({
          id: item.songs.id,
          title: item.songs.title,
          thumbnailUrl: item.songs.thumbnail_url,
          channelTitle: item.songs.channel_title,
          publishedAt: new Date().toISOString(), // Add a default publishedAt
        })) || [];
        
        setRecentlyPlayed(songs);
      } catch (error) {
        console.error('Error loading recently played:', error);
      }
    };
    
    fetchRecentlyPlayed();
  }, [user]);
  
  useEffect(() => {
    const initPlayer = () => {
      if (currentTrack && playerContainerRef.current && isApiReady && window.YT && window.YT.Player) {
        try {
          if (playerRef.current) {
            playerRef.current.loadVideoById(currentTrack.id);
            if (isPlaying) {
              playerRef.current.playVideo();
            } else {
              playerRef.current.pauseVideo();
            }
          } else {
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

    if (isApiReady && currentTrack) {
      initPlayer();
    }
  }, [currentTrack, isApiReady]);
  
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
  
  useEffect(() => {
    if (playerRef.current && isApiReady && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.setVolume(volume * 100);
      } catch (error) {
        console.error("Error setting volume:", error);
      }
    }
  }, [volume, isApiReady]);
  
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

  const playTrack = async (track: YouTubeVideo) => {
    if (currentTrack && user?.id) {
      try {
        const { data: existingSong } = await supabase
          .from('songs')
          .select('*')
          .eq('id', currentTrack.id)
          .single();
        
        if (!existingSong) {
          await supabase
            .from('songs')
            .insert([{
              id: currentTrack.id,
              title: currentTrack.title,
              thumbnail_url: currentTrack.thumbnailUrl,
              channel_title: currentTrack.channelTitle,
            }]);
        }
        
        await supabase
          .from('recently_played')
          .upsert(
            {
              user_id: user.id,
              song_id: currentTrack.id,
              played_at: new Date().toISOString()
            },
            {
              onConflict: 'user_id,song_id',
              ignoreDuplicates: false
            }
          );
          
        // Update recently played in state
        const updatedRecently = [
          {
            id: currentTrack.id,
            title: currentTrack.title,
            thumbnailUrl: currentTrack.thumbnailUrl,
            channelTitle: currentTrack.channelTitle,
            publishedAt: currentTrack.publishedAt || new Date().toISOString(),
          },
          ...recentlyPlayed.filter(item => item.id !== currentTrack.id)
        ].slice(0, 20);
        
        setRecentlyPlayed(updatedRecently);
      } catch (error) {
        console.error("Error saving recently played:", error);
      }
    }
    
    if (user?.id) {
      try {
        const { data: existingSong } = await supabase
          .from('songs')
          .select('*')
          .eq('id', track.id)
          .single();
        
        if (!existingSong) {
          await supabase
            .from('songs')
            .insert([{
              id: track.id,
              title: track.title,
              thumbnail_url: track.thumbnailUrl,
              channel_title: track.channelTitle,
            }]);
        }
      } catch (error) {
        console.error("Error saving song:", error);
      }
    }
    
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (queue.length > 0) {
      const nextUp = queue[0];
      setQueue(prev => prev.slice(1));
      playTrack(nextUp);
    } else {
      setIsPlaying(false);
    }
  };

  const prevTrack = () => {
    if (recentlyPlayed.length > 0) {
      const prevTrack = recentlyPlayed[0];
      setRecentlyPlayed(prev => prev.slice(1));
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
  
  const toggleLike = async (track: YouTubeVideo) => {
    if (!user?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like songs.",
        variant: "destructive"
      });
      return false;
    }
    
    const isCurrentlyLiked = likedSongs.some(song => song.id === track.id);
    
    try {
      const { data: existingSong } = await supabase
        .from('songs')
        .select('*')
        .eq('id', track.id)
        .single();
      
      if (!existingSong) {
        await supabase
          .from('songs')
          .insert([{
            id: track.id,
            title: track.title,
            thumbnail_url: track.thumbnailUrl,
            channel_title: track.channelTitle,
          }]);
      }
      
      if (isCurrentlyLiked) {
        const { error } = await supabase
          .from('liked_songs')
          .delete()
          .eq('user_id', user.id)
          .eq('song_id', track.id);
          
        if (error) throw error;
        
        setLikedSongs(prev => prev.filter(song => song.id !== track.id));
        
        toast({
          title: "Removed from Liked Songs",
          description: `"${track.title}" removed from your liked songs.`,
        });
        return false;
      } else {
        const { error } = await supabase
          .from('liked_songs')
          .insert([{
            user_id: user.id,
            song_id: track.id,
          }]);
          
        if (error) throw error;
        
        // Add to liked songs state
        const newLikedSong = {
          id: track.id,
          title: track.title,
          thumbnailUrl: track.thumbnailUrl,
          channelTitle: track.channelTitle,
          publishedAt: track.publishedAt || new Date().toISOString(),
        };
        
        setLikedSongs(prev => [...prev, newLikedSong]);
        
        toast({
          title: "Added to Liked Songs",
          description: `"${track.title}" added to your liked songs.`,
        });
        return true;
      }
    } catch (error) {
      console.error("Error toggling liked song:", error);
      toast({
        title: "Error",
        description: "Could not update liked songs.",
        variant: "destructive"
      });
      return isCurrentlyLiked;
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
