
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { YouTubeVideo } from '@/services/youtubeService';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Define the types
type Song = YouTubeVideo;
type LoopMode = 'none' | 'all' | 'one';

interface PlayerContextType {
  currentTrack: Song | null;
  isPlaying: boolean;
  queue: Song[];
  volume: number;
  playbackRate: number;
  recentlyPlayed: Song[];
  likedSongs: Song[];
  progress: number; 
  duration: number; 
  loopMode: LoopMode; 
  shuffleMode: boolean;
  showQueue: boolean;
  autoPlayEnabled: boolean;
  isCurrentSong: (songId: string) => boolean;
  setLikedSongs: React.Dispatch<React.SetStateAction<Song[]>>;
  setRecentlyPlayed: React.Dispatch<React.SetStateAction<Song[]>>;
  playTrack: (song: Song) => void;
  togglePlayPause: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (songId: string) => void;
  clearQueue: () => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (playbackRate: number) => void;
  isLiked: (songId: string) => boolean;
  toggleLike: (song: Song) => Promise<boolean>;
  nextTrack: () => void;
  prevTrack: () => void;
  previousTrack: () => void;
  seekToPosition: (position: number) => void;
  toggleLoopMode: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  setDuration: (duration: number) => void;
  setShowQueue: (show: boolean) => void;
  setAutoPlayEnabled: (enabled: boolean) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loopMode, setLoopMode] = useState<LoopMode>('none');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [lastProgressUpdateTime, setLastProgressUpdateTime] = useState(0);

  // Helper function to check if a song is currently playing
  const isCurrentSong = useCallback((songId: string): boolean => {
    return currentTrack?.id === songId;
  }, [currentTrack]);

  // Set up a progress tracking timer
  useEffect(() => {
    if (!isPlaying) return;
    
    const timer = setInterval(() => {
      if (currentTrack) {
        const now = Date.now();
        if (now - lastProgressUpdateTime > 900) {
          setLastProgressUpdateTime(now);
          const elapsedSeconds = 1 * playbackRate;
          const newProgressIncrement = (elapsedSeconds / duration) * 100;
          
          setProgress(prev => {
            const newProgress = prev + newProgressIncrement;
            if (newProgress >= 100) {
              if (loopMode === 'one') {
                return 0;
              } else if (loopMode === 'all' && queue.length === 0) {
                return 0;
              } else if (queue.length > 0 || autoPlayEnabled) {
                return newProgress;
              }
              return 100;
            }
            return Math.min(newProgress, 100);
          });
        }
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack, duration, playbackRate, loopMode, lastProgressUpdateTime, queue, autoPlayEnabled]);

  // Monitor progress to trigger next track when reaching the end
  useEffect(() => {
    if (progress >= 99.5 && currentTrack) {
      if (loopMode === 'one') {
        setProgress(0);
      } else if (queue.length > 0 || (autoPlayEnabled && recentlyPlayed.length > 0)) {
        nextTrack();
      } else {
        setIsPlaying(false);
      }
    }
  }, [progress, currentTrack, loopMode, queue.length, autoPlayEnabled, recentlyPlayed.length]);

  const playTrack = useCallback(async (song: Song) => {
    if (currentTrack?.id === song.id && isPlaying) {
      setIsPlaying(false);
      return;
    }
    
    if (currentTrack?.id === song.id && !isPlaying) {
      setIsPlaying(true);
      return;
    }

    setCurrentTrack(song);
    setIsPlaying(true);
    setProgress(0);
    setDuration(180);

    setRecentlyPlayed(prev => {
      const newRecentlyPlayed = [song, ...prev.filter(s => s.id !== song.id)].slice(0, 20);
      return newRecentlyPlayed;
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: songExists } = await supabase
          .from('songs')
          .select('id')
          .eq('id', song.id)
          .maybeSingle();
          
        if (!songExists) {
          await supabase.from('songs').insert({
            id: song.id,
            title: song.title,
            channel_title: song.channelTitle,
            thumbnail_url: song.thumbnailUrl,
          });
        }
        
        await supabase.from('recently_played').insert({
          user_id: user.id,
          song_id: song.id,
          played_at: new Date().toISOString()
        });
        
        console.log('Saved song to recently played in Supabase');
      }
    } catch (error) {
      console.error('Error saving recently played song:', error);
    }
  }, [currentTrack, isPlaying]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const addToQueue = (song: Song) => {
    setQueue(prev => [...prev, song]);
    toast({
      title: "Added to Queue",
      description: `${song.title} has been added to your queue.`,
    });
  };

  const removeFromQueue = (songId: string) => {
    setQueue(prev => prev.filter(song => song.id !== songId));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const setVolumeValue = (volume: number) => {
    setVolume(volume);
  };

  const setPlaybackRateValue = (playbackRate: number) => {
    setPlaybackRate(playbackRate);
  };

  const isLiked = useCallback((songId: string): boolean => {
    return likedSongs.some(song => song.id === songId);
  }, [likedSongs]);

  const nextTrack = () => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(prev => prev.slice(1));
      playTrack(nextSong);
    } else if (autoPlayEnabled && recentlyPlayed.length > 1) {
      // Play a random song from recently played
      const randomIndex = Math.floor(Math.random() * (recentlyPlayed.length - 1)) + 1;
      playTrack(recentlyPlayed[randomIndex]);
    }
  };
  
  const prevTrack = () => {
    if (recentlyPlayed.length > 1) {
      const prevSong = recentlyPlayed[1];
      playTrack(prevSong);
    }
  };

  const previousTrack = prevTrack;
  
  const seekToPosition = (newProgress: number) => {
    setProgress(newProgress);
    setLastProgressUpdateTime(Date.now());
  };
  
  const toggleLoopMode = () => {
    setLoopMode(current => {
      if (current === 'none') return 'all';
      if (current === 'all') return 'one';
      return 'none';
    });
  };

  const toggleLoop = toggleLoopMode;

  const toggleShuffle = () => {
    setShuffleMode(prev => !prev);
  };

  const toggleLike = async (song: Song): Promise<boolean> => {
    try {
      const isCurrentlyLiked = isLiked(song.id);
      
      if (isCurrentlyLiked) {
        setLikedSongs(prev => prev.filter(s => s.id !== song.id));
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('liked_songs')
            .delete()
            .eq('user_id', user.id)
            .eq('song_id', song.id);
            
          console.log('Removed song from liked songs in Supabase');
        }
        
        return false;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: songExists } = await supabase
            .from('songs')
            .select('id')
            .eq('id', song.id)
            .maybeSingle();
            
          if (!songExists) {
            await supabase.from('songs').insert({
              id: song.id,
              title: song.title,
              channel_title: song.channelTitle,
              thumbnail_url: song.thumbnailUrl,
            });
          }
          
          await supabase.from('liked_songs').insert({
            user_id: user.id,
            song_id: song.id,
            liked_at: new Date().toISOString()
          });
          
          console.log('Added song to liked songs in Supabase');
        }
        
        setLikedSongs(prev => [...prev, song]);
        return true;
      }
    } catch (error) {
      console.error('Error toggling song like:', error);
      return isLiked(song.id);
    }
  };

  const contextValue = {
    currentTrack,
    isPlaying,
    queue,
    volume,
    playbackRate,
    recentlyPlayed,
    likedSongs,
    progress,
    duration,
    loopMode,
    shuffleMode,
    showQueue,
    autoPlayEnabled,
    isCurrentSong,
    setLikedSongs,
    setRecentlyPlayed,
    playTrack,
    togglePlayPause,
    addToQueue,
    removeFromQueue,
    clearQueue,
    setVolume: setVolumeValue,
    setPlaybackRate: setPlaybackRateValue,
    isLiked,
    toggleLike,
    nextTrack,
    prevTrack,
    previousTrack,
    seekToPosition,
    toggleLoopMode,
    toggleLoop,
    toggleShuffle,
    setDuration,
    setShowQueue,
    setAutoPlayEnabled
  };

  return (
    <PlayerContext.Provider value={contextValue}>
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
