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
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(true);

  // Helper function to check if a song is currently playing
  const isCurrentSong = useCallback((songId: string): boolean => {
    return currentTrack?.id === songId;
  }, [currentTrack]);

  // Progress tracking with proper time handling
  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / duration);
        
        // Auto-skip when song ends
        if (newProgress >= 100) {
          if (loopMode === 'one') {
            return 0;
          } else if (loopMode === 'all' || autoPlayEnabled) {
            nextTrack();
            return 0;
          } else {
            setIsPlaying(false);
            return 100;
          }
        }
        
        return Math.min(newProgress, 100);
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, duration, loopMode, autoPlayEnabled]);

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
    setDuration(180); // Default 3 minutes

    setRecentlyPlayed(prev => {
      const newRecentlyPlayed = [song, ...prev.filter(s => s.id !== song.id)].slice(0, 20);
      return newRecentlyPlayed;
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if song exists in database
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
    toast({
      title: "Queue Cleared",
      description: "All songs have been removed from the queue.",
    });
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
      // Play a random song from recently played (excluding current)
      const availableSongs = recentlyPlayed.filter(song => song.id !== currentTrack?.id);
      if (availableSongs.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSongs.length);
        playTrack(availableSongs[randomIndex]);
      }
    } else {
      setIsPlaying(false);
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
  };
  
  const toggleLoopMode = () => {
    setLoopMode(current => {
      if (current === 'none') return 'one';
      if (current === 'one') return 'all';
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
        }
        
        toast({
          title: "Removed from Liked Songs",
          description: `${song.title} has been removed from your liked songs.`,
        });
        
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
        }
        
        setLikedSongs(prev => [...prev, song]);
        
        toast({
          title: "Added to Liked Songs",
          description: `${song.title} has been added to your liked songs.`,
        });
        
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
